import { useState, useRef } from "react";
import { Trash2 } from "lucide-react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface SwipeableRowProps {
  onRemove: () => void;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  trashText?: string;
}

export function SwipeableRow({ onRemove, onClick, children, className = "", trashText = "REMOVE" }: SwipeableRowProps) {
  const reduced = useReducedMotion();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const swipeOffsetRef = useRef(0);
  const blockNextClickRef = useRef(false);
  const touchMovedRef = useRef(false);

  /**
   * This resets the swipe offset and touch start x.
   */
  const resetSwipe = () => {
    touchStartX.current = null;
    touchMovedRef.current = false;
    swipeOffsetRef.current = 0;
    setSwipeOffset(0);
    setIsDragging(false);
    setIsOpen(false);
  };

  /**
   * This handles the touch start event.
   */
  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    touchStartX.current = event.touches[0].clientX;
    touchMovedRef.current = false;
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
    if (Math.abs(deltaX) > 5) {
      touchMovedRef.current = true;
    }

    const baseOffset = isOpen ? -100 : 0;
    const rawOffset = baseOffset + deltaX;

    // Apply friction if pulled beyond -100px
    let nextOffset = rawOffset;
    if (rawOffset < -100) {
      // Adjust friction to allow reaching the over-swipe threshold easier
      nextOffset = -100 + (rawOffset + 100) * 0.6;
    }
    
    // Prevent swiping right beyond 0
    nextOffset = Math.min(0, nextOffset);

    swipeOffsetRef.current = nextOffset;
    setSwipeOffset(nextOffset);
  };

  /**
   * This handles the touch end event. It handles snapping logic based on thresholds.
   */
  const handleTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
    setIsDragging(false);

    if (!touchMovedRef.current && touchStartX.current !== null) {
      // It was a tap, handle click manually to avoid browser cancellation
      if (isOpen) {
        setIsOpen(false);
        setSwipeOffset(0);
        swipeOffsetRef.current = 0;
        blockNextClickRef.current = true;
      } else {
        if (onClick) {
          blockNextClickRef.current = true;
          onClick();
        }
      }
      return;
    }

    // Over-swipe to delete automatically
    if (swipeOffsetRef.current < -180) {
      onRemove();
      resetSwipe();
      return;
    }

    if (isOpen) {
      // If already open and user dragged it right past -80, close it
      if (swipeOffsetRef.current > -80) {
        setIsOpen(false);
        setSwipeOffset(0);
        swipeOffsetRef.current = 0;
      } else {
        // Snap back to open
        setSwipeOffset(-100);
        swipeOffsetRef.current = -100;
      }
    } else {
      // If closed and user dragged it left past -60, open it
      if (swipeOffsetRef.current < -60) {
        setIsOpen(true);
        setSwipeOffset(-100);
        swipeOffsetRef.current = -100;
      } else {
        // Snap back to closed
        setSwipeOffset(0);
        swipeOffsetRef.current = 0;
      }
    }
  };

  return (
    <div className="relative overflow-hidden w-full">
      <div 
        className="flex items-stretch w-full"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging || reduced ? "none" : "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            if (isOpen) {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
              setSwipeOffset(0);
              swipeOffsetRef.current = 0;
              return;
            }
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
            touchAction: "pan-y",
            WebkitTapHighlightColor: "transparent",
          }}
          className={`shrink-0 w-full outline-none transition-all hover:bg-accent active:scale-[0.99] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${className}`}
        >
          {children}
        </button>

        <div 
          className="shrink-0 flex items-stretch"
          style={{ width: `${Math.max(100, -swipeOffset)}px` }}
        >
          <button
            type="button"
            data-active={isDragging}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
              resetSwipe();
            }}
            className={`w-full h-full flex flex-col items-center justify-center pointer-events-auto transition-all duration-200 border-l-0 rounded-none rounded-r overflow-hidden black-glass-button-destructive ${
              isDragging ? "scale-[0.99]" : ""
            } ${
              swipeOffset < -180 ? "!bg-red-600/90" : ""
            }`}
          >
            <Trash2 
              size={18} 
              className={`black-glass-text transition-transform duration-200 ${swipeOffset < -180 ? 'scale-150' : 'scale-100'}`} 
            />
            <span className={`label-font text-[9px] tracking-[0.2em] black-glass-text transition-all duration-200 ${swipeOffset < -180 ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 mt-1.5'}`}>
              {trashText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
