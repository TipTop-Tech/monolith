import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { ExerciseGuideVideo } from "../../data/exerciseGuides";

interface GuideVideoProps {
  video: ExerciseGuideVideo;
  onUnavailable: () => void;
}

export function GuideVideo({ video, onUnavailable }: GuideVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  const tryPlay = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    el.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const pause = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.setAttribute("src", video.src);
    el.load();
    return () => {
      el.pause();
      el.removeAttribute("src");
      el.load();
      setIsPlaying(false);
    };
  }, [video.src]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || reducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
        else pause();
      },
      { threshold: 0.35 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [reducedMotion, video.src]);

  const toggleSlow = () => {
    const el = videoRef.current;
    if (!el) return;
    const next = !isSlow;
    el.playbackRate = next ? 0.5 : 1;
    setIsSlow(next);
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="relative w-full aspect-video bg-secondary overflow-hidden">
        <video
          ref={videoRef}
          poster={video.poster}
          loop
          muted
          playsInline
          preload="none"
          onError={onUnavailable}
          onClick={() => (isPlaying ? pause() : tryPlay())}
          className="w-full h-full object-cover"
        />
        {!isPlaying && (
          <button
            onClick={tryPlay}
            aria-label="Play demo video"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="w-14 h-14 flex items-center justify-center black-glass-button">
              <span className="black-glass-text flex items-center justify-center">
                <Play size={24} />
              </span>
            </span>
          </button>
        )}
        {isPlaying && (
          <button
            onClick={pause}
            aria-label="Pause demo video"
            className="absolute bottom-2 left-2 w-9 h-9 flex items-center justify-center black-glass-button"
          >
            <span className="black-glass-text flex items-center justify-center">
              <Pause size={14} />
            </span>
          </button>
        )}
        <button
          onClick={toggleSlow}
          aria-label={isSlow ? "Play at normal speed" : "Play at half speed"}
          data-active={isSlow}
          className="absolute bottom-2 right-2 h-9 px-3 flex items-center justify-center black-glass-button label-font text-[10px]"
        >
          <span className="black-glass-text">{isSlow ? "1X" : "0.5X"}</span>
        </button>
      </div>
      <p className="user-text text-[11px] text-muted-foreground mt-1.5">
        AI-generated demo · Made with Google Gemini
      </p>
    </div>
  );
}
