import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight } from "lucide-react";
import { haptics } from "../../lib/haptics";

const GREETING_TITLES = [
  "Keep Building",
  "Little by Little",
  "Keep it Simple",
  "Stay Consistent",
  "Embrace the Grind"
];

const MARCUS_AURELIUS_QUOTES = [
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", citation: "Meditations, Book 4, Section 3" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", citation: "Meditations, Book 3, Section 4" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", citation: "Meditations, Book 10, Section 16" },
  { text: "It is not death that a man should fear, but he should fear never beginning to live.", citation: "Meditations, Book 12, Section 1" }
];

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const overlayVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(12px)",
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: { duration: 0.3 }
  }
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 }
  }
};

export function WelcomeHeader() {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const randomTitle = useMemo(() => GREETING_TITLES[Math.floor(Math.random() * GREETING_TITLES.length)], []);
  const randomQuote = useMemo(() => MARCUS_AURELIUS_QUOTES[Math.floor(Math.random() * MARCUS_AURELIUS_QUOTES.length)], []);

  const handleOpen = () => {
    haptics.tap();
    setIsOverlayOpen(true);
  };

  const handleClose = () => {
    haptics.tap();
    setIsOverlayOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full text-left group transition-opacity hover:opacity-80 active:opacity-60 cursor-pointer outline-none focus:outline-none"
      >
        <motion.div variants={itemVariants} className="display-font text-5xl bevel-text-large mb-2 flex items-center gap-3">
          {randomTitle}
          <ChevronRight size={28} className="text-muted-foreground opacity-60 transition-transform group-hover:translate-x-1" />
        </motion.div>
        <motion.div variants={itemVariants} className="label-font text-muted-foreground mb-4">
          "{randomQuote.text}"<br />
          <span className="text-xs opacity-75">— Marcus Aurelius, {randomQuote.citation}</span>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOverlayOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-background/40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          >
            <motion.div
              className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-background/80 border border-border/50 shadow-2xl backdrop-blur-xl"
              variants={contentVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
              >
                <X size={16} />
              </button>

              <div className="relative aspect-square w-full bg-muted overflow-hidden">
                <img
                  src="/assets/aurelius.jpg"
                  alt="Marcus Aurelius"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
              </div>

              <div className="p-6 pt-2 relative z-10">
                <h3 className="display-font text-3xl bevel-text mb-2 text-foreground">Marcus Aurelius</h3>
                <div className="label-font text-xs tracking-widest text-muted-foreground mb-4">
                  121 AD - 180 AD
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                  Roman Emperor from 161 to 180 AD and a Stoic philosopher.
                  He was the last of the rulers known as the Five Good Emperors,
                  and the last emperor of peaceful Pax Romana era.
                  <br /><br />
                  Aurelius wrote in his journal, now known as Meditations, to keep himself
                  grounded in Stoic ideals while being an Emperor. He stressed the need
                  for people to control themselves rather than external events, work
                  with people for the greater good, and live in accordance with nature.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
