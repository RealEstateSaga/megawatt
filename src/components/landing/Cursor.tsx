import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { SPRING } from "../engine/motion";

type CursorState = "default" | "hover" | "view";

export default function Cursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Ring lags further behind for a "trailing halo" feel
  const ringX = useSpring(cursorX, SPRING.medium);
  const ringY = useSpring(cursorY, SPRING.medium);

  const [state, setState] = useState<CursorState>("default");

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const enter = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("[data-cursor='view']")) {
        setState("view");
      } else if (el.closest("a, button, [data-cursor]")) {
        setState("hover");
      }
    };

    const leave = () => setState("default");

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseenter", enter, true);
    document.addEventListener("mouseleave", leave, true);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseenter", enter, true);
      document.removeEventListener("mouseleave", leave, true);
    };
  }, [cursorX, cursorY]);

  const ringSize = state === "default" ? 36 : state === "hover" ? 56 : 72;
  const ringBorder =
    state === "default" ? "rgba(255,255,255,0.25)" : "rgba(201,169,110,0.6)";

  return (
    <>
      {/* Inner dot — sharp, fast, mix-blend for contrast on any background */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full bg-off"
          animate={{ width: state === "view" ? 6 : 8, height: state === "view" ? 6 : 8 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Outer ring — spring-lagged, scales on interaction */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none flex items-center justify-center"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full flex items-center justify-center"
          animate={{
            width: ringSize,
            height: ringSize,
            borderColor: ringBorder,
          }}
          style={{ border: `1px solid ${ringBorder}` }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {state === "view" && (
            <motion.span
              className="font-mono text-[9px] text-accent tracking-widest uppercase"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              View
            </motion.span>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}

