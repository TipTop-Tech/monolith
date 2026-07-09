import { useEffect, useRef, useState } from "react";
import { haptics } from "../../lib/haptics";
import { playClinkSound, preloadClinkSound } from "../../../utils/audio";

interface InlineWheelProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (val: number) => React.ReactNode;
  itemHeight?: number;
}

export function InlineWheel({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue,
  itemHeight = 60,
}: InlineWheelProps) {
  const [selectedValue, setSelectedValue] = useState(value);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastHapticValueRef = useRef(value);
  const suppressHapticsRef = useRef(false);
  const selectionStartedRef = useRef(false);

  const values: number[] = [];
  for (let i = min; i <= max; i += step) values.push(i);

  useEffect(() => {
    if (!scrollRef.current) return;
    const index = Math.max(0, values.indexOf(value));
    suppressHapticsRef.current = true;
    lastHapticValueRef.current = value;
    const top = index * itemHeight;
    scrollRef.current.scrollTop = top;
    setScrollPosition(top);
  }, []);

  useEffect(() => {
    preloadClinkSound();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      haptics.selectEnd();
    };
  }, []);

  const handleScroll = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const scrollTop = scrollRef.current.scrollTop;
      setScrollPosition(scrollTop);
      const index = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      const newValue = values[clampedIndex];
      if (newValue !== lastHapticValueRef.current) {
        lastHapticValueRef.current = newValue;
        if (!suppressHapticsRef.current) {
          haptics.select();
          playClinkSound();
        }
      }
      if (newValue !== selectedValue) {
        setSelectedValue(newValue);
        onChange(newValue);
      }
    });
  };

  const beginInteraction = () => {
    suppressHapticsRef.current = false;
    if (!selectionStartedRef.current) {
      selectionStartedRef.current = true;
      haptics.selectStart();
    }
  };

  const getItemStyle = (index: number) => {
    const distance = Math.abs(index * itemHeight - scrollPosition);
    const normalized = Math.min(distance / (itemHeight * 2.5), 1);
    const eased = normalized * normalized;
    return {
      transform: `scale(${1 - eased * 0.55})`,
      opacity: 1 - eased * 0.7,
      transition: "transform 0.1s ease-out, opacity 0.1s ease-out",
    };
  };

  return (
    <div
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ height: itemHeight * 3 }}
    >
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-primary/5 pointer-events-none z-10"
        style={{ height: itemHeight }}
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
          paddingTop: itemHeight,
          paddingBottom: itemHeight,
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {values.map((val, index) => (
          <div
            key={val}
            className="flex items-center justify-center snap-center"
            style={{ height: itemHeight, ...getItemStyle(index) }}
          >
            <span
              className={`display-font leading-none ${
                val === selectedValue
                  ? "text-4xl text-primary bevel-text-large"
                  : "text-2xl text-muted-foreground"
              }`}
            >
              {formatValue ? formatValue(val) : val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
