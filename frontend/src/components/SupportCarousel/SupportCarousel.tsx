import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./SupportCarousel.css";

export interface SupportCarouselItem {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export interface SupportCarouselProps {
  items: SupportCarouselItem[];
  cardWidth?: number;
  cardHeight?: number;
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}

const CARD_WIDTH_CLASS =
  "w-[var(--sc-card-width)] max-md:[--sc-card-width:calc((100vw-2rem)/1.1)] md:max-lg:[--sc-card-width:calc((100vw-3rem)/2)]";
const CARD_HEIGHT_CLASS = "h-[var(--sc-card-height)]";
const CARD_STYLE_CLASS =
  "flex-shrink-0 rounded-3xl bg-[#144B2E] text-white p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300";

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

export default function SupportCarousel({
  items,
  cardWidth = 520,
  cardHeight = 190,
  speed = 35,
  pauseOnHover = false,
  className = "",
}: SupportCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [repeat, setRepeat] = useState(1);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const vars = {
    "--sc-card-width": `${cardWidth}px`,
    "--sc-card-height": `${cardHeight}px`,
  } as CSSProperties;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const half = container.querySelector<HTMLElement>("[data-support-carousel-half]");
      const halfWidth = half ? half.scrollWidth : 0;
      const containerWidth = container.clientWidth;
      if (halfWidth > 0 && containerWidth > 0) {
        const setWidth = halfWidth / repeat;
        const needed = Math.max(1, Math.ceil(containerWidth / setWidth));
        setRepeat((prev) => (prev === needed ? prev : needed));
      }
    };

    update();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [items, repeat, reducedMotion, cardWidth, cardHeight]);

  const handleMouseEnter = () => {
    if (pauseOnHover) setPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setPaused(false);
  };

  const renderCard = (item: SupportCarouselItem, key: string, gap: boolean) => (
    <div
      key={key}
      className={`${CARD_WIDTH_CLASS} ${CARD_HEIGHT_CLASS} ${CARD_STYLE_CLASS} flex items-start gap-4 ${gap ? "mr-4 md:mr-5" : ""}`}
    >
      <div className="w-16 h-16 rounded-full bg-siddha-gold text-[#144B2E] flex items-center justify-center flex-shrink-0">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-white">{item.title}</h3>
        <p className="text-sm text-emerald-100 leading-relaxed mt-1.5 line-clamp-3">{item.description}</p>
      </div>
    </div>
  );

  if (reducedMotion) {
    return (
      <div
        className={`flex flex-wrap justify-center gap-4 md:gap-5 ${className}`}
        style={vars}
        aria-label="Support highlights"
      >
        {items.map((item) => renderCard(item, item.id, false))}
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
      data-testid="support-carousel"
      aria-label="Support highlights"
    >
      <div className="support-marquee" style={trackStyle} data-testid="support-carousel-track">
        {[0, 1].map((half) => (
          <div key={half} className="flex flex-shrink-0" data-support-carousel-half>
            {Array.from({ length: repeat }, (_, copy) =>
              items.map((item) =>
                renderCard(item, `${half}-${copy}-${item.id}`, true),
              ),
            ).flat()}
          </div>
        ))}
      </div>
    </div>
  );
}
