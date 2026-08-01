import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./Marquee.css";

export interface MarqueeProps {
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  gap?: number;
  className?: string;
  children: ReactNode;
}

const TRACK_CLASS =
  "marquee-track flex w-max items-center whitespace-nowrap flex-shrink-0";
const GROUP_CLASS =
  "flex items-center whitespace-nowrap flex-shrink-0 gap-[var(--marquee-gap)] pr-[var(--marquee-gap)]";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export default function Marquee({
  speed = 25,
  direction = "left",
  pauseOnHover = true,
  gap = 48,
  className = "",
  children,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [groups, setGroups] = useState(2);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const group = groupRef.current;
    if (!container || !group) return;

    const update = () => {
      const groupWidth = group.scrollWidth;
      const containerWidth = container.clientWidth;
      if (groupWidth > 0 && containerWidth > 0) {
        const needed = Math.max(2, Math.ceil((containerWidth * 2) / groupWidth));
        const even = needed % 2 === 0 ? needed : needed + 1;
        setGroups((prev) => (prev === even ? prev : even));
      }
    };

    update();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(group);
    return () => observer.disconnect();
  }, [children]);

  const vars = { "--marquee-gap": `${gap}px` } as CSSProperties;

  if (reducedMotion) {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-[var(--marquee-gap)] ${className}`}
        style={vars}
        aria-label="Scrolling marquee"
      >
        {children}
      </div>
    );
  }

  const trackStyle = {
    "--speed": `${speed}s`,
    "--marquee-direction": direction === "right" ? "reverse" : "normal",
    animationPlayState: paused ? "paused" : "running",
  } as CSSProperties;

  const handleMouseEnter = () => {
    if (pauseOnHover) setPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setPaused(false);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden w-full ${className}`}
      style={vars}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Scrolling marquee"
      data-testid="marquee"
    >
      <div className={TRACK_CLASS} style={trackStyle} data-testid="marquee-track">
        {Array.from({ length: groups }, (_, index) => (
          <div key={index} className={GROUP_CLASS} ref={index === 0 ? groupRef : undefined}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
