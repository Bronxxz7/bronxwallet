
import type { ReactNode } from "react";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";

type Props = HTMLMotionProps<"button"> & {
  children: ReactNode;
};

export default function AnimatedButton({
  children,
  className = "",
  disabled = false,
  type = "button",
  ...props
}: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      {...props}
      type={type}
      disabled={disabled}
      whileHover={
        disabled || reducedMotion
          ? undefined
          : { scale: 1.02 }
      }
      whileTap={
        disabled || reducedMotion
          ? undefined
          : { scale: 0.97 }
      }
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 28,
      }}
      className={`fm-premium-button ${className}`}
    >
      {children}
    </motion.button>
  );
}
