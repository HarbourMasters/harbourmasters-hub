import { X, Music, Package, ArrowRight, CornerDownLeft, BoxSelect, Clock, Hash } from 'lucide-react';
import type { EditorSegment } from '../../lib/editor-model';
import { CTRL, MSG_COLORS, ITEM_ICONS, HIGHSCORE_TYPES } from '../../lib/control-codes';

interface EditorPillProps {
  segment: EditorSegment & { type: 'control' };
  textboxType: number;
  iconUrl?: string;
  onRemove: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  draggable?: boolean;
}

function getSegmentMeta(seg: EditorSegment & { type: 'control' }): {
  label: string;
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
} {
  switch (seg.code) {
    case CTRL.COLOR: {
      const colorId = seg.args[0] ?? 0;
      // Map control code color IDs to the record keys (0x40 + id)
      const css = colorId >= 0x40
        ? (colorId === 0x40 ? '#FFFFFF' : colorId === 0x41 ? '#FF3030' : colorId === 0x42 ? '#30FF30' : colorId === 0x43 ? '#3030FF' : colorId === 0x44 ? '#30FFFF' : colorId === 0x45 ? '#FF30FF' : colorId === 0x46 ? '#FFFF30' : '#000000')
        : MSG_COLORS[colorId]?.css ?? '#FFFFFF';
      const name = colorId >= 0x40
        ? ['Default', 'Red', 'Green', 'Blue', 'Cyan', 'Purple', 'Yellow', 'Black'][colorId - 0x40] ?? `Color ${colorId}`
        : MSG_COLORS[colorId]?.name ?? `Color ${colorId}`;
      return {
        label: name,
        icon: <span className="w-3 h-3 rounded-full inline-block ring-1 ring-white/20 flex-shrink-0" style={{ backgroundColor: css }} />,
        bgClass: '',
        textClass: '',
        // Override: custom style below
      };
    }

    case CTRL.ITEM_ICON: {
      const itemId = seg.args[0] ?? 0;
      const name = ITEM_ICONS[itemId] ?? `Item 0x${itemId.toString(16).toUpperCase()}`;
      return {
        label: name,
        icon: <Package className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-amber-500/15 text-amber-300',
        textClass: 'text-amber-300',
      };
    }

    case CTRL.SFX: {
      const sfxId = (seg.args[0] << 8) | (seg.args[1] ?? 0);
      return {
        label: `SFX 0x${sfxId.toString(16).toUpperCase()}`,
        icon: <Music className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-purple-500/15 text-purple-300',
        textClass: 'text-purple-300',
      };
    }

    case CTRL.NEWLINE:
      return {
        label: 'Line Break',
        icon: <CornerDownLeft className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
        textClass: '',
      };

    case CTRL.BOX_BREAK:
      return {
        label: 'New Box',
        icon: <BoxSelect className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-blue-500/15 text-blue-300',
        textClass: 'text-blue-300',
      };

    case CTRL.BOX_BREAK_DELAYED:
      return {
        label: 'New Box (Delay)',
        icon: <BoxSelect className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-blue-500/15 text-blue-300',
        textClass: 'text-blue-300',
      };

    case CTRL.END:
      return {
        label: 'End',
        icon: <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block flex-shrink-0" />,
        bgClass: 'bg-red-500/15 text-red-300',
        textClass: 'text-red-300',
      };

    case CTRL.NAME:
      return {
        label: 'Player Name',
        icon: <span className="text-[10px] font-bold flex-shrink-0">P</span>,
        bgClass: 'bg-green-500/15 text-green-300',
        textClass: 'text-green-300',
      };

    case CTRL.TWO_CHOICE:
      return {
        label: '2 Choices',
        icon: <ArrowRight className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-orange-500/15 text-orange-300',
        textClass: 'text-orange-300',
      };

    case CTRL.THREE_CHOICE:
      return {
        label: '3 Choices',
        icon: <ArrowRight className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-orange-500/15 text-orange-300',
        textClass: 'text-orange-300',
      };

    case CTRL.PERSISTENT:
      return {
        label: 'Persistent',
        icon: <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block flex-shrink-0" />,
        bgClass: 'bg-yellow-500/15 text-yellow-300',
        textClass: 'text-yellow-300',
      };

    case CTRL.UNSKIPPABLE:
      return {
        label: 'Unskippable',
        icon: <span className="text-[9px] font-bold flex-shrink-0">!</span>,
        bgClass: 'bg-red-500/15 text-red-300',
        textClass: 'text-red-300',
      };

    case CTRL.AWAIT_BUTTON_PRESS:
      return {
        label: 'Wait Button',
        icon: <span className="text-[10px] font-bold flex-shrink-0">A</span>,
        bgClass: 'bg-sky-500/15 text-sky-300',
        textClass: 'text-sky-300',
      };

    case CTRL.FADE:
      return {
        label: 'Fade Out',
        icon: <span className="text-[9px] flex-shrink-0">~</span>,
        bgClass: 'bg-gray-500/15 text-gray-300',
        textClass: 'text-gray-300',
      };

    case CTRL.FADE2:
      return {
        label: 'Fade Out 2',
        icon: <span className="text-[9px] flex-shrink-0">~</span>,
        bgClass: 'bg-gray-500/15 text-gray-300',
        textClass: 'text-gray-300',
      };

    case CTRL.QUICKTEXT_ENABLE:
      return {
        label: 'Quick Text On',
        icon: <span className="text-[9px] font-bold flex-shrink-0">{'>>'}</span>,
        bgClass: 'bg-teal-500/15 text-teal-300',
        textClass: 'text-teal-300',
      };

    case CTRL.QUICKTEXT_DISABLE:
      return {
        label: 'Quick Text Off',
        icon: <span className="text-[9px] font-bold flex-shrink-0">{'||'}</span>,
        bgClass: 'bg-teal-500/15 text-teal-300',
        textClass: 'text-teal-300',
      };

    case CTRL.EVENT:
      return {
        label: 'Event',
        icon: <span className="text-[9px] font-bold flex-shrink-0">E</span>,
        bgClass: 'bg-violet-500/15 text-violet-300',
        textClass: 'text-violet-300',
      };

    case CTRL.OCARINA:
      return {
        label: 'Ocarina',
        icon: <Music className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-cyan-500/15 text-cyan-300',
        textClass: 'text-cyan-300',
      };

    case CTRL.TEXT_SPEED:
      return {
        label: `Speed ${seg.args[0] ?? 2}`,
        icon: <Clock className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
        textClass: '',
      };

    case CTRL.SHIFT:
      return {
        label: `Shift +${seg.args[0] ?? 0}px`,
        icon: <ArrowRight className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
        textClass: '',
      };

    case CTRL.HIGHSCORE: {
      const hsId = seg.args[0] ?? 0;
      const name = HIGHSCORE_TYPES[hsId] ?? `High Score ${hsId}`;
      return {
        label: name,
        icon: <Hash className="w-3 h-3 flex-shrink-0" />,
        bgClass: 'bg-emerald-500/15 text-emerald-300',
        textClass: 'text-emerald-300',
      };
    }

    case CTRL.MARATHON_TIME:
      return { label: 'Marathon Time', icon: <Clock className="w-3 h-3 flex-shrink-0" />, bgClass: 'bg-emerald-500/15 text-emerald-300', textClass: 'text-emerald-300' };

    case CTRL.RACE_TIME:
      return { label: 'Race Time', icon: <Clock className="w-3 h-3 flex-shrink-0" />, bgClass: 'bg-emerald-500/15 text-emerald-300', textClass: 'text-emerald-300' };

    case CTRL.POINTS:
      return { label: 'Points', icon: <Hash className="w-3 h-3 flex-shrink-0" />, bgClass: 'bg-emerald-500/15 text-emerald-300', textClass: 'text-emerald-300' };

    case CTRL.TOKENS:
      return { label: 'Skulltula Tokens', icon: <Hash className="w-3 h-3 flex-shrink-0" />, bgClass: 'bg-emerald-500/15 text-emerald-300', textClass: 'text-emerald-300' };

    case CTRL.FISH_INFO:
      return { label: 'Fish Info', icon: <Hash className="w-3 h-3 flex-shrink-0" />, bgClass: 'bg-emerald-500/15 text-emerald-300', textClass: 'text-emerald-300' };

    case CTRL.TIME:
      return { label: 'Time', icon: <Clock className="w-3 h-3 flex-shrink-0" />, bgClass: 'bg-emerald-500/15 text-emerald-300', textClass: 'text-emerald-300' };

    case CTRL.TEXTID:
      return { label: `Jump to 0x${((seg.args[0] ?? 0) << 8 | (seg.args[1] ?? 0)).toString(16).toUpperCase()}`, icon: <ArrowRight className="w-3 h-3 flex-shrink-0" />, bgClass: 'bg-blue-500/15 text-blue-300', textClass: 'text-blue-300' };

    case CTRL.BACKGROUND:
      return { label: 'Background', icon: <BoxSelect className="w-3 h-3 flex-shrink-0" />, bgClass: 'bg-gray-500/15 text-gray-300', textClass: 'text-gray-300' };

    default:
      return {
        label: seg.name,
        icon: null,
        bgClass: 'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
        textClass: '',
      };
  }
}

export function EditorPill({ segment, textboxType: _textboxType, iconUrl, onRemove, onDragStart, onDragEnd, draggable }: EditorPillProps) {
  const meta = getSegmentMeta(segment);

  const isColor = segment.code === CTRL.COLOR;
  const colorId = isColor ? (segment.args[0] ?? 0) : 0;
  const colorCss = isColor
    ? (colorId >= 0x40
      ? ['rgb(255,255,255)', 'rgb(255,60,60)', 'rgb(0,255,0)', 'rgb(80,90,255)', 'rgb(100,180,255)', 'rgb(255,150,180)', 'rgb(225,255,50)', 'rgb(0,0,0)'][colorId - 0x40] ?? '#fff'
      : MSG_COLORS[colorId]?.css ?? '#fff')
    : undefined;

  return (
    <span
      contentEditable={false}
      draggable={draggable ?? true}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'pill');
        onDragStart?.();
      }}
      onDragEnd={() => onDragEnd?.()}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium align-middle select-all group relative ${
        draggable !== false ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      } ${
        isColor ? '' : meta.bgClass
      }`}
      style={isColor ? {
        backgroundColor: colorCss ? `${colorCss}20` : undefined,
        color: colorCss,
        border: `1px solid ${colorCss}40`,
      } : undefined}
    >
      {iconUrl && segment.code === CTRL.ITEM_ICON ? (
        <img src={iconUrl} className="w-4 h-4 object-contain flex-shrink-0" style={{ imageRendering: 'pixelated' }} />
      ) : (
        meta.icon
      )}
      <span className="truncate max-w-[100px]">{meta.label}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-current hover:text-red-400 flex-shrink-0"
        tabIndex={-1}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
