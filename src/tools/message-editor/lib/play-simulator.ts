import { CTRL, getExtraBytes } from './control-codes';
import { beepTextChar, beepAdvance, beepEnd, beepBoxOpen, beepCursor, resumeAudio } from './audio-beep';
import type { SFXPlayer } from '@/lib/audio';

export type SimPhase = 'idle' | 'box_opening' | 'playing' | 'box_wait' | 'choosing' | 'fading' | 'finished';

export interface SimulationState {
  phase: SimPhase;
  charIndex: number;
  totalChars: number;
  currentBoxIndex: number;
  textSpeed: number;
  unskippable: boolean;
  boxOpenFrame: number;
  fadeAlpha: number;
  choiceCount: 0 | 2 | 3;
  selectedChoice: number;
}

export type SimulationEventType = 'char' | 'boxWait' | 'boxAdvance' | 'boxOpening' | 'end' | 'sfx' | 'fade' | 'tick' | 'choice';

export interface SimulationEvent {
  type: SimulationEventType;
  charIndex?: number;
  boxIndex?: number;
  sfxId?: number;
  boxOpenFrame?: number;
  fadeAlpha?: number;
  choiceCount?: number;
  selectedChoice?: number;
}

type EventListener = (event: SimulationEvent) => void;

// Box opening animation coefficients from z_message_PAL.c Message_GrowTextbox
const BOX_OPEN_WIDTH_COEFFS  = [1.2, 1.5, 1.8, 2.0, 2.1, 2.2, 2.1, 2.0];
const BOX_OPEN_HEIGHT_COEFFS = [0.6, 0.75, 0.9, 1.0, 1.05, 1.1, 1.05, 1.0];
const BOX_OPEN_FRAMES = 8;
const BOX_OPEN_FRAME_MS = 50; // ~20fps matching N64

// Pre-parsed box boundaries from the message data
interface BoxBoundary {
  start: number; // byte offset start
  end: number;   // byte offset end (exclusive of the BOX_BREAK byte itself)
  breakCode?: number; // CTRL.BOX_BREAK or CTRL.BOX_BREAK_DELAYED at end
  delayFrames?: number; // for BOX_BREAK_DELAYED: auto-advance delay in frames
}

export class PlaySimulator {
  private data: Uint8Array;
  private sfxPlayer: SFXPlayer | null;
  private phase: SimPhase = 'idle';
  private charIndex = 0;
  private totalChars = 0;
  private currentBoxIndex = 0;
  private textSpeed = 2;
  private unskippable = false;
  private boxOpenFrame = 0;
  private fadeAlpha = 1.0;
  private fadeDuration = 0;
  private fadeElapsed = 0;
  private delayedAdvanceFrames = 0;
  private choiceCount: 0 | 2 | 3 = 0;
  private selectedChoice = 0;
  private animFrameId: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private listeners = new Set<EventListener>();
  private boxes: BoxBoundary[] = [];
  private charsPerBox: number[] = []; // cumulative char count at end of each box

  constructor(data: Uint8Array, sfxPlayer?: SFXPlayer | null) {
    this.data = data;
    this.sfxPlayer = sfxPlayer ?? null;
    this.parseBoxes();
    this.countTotalChars();
  }

  private parseBoxes(): void {
    this.boxes = [];
    let start = 0;
    let i = 0;
    while (i < this.data.length) {
      const byte = this.data[i];
      if (byte === CTRL.BOX_BREAK) {
        this.boxes.push({ start, end: i, breakCode: byte });
        start = i + 1;
        i++;
      } else if (byte === CTRL.BOX_BREAK_DELAYED) {
        const delay = this.data[i + 1] ?? 0;
        this.boxes.push({ start, end: i, breakCode: byte, delayFrames: delay });
        start = i + 1 + getExtraBytes(byte);
        i += 1 + getExtraBytes(byte);
      } else if (byte < 0x20) {
        i += 1 + getExtraBytes(byte);
      } else {
        i++;
      }
    }
    if (start < this.data.length) {
      this.boxes.push({ start, end: this.data.length });
    }
    if (this.boxes.length === 0) {
      this.boxes.push({ start: 0, end: 0 });
    }
  }

  private countTotalChars(): void {
    this.totalChars = 0;
    this.charsPerBox = [];
    for (const box of this.boxes) {
      let count = 0;
      let i = box.start;
      while (i < box.end) {
        const byte = this.data[i];
        if (byte < 0x20) {
          i += 1 + getExtraBytes(byte);
        } else {
          count++;
          i++;
        }
      }
      this.totalChars += count;
      this.charsPerBox.push(this.totalChars);
    }
  }

  get state(): SimulationState {
    return {
      phase: this.phase,
      charIndex: this.charIndex,
      totalChars: this.totalChars,
      currentBoxIndex: this.currentBoxIndex,
      textSpeed: this.textSpeed,
      unskippable: this.unskippable,
      boxOpenFrame: this.boxOpenFrame,
      fadeAlpha: this.fadeAlpha,
      choiceCount: this.choiceCount,
      selectedChoice: this.selectedChoice,
    };
  }

  onEvent(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: SimulationEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  play(): void {
    resumeAudio();
    if (this.phase === 'finished') return;
    if (this.phase === 'box_wait') {
      this.advanceFromWait();
      return;
    }
    if (this.phase === 'playing' || this.phase === 'box_opening') return;

    this.phase = 'box_opening';
    this.boxOpenFrame = 0;
    this.lastTime = performance.now();
    this.accumulator = 0;
    beepBoxOpen();
    this.emit({ type: 'boxOpening', boxOpenFrame: 0, boxIndex: this.currentBoxIndex });
    this.tickBoxOpen();
  }

  /** Called when user clicks during box_wait to advance to next box */
  advanceInput(): void {
    if (this.phase === 'box_wait') {
      this.advanceFromWait();
    }
  }

  private advanceFromWait(): void {
    resumeAudio();
    beepAdvance();
    this.currentBoxIndex++;
    this.phase = 'box_opening';
    this.boxOpenFrame = 0;
    this.lastTime = performance.now();
    this.accumulator = 0;
    beepBoxOpen();
    this.emit({ type: 'boxAdvance', boxIndex: this.currentBoxIndex });
    this.emit({ type: 'boxOpening', boxOpenFrame: 0, boxIndex: this.currentBoxIndex });
    this.tickBoxOpen();
  }

  pause(): void {
    if (this.phase === 'playing') {
      this.phase = 'idle';
    }
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  reset(): void {
    this.pause();
    this.charIndex = 0;
    this.currentBoxIndex = 0;
    this.textSpeed = 2;
    this.unskippable = false;
    this.boxOpenFrame = 0;
    this.fadeAlpha = 1.0;
    this.delayedAdvanceFrames = 0;
    this.choiceCount = 0;
    this.selectedChoice = 0;
    this.phase = 'idle';
    this.emit({ type: 'char', charIndex: 0 });
  }

  private tickBoxOpen = (): void => {
    if (this.phase !== 'box_opening') return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    this.accumulator += delta;

    while (this.accumulator >= BOX_OPEN_FRAME_MS && this.phase === 'box_opening') {
      this.boxOpenFrame++;
      this.accumulator -= BOX_OPEN_FRAME_MS;

      if (this.boxOpenFrame >= BOX_OPEN_FRAMES) {
        this.phase = 'playing';
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.emit({ type: 'tick' });
        this.tick();
        return;
      }

      this.emit({ type: 'boxOpening', boxOpenFrame: this.boxOpenFrame, boxIndex: this.currentBoxIndex });
    }

    if (this.phase === 'box_opening') {
      this.animFrameId = requestAnimationFrame(this.tickBoxOpen);
    }
  };

  /** Get box opening animation scale factors for the current frame */
  static getBoxOpenScale(frame: number): { scaleX: number; scaleY: number; alpha: number } {
    const idx = Math.min(frame, BOX_OPEN_FRAMES - 1);
    const wCoeff = BOX_OPEN_WIDTH_COEFFS[idx] ?? 2.0;
    const hCoeff = BOX_OPEN_HEIGHT_COEFFS[idx] ?? 1.0;
    return {
      scaleX: wCoeff / 2.0, // normalized: 2.0 = full width (1.0 scale)
      scaleY: hCoeff,
      alpha: Math.min(1, (frame + 1) / BOX_OPEN_FRAMES),
    };
  }

  private tick = (): void => {
    if (this.phase !== 'playing') return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    const msPerChar = Math.max(16, 200 / this.textSpeed);
    this.accumulator += delta;

    while (this.accumulator >= msPerChar && this.phase === 'playing') {
      this.advanceOneChar();
      this.accumulator -= msPerChar;
    }

    if (this.phase === 'playing') {
      this.animFrameId = requestAnimationFrame(this.tick);
    }
  };

  private advanceOneChar(): void {
    // Walk through data up to current charIndex, processing control codes
    let i = 0;
    let charCount = 0;
    let boxIdx = 0;

    while (i < this.data.length && charCount < this.charIndex) {
      const byte = this.data[i];
      if (byte === CTRL.BOX_BREAK) {
        boxIdx++;
        i++;
      } else if (byte === CTRL.BOX_BREAK_DELAYED) {
        boxIdx++;
        i += 1 + getExtraBytes(byte);
      } else if (byte < 0x20) {
        this.processControlCode(byte, i);
        i += 1 + getExtraBytes(byte);
      } else {
        charCount++;
        i++;
      }
    }

    // Now advance past control codes to find the next printable char
    while (i < this.data.length) {
      const byte = this.data[i];

      if (byte === CTRL.BOX_BREAK) {
        this.currentBoxIndex = boxIdx;
        this.phase = 'box_wait';
        this.emit({ type: 'boxWait', boxIndex: boxIdx });
        if (this.animFrameId !== null) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
        return;
      }

      if (byte === CTRL.BOX_BREAK_DELAYED) {
        const delay = this.data[i + 1] ?? 0;
        this.currentBoxIndex = boxIdx;
        this.phase = 'box_wait';
        this.delayedAdvanceFrames = delay;
        this.emit({ type: 'boxWait', boxIndex: boxIdx });
        if (this.animFrameId !== null) {
          cancelAnimationFrame(this.animFrameId);
          this.animFrameId = null;
        }
        // Auto-advance after delay
        this.startDelayedAdvance();
        return;
      }

      if (byte < 0x20) {
        if (byte === CTRL.UNSKIPPABLE) {
          this.unskippable = true;
        }
        if (byte === CTRL.QUICKTEXT_ENABLE) {
          this.textSpeed = 20; // Fast-forward speed
        }
        if (byte === CTRL.QUICKTEXT_DISABLE) {
          this.textSpeed = 2;
        }
        if (byte === CTRL.TWO_CHOICE) {
          this.phase = 'choosing';
          this.choiceCount = 2;
          this.selectedChoice = 0;
          this.currentBoxIndex = boxIdx;
          this.emit({ type: 'choice', choiceCount: 2, selectedChoice: 0 });
          if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
          }
          return;
        }
        if (byte === CTRL.THREE_CHOICE) {
          this.phase = 'choosing';
          this.choiceCount = 3;
          this.selectedChoice = 0;
          this.currentBoxIndex = boxIdx;
          this.emit({ type: 'choice', choiceCount: 3, selectedChoice: 0 });
          if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
          }
          return;
        }
        if (byte === CTRL.SFX && i + 2 < this.data.length) {
          const sfxId = (this.data[i + 1] << 8) | this.data[i + 2];
          this.emit({ type: 'sfx', sfxId });
          void this.sfxPlayer?.play(`audio/samples/${sfxId.toString(16).toUpperCase().padStart(4, '0')}.aifc`);
        }
        if (byte === CTRL.TEXT_SPEED && i + 1 < this.data.length) {
          this.textSpeed = this.data[i + 1];
        }
        if (byte === CTRL.FADE && i + 1 < this.data.length) {
          this.fadeDuration = (this.data[i + 1] ?? 20) * 50;
          this.fadeElapsed = 0;
          this.startFade();
          return;
        }
        if (byte === CTRL.FADE2 && i + 2 < this.data.length) {
          const duration = ((this.data[i + 1] ?? 0) << 8) | this.data[i + 2];
          this.fadeDuration = duration * 50;
          this.fadeElapsed = 0;
          this.startFade();
          return;
        }
        if (byte === CTRL.END) {
          this.phase = 'finished';
          this.charIndex = charCount;
          this.currentBoxIndex = boxIdx;
          beepEnd();
          this.emit({ type: 'end', charIndex: this.charIndex });
          if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
          }
          return;
        }
        i += 1 + getExtraBytes(byte);
      } else {
        // Printable char
        this.charIndex = charCount + 1;
        this.currentBoxIndex = boxIdx;
        beepTextChar();

        this.emit({ type: 'char', charIndex: this.charIndex, boxIndex: boxIdx });

        if (this.charIndex >= this.totalChars) {
          this.phase = 'finished';
          beepEnd();
          this.emit({ type: 'end', charIndex: this.charIndex });
          if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
          }
        }
        return;
      }
    }

    // Ran out of data
    this.phase = 'finished';
    beepEnd();
    this.emit({ type: 'end', charIndex: this.charIndex });
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private startDelayedAdvance(): void {
    if (this.delayedAdvanceFrames <= 0) return;
    const totalMs = this.delayedAdvanceFrames * 50;
    const startTime = performance.now();
    const tick = () => {
      if (this.phase !== 'box_wait') return;
      const elapsed = performance.now() - startTime;
      if (elapsed >= totalMs) {
        this.delayedAdvanceFrames = 0;
        this.advanceFromWait();
        return;
      }
      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  private startFade(): void {
    this.phase = 'fading';
    this.fadeAlpha = 1.0;
    this.lastTime = performance.now();
    this.emit({ type: 'fade', fadeAlpha: 1.0 });
    this.tickFade();
  }

  private tickFade = (): void => {
    if (this.phase !== 'fading') return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    this.fadeElapsed += delta;

    this.fadeAlpha = Math.max(0, 1.0 - this.fadeElapsed / this.fadeDuration);
    this.emit({ type: 'fade', fadeAlpha: this.fadeAlpha });

    if (this.fadeAlpha <= 0) {
      this.phase = 'finished';
      beepEnd();
      this.emit({ type: 'end', charIndex: this.charIndex });
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      return;
    }

    this.animFrameId = requestAnimationFrame(this.tickFade);
  };

  private processControlCode(byte: number, offset: number): void {
    if (byte === CTRL.TEXT_SPEED && offset + 1 < this.data.length) {
      this.textSpeed = this.data[offset + 1];
    }
    if (byte === CTRL.UNSKIPPABLE) {
      this.unskippable = true;
    }
    if (byte === CTRL.SFX && offset + 2 < this.data.length) {
      const sfxId = (this.data[offset + 1] << 8) | this.data[offset + 2];
      this.emit({ type: 'sfx', sfxId });
    }
  }

  /** Move choice selection up/down during 'choosing' phase */
  selectChoice(index: number): void {
    if (this.phase !== 'choosing') return;
    const clamped = Math.max(0, Math.min(index, this.choiceCount - 1));
    if (clamped === this.selectedChoice) return;
    this.selectedChoice = clamped;
    beepCursor();
    this.emit({ type: 'choice', choiceCount: this.choiceCount, selectedChoice: this.selectedChoice });
  }

  /** Confirm the current choice selection */
  confirmChoice(): void {
    if (this.phase !== 'choosing') return;
    // In the game, the choice would affect game state.
    // For the simulator, just end the message after selection.
    beepAdvance();
    this.phase = 'finished';
    this.emit({ type: 'end', charIndex: this.charIndex });
  }

  destroy(): void {
    this.pause();
    this.listeners.clear();
  }
}
