import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface HoverPopoverProps {
  children: ReactNode
  content: ReactNode
  title: string
  align?: 'center' | 'start' | 'end'
  className?: string
}

const PANEL_WIDTH = 280
const PANEL_GAP = 8
const VIEWPORT_MARGIN = 8
const HIDE_DELAY = 120

export function HoverPopover({ children, content, title, align = 'center', className }: HoverPopoverProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | null>(null)

  const cancelHide = () => {
    if (hideTimer.current !== null) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }
  const show = () => {
    cancelHide()
    setOpen(true)
  }
  const scheduleHide = () => {
    cancelHide()
    hideTimer.current = window.setTimeout(() => setOpen(false), HIDE_DELAY)
  }

  useEffect(() => () => cancelHide(), [])

  // Position the panel under the trigger, clamped to the viewport.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    let left =
      align === 'center' ? rect.left + rect.width / 2 - PANEL_WIDTH / 2 :
      align === 'end' ? rect.right - PANEL_WIDTH :
      rect.left
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN))
    setCoords({ top: rect.bottom + PANEL_GAP, left })
  }, [open, align])

  // Dismiss on outside pointer, scroll, or Escape.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (
        (triggerRef.current?.contains(target) ?? false) ||
        (panelRef.current?.contains(target) ?? false)
      ) {
        return
      }
      setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onScroll() {
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex ${className ?? ''}`}
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
    >
      <span
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={title}
        onClick={(e) => {
          // Don't activate an ancestor click handler (e.g. the accordion toggle).
          e.stopPropagation()
          cancelHide()
          setOpen(o => !o)
        }}
        onFocus={show}
        onBlur={scheduleHide}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
            return
          }
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            setOpen(o => !o)
          }
        }}
        className="inline-flex items-center cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-background)]"
      >
        {children}
      </span>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label={title}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
          style={{ position: 'fixed', top: `${coords.top}px`, left: `${coords.left}px`, width: `${PANEL_WIDTH}px` }}
          className="z-[100]"
        >
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl p-3 animate-fade-in">
            {content}
          </div>
        </div>,
        document.body
      )}
    </span>
  )
}
