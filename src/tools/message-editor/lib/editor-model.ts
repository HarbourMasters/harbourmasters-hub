import { parseMessageData } from './message-parser';

export type EditorSegment =
  | { type: 'text'; value: string }
  | { type: 'control'; code: number; name: string; args: number[] };

export function messageDataToSegments(data: Uint8Array, isJapanese = false): EditorSegment[] {
  const parsed = parseMessageData(data, isJapanese);
  const segments: EditorSegment[] = [];

  for (const item of parsed) {
    if (item.type === 'control') {
      segments.push({
        type: 'control',
        code: item.bytes[0] ?? 0,
        name: item.value,
        args: item.bytes.slice(1),
      });
    } else {
      segments.push({ type: 'text', value: item.value });
    }
  }

  return normalizeSegments(segments);
}

export function segmentsToMessageData(segments: EditorSegment[], _isJapanese = false): Uint8Array {
  const bytes: number[] = [];

  for (const seg of segments) {
    if (seg.type === 'text') {
      for (let i = 0; i < seg.value.length; i++) {
        bytes.push(seg.value.charCodeAt(i));
      }
    } else {
      bytes.push(seg.code);
      for (const arg of seg.args) {
        bytes.push(arg & 0xFF);
      }
    }
  }

  return new Uint8Array(bytes);
}

export function insertSegmentAt(
  segments: EditorSegment[],
  index: number,
  segment: EditorSegment,
): EditorSegment[] {
  const next = [...segments];
  next.splice(index, 0, segment);
  return normalizeSegments(next);
}

export function removeSegmentAt(segments: EditorSegment[], index: number): EditorSegment[] {
  const next = [...segments];
  next.splice(index, 1);
  return normalizeSegments(next);
}

export function updateSegmentAt(
  segments: EditorSegment[],
  index: number,
  updater: (seg: EditorSegment) => EditorSegment,
): EditorSegment[] {
  const next = [...segments];
  next[index] = updater(next[index]!);
  return normalizeSegments(next);
}

export function normalizeSegments(segments: EditorSegment[]): EditorSegment[] {
  const result: EditorSegment[] = [];

  for (const seg of segments) {
    if (seg.type === 'text' && seg.value.length === 0) continue;

    const last = result[result.length - 1];
    if (last && last.type === 'text' && seg.type === 'text') {
      last.value += seg.value;
    } else {
      result.push(seg.type === 'text' ? { ...seg } : { ...seg });
    }
  }

  return result;
}

/** Find which segment the cursor is in, given a character offset into the rendered content. */
export function findSegmentAtOffset(
  segments: EditorSegment[],
  offset: number,
): { index: number; innerOffset: number } {
  let counted = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const len = seg.type === 'text' ? seg.value.length : 1; // pills count as 1 unit

    if (counted + len > offset) {
      return { index: i, innerOffset: offset - counted };
    }
    counted += len;
  }

  return { index: segments.length - 1, innerOffset: 0 };
}
