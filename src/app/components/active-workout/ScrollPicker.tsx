import { useEffect, useRef, useState } from "react";

interface ScrollPickerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  title: string;
  onClose: () => void;
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
}: ScrollPickerProps) {
  const [selectedValue, setSelectedValue] = useState(value);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const values = [];
  for (let i = min; i <= max; i += step) {
    values.push(i);
  }

  const itemHeight = 100;

  useEffect(() => {
    if (scrollRef.current) {
      const index = values.indexOf(selectedValue);
      const scrollTop = index * itemHeight;
      scrollRef.current.scrollTop = scrollTop;
      setScrollPosition(scrollTop);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (scrollRef.current) {
        const scrollTop = scrollRef.current.scrollTop;
        setScrollPosition(scrollTop);
        const index = Math.round(scrollTop / itemHeight);
        const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
        setSelectedValue(values[clampedIndex]);
      }
    });
  };

  const getItemStyle = (index: number) => {
    const itemScrollPosition = index * itemHeight;
    const centerPosition = scrollPosition;
    const distance = Math.abs(itemScrollPosition - centerPosition);
    const maxDistance = itemHeight * 2.5;
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    const easedDistance = normalizedDistance * normalizedDistance;

    const scale = 1 - easedDistance * 0.6;
    const opacity = 1 - easedDistance * 0.7;

    return {
      transform: `scale(${scale})`,
      opacity: opacity,
      transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
    };
  };

  const handleConfirm = () => {
    onChange(selectedValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="label-font text-muted-foreground mb-12">{title}</div>

          <div className="relative h-[500px] w-full overflow-hidden">
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
              className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
              style={{
                paddingTop: `${itemHeight * 2}px`,
                paddingBottom: `${itemHeight * 2}px`,
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {values.map((val, index) => (
                <div
                  key={val}
                  className="flex items-center justify-center snap-center"
                  style={{
                    height: `${itemHeight}px`,
                    ...getItemStyle(index),
                  }}
                >
                  <span
                    className={`display-font leading-none ${
                      val === selectedValue
                        ? "text-[min(30vw,140px)] text-primary bevel-text-large"
                        : "text-[min(20vw,80px)] text-muted-foreground"
                    }`}
                  >
                    {val}
                    {suffix}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-12 w-full max-w-xs">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-muted text-foreground bevel-element hover:bg-accent transition-all active:scale-98 label-font"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-4 bg-primary text-primary-foreground bevel-element hover:opacity-90 transition-all active:scale-98 label-font"
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}