import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { SocialProductCard } from "./SocialProductCard";
import "./SocialProductMarquee.css";

export type SocialPlatform = "instagram" | "youtube" | "facebook" | "tiktok";

export interface SocialItem {
  id: string;
  title: string;
  image: string;
  social: SocialPlatform;
  url: string;
}

export interface SocialProductMarqueeProps {
  items: SocialItem[];
  speed?: number;
  pauseOnHover?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
}

const GAP = 16;

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

function getVisibleCount(): number {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return 5;
  if (window.matchMedia("(min-width: 1024px)").matches) return 5;
  if (window.matchMedia("(min-width: 768px)").matches) return 3;
  return 2;
}

export default function SocialProductMarquee({
  items,
  speed = 30,
  pauseOnHover = true,
  cardWidth = 260,
  cardHeight = 320,
  className = "",
}: SocialProductMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidthPx, setCardWidthPx] = useState(cardWidth);
  const [repeat, setRepeat] = useState(1);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const containerWidth = container.clientWidth;
      if (containerWidth <= 0) return;

      const count = getVisibleCount();
      const width = Math.max(96, Math.floor((containerWidth - GAP * (count - 1)) / count));
      setCardWidthPx((prev) => (prev === width ? prev : width));

      const setWidth = items.length * (width + GAP);
      if (setWidth <= 0) return;
      const needed = Math.max(1, Math.ceil(containerWidth / setWidth) + 1);
      setRepeat((prev) => (prev === needed ? prev : needed));
    };

    update();

    const cleanups: Array<() => void> = [];
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(update);
      observer.observe(container);
      cleanups.push(() => observer.disconnect());
    }
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      const queries = ["(min-width: 1024px)", "(min-width: 768px)"].map((q) =>
        window.matchMedia(q)
      );
      queries.forEach((mq) => mq.addEventListener("change", update));
      cleanups.push(() => queries.forEach((mq) => mq.removeEventListener("change", update)));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [items, reducedMotion]);

  const vars = {
    "--spm-card-width": `${cardWidthPx}px`,
    "--spm-gap": `${GAP}px`,
  } as CSSProperties;

  const aspect = `${cardWidth}/${cardHeight}`;

  const handleMouseEnter = () => {
    if (pauseOnHover) setPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setPaused(false);
  };

  if (reducedMotion) {
    return (
      <div
        className={`flex flex-wrap justify-center gap-4 ${className}`}
        style={vars}
        aria-label="Social product highlights"
      >
        {items.map((item) => (
          <SocialProductCard key={item.id} item={item} aspect={aspect} gap={false} />
        ))}
      </div>
    );
  }

  const trackStyle = {
    "--speed": `${speed}s`,
    animationPlayState: paused ? "paused" : "running",
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
      style={vars}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="social-product-marquee"
      aria-label="Social product highlights"
    >
      <div className="social-product-marquee" style={trackStyle} data-testid="social-product-marquee-track">
        {[0, 1].map((half) => (
          <div key={half} className="flex flex-shrink-0" data-social-product-marquee-half>
            {Array.from({ length: repeat }, (_, copy) =>
              items.map((item) => (
                <SocialProductCard
                  key={`${half}-${copy}-${item.id}`}
                  item={item}
                  aspect={aspect}
                  gap
                />
              ))
            ).flat()}
          </div>
        ))}
      </div>
    </div>
  );
}
