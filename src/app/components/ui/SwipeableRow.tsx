import { useState, useRef } from "react";
import { Trash2 } from "lucide-react";

interface SwipeableRowProps {
  onRemove: () => void;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  trashText?: string;
}

export function SwipeableRow({ onRemove, onClick, children, className = "", trashText = "REMOVE" }: SwipeableRowProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const swipeOffsetRef = useRef(0);
  const blockNextClickRef = useRef(false);

  /**
   * This resets the swipe offset and touch start x.
   */
  const resetSwipe = () => {
    touchStartX.current = null;
    swipeOffsetRef.current = 0;
    setSwipeOffset(0);
    setIsDragging(false);
  };

  /**
   * This handles the touch start event.
   */
  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    touchStartX.current = event.touches[0].clientX;
    blockNextClickRef.current = false;
    setIsDragging(true);
  };

  /**
   * This handles the touch move event. What happens is that the swipe offset is updated 
   * based on the touch position.
   */
  const handleTouchMove = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (touchStartX.current === null) return;

    const deltaX = event.touches[0].clientX - touchStartX.current;
    const nextOffset = deltaX < 0 ? Math.max(deltaX, -160) : 0;

    swipeOffsetRef.current = nextOffset;
    setSwipeOffset(nextOffset);
  };

  /**
   * This handles the touch end event. If the swipe offset is less than -90px, 
   * the onRemove function is called and the swipe is reset.
   */
  const handleTouchEnd = () => {
    setIsDragging(false);

    if (swipeOffsetRef.current < -90) {
      blockNextClickRef.current = true;
      onRemove();
      // Reset swipe after a short delay in case the element stays mounted (e.g. confirmation dialog opens)
      setTimeout(resetSwipe, 100);
      return;
    }

    resetSwipe();
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-end gap-2 bg-secondary/95 pr-6 text-muted-foreground">
        <Trash2 size={18} className="text-destructive" />
        <span className="label-font text-[10px] tracking-[0.3em]">{trashText}</span>
      </div>
      <button
        type="button"
        onClick={() => {
          if (blockNextClickRef.current) {
            blockNextClickRef.current = false;
            return;
          }

          if (onClick) onClick();
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={resetSwipe}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? "none" : "transform 180ms ease",
          touchAction: "pan-y",
          WebkitTapHighlightColor: "transparent",
        }}
        className={`relative z-10 w-full outline-none transition-all hover:bg-accent active:scale-[0.99] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${className}`}
      >
        {children}
      </button>
    </div>
  );
}
