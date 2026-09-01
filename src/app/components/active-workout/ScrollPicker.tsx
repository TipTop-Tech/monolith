import { useEffect, useRef, useState } from "react";
import { haptics } from "../../lib/haptics";
import { playClinkSound, preloadClinkSound } from "../../../utils/audio";

interface ScrollPickerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  title: string;
  onClose: () => void;
  formatValue?: (val: number) => React.ReactNode;
  allowCustomInput?: boolean;
  unitOptions?: string[];
  selectedUnit?: string;
  onUnitChange?: (unit: string) => void;
}

export function ScrollPicker({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
  title,
  onClose,
  formatValue,
  allowCustomInput = false,
  unitOptions,
  selectedUnit,
  onUnitChange,
}: ScrollPickerProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState(value.toString());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const isInitialRender = useRef(true);
  const currentValueRef = useRef(value);
  // one tick each time the value changes
  // does not fire when the wheel auto scrolls to position on open
  // ^could consider that as something that feels cool?
  const lastHapticValueRef = useRef(value);
  const lastHapticTimeRef = useRef(0);
  const suppressHapticsRef = useRef(false);
  const selectionStartedRef = useRef(false);

  const values = [];
  for (let i = min; i <= max; i += step) {
    values.push(i);
  }

  const itemHeight = 140;

  useEffect(() => {
    if (scrollRef.current && !isCustomMode) {
      const index = values.indexOf(currentValueRef.current);
      const scrollTop = index * itemHeight;
      // for preventing haptics on auto scroll to position on open
      suppressHapticsRef.current = true;
      lastHapticValueRef.current = currentValueRef.current;
      scrollRef.current.scrollTop = scrollTop;
    }
  }, [isCustomMode]);

  useEffect(() => {
    preloadClinkSound();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      haptics.selectEnd();
    };
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
  }, [isCustomMode]);

  const handleScroll = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (scrollRef.current) {
        const scrollTop = scrollRef.current.scrollTop;
        
        const index = Math.round(scrollTop / itemHeight);
        const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
        const newValue = values[clampedIndex];
        
        itemRefs.current.forEach((el, index) => {
          if (!el) return;
          const itemScrollPosition = index * itemHeight;
          const distance = Math.abs(itemScrollPosition - scrollTop);
          const maxDistance = itemHeight * 2.5;
          const normalizedDistance = Math.min(distance / maxDistance, 1);
          const easedDistance = normalizedDistance * normalizedDistance;
          
          const scale = 1 - easedDistance * 0.6;
          const opacity = 1 - easedDistance * 0.7;
          
          el.style.transform = `scale(${scale}) translateZ(0)`;
          el.style.opacity = opacity.toString();
          
          const span = el.firstElementChild as HTMLElement;
          if (span) {
            if (index === clampedIndex) {
              span.className = "display-font leading-none text-[min(25vw,90px)] text-primary bevel-text-large";
            } else {
              span.className = "display-font leading-none text-[min(20vw,50px)] text-muted-foreground";
            }
          }
        });
        
        if (newValue !== lastHapticValueRef.current) {
          lastHapticValueRef.current = newValue;
          
          const now = Date.now();
          if (now - lastHapticTimeRef.current > 40 && !suppressHapticsRef.current) {
            haptics.select();
            if (!isCustomMode) {
              playClinkSound();
            }
            lastHapticTimeRef.current = now;
          }
        }
        
        if (newValue !== currentValueRef.current) {
          currentValueRef.current = newValue;
        }
      }
    });
  };

  // on user's first grab/scroll, list suppression and warm up the iOS selection
  // generator once so that haptics work
  const beginInteraction = () => {
    suppressHapticsRef.current = false;
    if (!selectionStartedRef.current) {
      selectionStartedRef.current = true;
      haptics.selectStart();
    }
  };

  const getItemStyle = (index: number) => {
    const itemScrollPosition = index * itemHeight;
    const centerPosition = scrollRef.current ? scrollRef.current.scrollTop : values.indexOf(currentValueRef.current) * itemHeight;
    const distance = Math.abs(itemScrollPosition - centerPosition);
    const maxDistance = itemHeight * 2.5;
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    const easedDistance = normalizedDistance * normalizedDistance;

    const scale = 1 - easedDistance * 0.6;
    const opacity = 1 - easedDistance * 0.7;

    return {
      transform: `scale(${scale}) translateZ(0)`,
      opacity: opacity,
      willChange: 'transform, opacity',
    };
  };

  const handleConfirm = () => {
    if (isCustomMode) {
      const parsed = parseFloat(customValue);
      if (!isNaN(parsed)) {
        onChange(parsed);
      } else {
        onChange(currentValueRef.current);
      }
    } else {
      onChange(currentValueRef.current);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="label-font text-muted-foreground mb-6">{title}</div>

          {unitOptions && onUnitChange && selectedUnit && (
            <div className="flex gap-2 mb-6">
              {unitOptions.map(unit => (
                <button
                  key={unit}
                  onClick={() => onUnitChange(unit)}
                  data-active={selectedUnit === unit}
                  className="px-8 py-2.5 label-font text-xs rounded-md transition-all black-glass-button"
                >
                  <span className="black-glass-text">{unit}</span>
                </button>
              ))}
            </div>
          )}

          {allowCustomInput && (
            <button 
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="mb-8 px-4 py-2 text-xs label-font tracking-[0.2em] transition-colors black-glass-button rounded-md"
            >
              <span className="black-glass-text">{isCustomMode ? "USE SCROLL PICKER" : "TYPE CUSTOM VALUE"}</span>
            </button>
          )}

          <div className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
            {isCustomMode ? (
              <input 
                type="number"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="w-full bg-transparent text-center display-font text-[min(25vw,90px)] text-primary bevel-text-large outline-none"
                autoFocus
              />
            ) : (
              <>
                <div
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-primary/5 pointer-events-none z-10"
                  style={{ height: `${itemHeight}px` }}
                >
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-primary/20" />
                  <div className="absolute inset-x-0 bottom-0 h-[1px] bg-primary/20" />
                </div>

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  onPointerDown={beginInteraction}
                  onWheel={beginInteraction}
                  className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
                  style={{
                    paddingTop: `130px`,
                    paddingBottom: `130px`,
                    scrollBehavior: "smooth",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {values.map((val, index) => (
                    <div
                      key={val}
                      ref={(el) => (itemRefs.current[index] = el)}
                      className="flex items-center justify-center snap-center"
                      style={{
                        height: `${itemHeight}px`,
                        ...getItemStyle(index),
                      }}
                    >
                      <span
                        className={`display-font leading-none ${val === currentValueRef.current
                          ? "text-[min(25vw,90px)] text-primary bevel-text-large"
                          : "text-[min(20vw,50px)] text-muted-foreground"
                          }`}
                      >
                        {formatValue ? formatValue(val) : val}
                        {!formatValue && suffix}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4 mt-12 w-full max-w-xs">
            <button
              onClick={onClose}
              className="flex-1 py-4 black-glass-button transition-all label-font rounded-md"
            >
              <span className="black-glass-text">CANCEL</span>
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-4 black-glass-button transition-all label-font rounded-md"
            >
              <span className="black-glass-text">CONFIRM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}