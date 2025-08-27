import type { KeyboardEvent } from "react"

type FlipCardProps = {
  front: React.ReactNode
  back: React.ReactNode
  description?: string | null
  flipped: boolean
  onToggle: () => void
  // optional ref so parent can detect focus/containment
  containerRef?: React.RefObject<HTMLDivElement | null>
}

export default function FlipCard({ front, back, description, flipped, onToggle, containerRef }: FlipCardProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const k = e.key.toLowerCase()
    if (k === " " || k === "enter") {
      e.preventDefault()
      onToggle()
    }
  }

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        tabIndex={0}
        role="button"
        aria-pressed={flipped}
        aria-label="Flip card"
        onKeyDown={onKeyDown}
        onClick={onToggle}
        className={[
          "mx-auto h-[280px] sm:h-[320px] md:h-[340px] w-full max-w-[760px] cursor-pointer select-none relative z-50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
        ].join(' ')}
        style={{ perspective: "1600px" }}
      >
        <div
          className={[
            // use theme variables for card background/foreground and border
            "relative h-full w-full rounded-2xl transition-transform duration-500 z-10 transform-gpu",
            "bg-[var(--color-card)] text-[var(--color-card-foreground)] border border-[var(--color-border)] shadow-lg",
          ].join(" ")}
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : undefined }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex items-center justify-center p-6 rounded-2xl pointer-events-auto"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-center">
              <div className="text-2xl font-semibold break-words">{front}</div>
              {description ? <div className="mt-3 text-sm text-[var(--color-muted-foreground)]">Mô tả: {description}</div> : null}
              <div className="mt-6 text-xs text-[var(--color-muted-foreground)]">Nhấn để lật (Click / Space / Enter)</div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center p-6 rounded-2xl pointer-events-auto"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-center">
              <div className="text-xl font-medium break-words">{back}</div>
              <div className="mt-6 text-xs text-[var(--color-muted-foreground)]">Nhấn để lật lại</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
