import { useState } from 'react';
import { X } from 'lucide-react';

interface ControlCodeChipProps {
  code: string;
  args?: string[];
  color?: string;
  icon?: React.ReactNode;
  onRemove?: () => void;
  onArgsChange?: (args: string[]) => void;
}

export function ControlCodeChip({ code, args, color, icon, onRemove, onArgsChange }: ControlCodeChipProps) {
  const [editing, setEditing] = useState(false);
  const [editArgs, setEditArgs] = useState(args ?? []);

  const hasArgs = args && args.length > 0;
  const displayArgs = hasArgs ? `(${args.join(', ')})` : '';

  const handleArgEdit = (idx: number, value: string) => {
    const next = [...editArgs];
    next[idx] = value;
    setEditArgs(next);
  };

  const handleArgCommit = () => {
    setEditing(false);
    if (onArgsChange) onArgsChange(editArgs);
  };

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-semibold align-middle group relative cursor-default select-none"
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {icon}
      <span className="font-mono">{code}</span>
      {hasArgs && !editing && (
        <span
          className="text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text)]"
          onClick={() => { setEditing(true); setEditArgs(args); }}
        >
          {displayArgs}
        </span>
      )}
      {editing && (
        <span className="flex items-center gap-1">
          {editArgs.map((arg, idx) => (
            <input
              key={idx}
              type="text"
              value={arg}
              onChange={e => handleArgEdit(idx, e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleArgCommit(); if (e.key === 'Escape') setEditing(false); }}
              onBlur={handleArgCommit}
              className="w-14 px-1 py-0 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[10px] font-mono text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]/50"
              autoFocus
            />
          ))}
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
