
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

type Props = {
  value: number;
  duration?: number;
  className?: string;
};

const formatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function AnimatedNumber({
  value,
  duration = 600,
  className = "",
}: Props) {
  const reducedMotion = useReducedMotion();

  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    if (reducedMotion || duration <= 0) {
      displayRef.current = value;
      return;
    }

    const from = displayRef.current;
    const difference = value - from;

    if (difference === 0) return;

    let frame = 0;
    let startTime: number | null = null;

    function animate(time: number) {
      if (startTime === null) startTime = time;

      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + difference * eased;

      displayRef.current = current;
      setDisplay(current);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value, duration, reducedMotion]);

  return (
    <span className={className}>
      {formatter.format(
        (reducedMotion ? value : display) / 100
      )}
    </span>
  );
}
