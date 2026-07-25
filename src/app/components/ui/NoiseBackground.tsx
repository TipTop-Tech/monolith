import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { motion, useAnimation } from "motion/react";

export function NoiseBackground() {
  const location = useLocation();
  const controls = useAnimation();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    controls.start({
      x: ["0%", "-10%", "0%"],
      y: ["0%", "5%", "0%"],
      transition: { duration: 0.6, ease: "easeInOut" }
    });
  }, [location.pathname, controls]);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[9999]"
      initial={{ scale: 1, opacity: 0.15, x: 0, y: 0 }}
      animate={controls}
      style={{
        // Give it extra width/height so parallax doesn't show edges
        width: "120vw",
        height: "120vh",
        left: "-10vw",
        top: "-10vh",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <filter id="globalNoiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.5"
            numOctaves="1"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#globalNoiseFilter)" />
      </svg>
    </motion.div>
  );
}
