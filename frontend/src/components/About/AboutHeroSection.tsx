import { useEffect, useRef, useState } from "react";
import { Leaf } from "lucide-react";
import type { AboutHeroSectionProps } from "./AboutHeroSection.types";

const REVEAL_BASE =
  "transition-all duration-700 ease-out";

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

export default function AboutHeroSection({
  title,
  subtitle,
  description,
  secondDescription,
  image,
  images,
  badgeText,
  reverse = false,
  square = false,
  className = "",
}: AboutHeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const allImages = images && images.length > 0 ? images : image ? [image] : [];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (allImages.length < 2 || reducedMotion) return;
    const id = window.setInterval(() => {
      setCurrent((c) => (c + 1) % allImages.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [allImages.length, reducedMotion]);

  const show = visible || reducedMotion;

  const imageClass = `${REVEAL_BASE} ${show ? "opacity-100 translate-x-0" : reverse ? "opacity-0 translate-x-16" : "opacity-0 -translate-x-16"}`;
  const textClass = `${REVEAL_BASE} ${show ? "opacity-100 translate-x-0" : reverse ? "opacity-0 -translate-x-16" : "opacity-0 translate-x-16"}`;

  const imageWrapClass = square
    ? "group relative mx-auto w-full max-w-[480px] aspect-square overflow-hidden rounded-3xl bg-slate-100 shadow-md"
    : "group relative w-full aspect-[16/11] h-[300px] overflow-hidden rounded-3xl bg-slate-100 shadow-md";

  return (
    <section
      ref={sectionRef}
      aria-label={badgeText}
      className={`mx-auto max-w-[1400px] rounded-3xl bg-white border border-gray-100 shadow-xs px-6 py-12 sm:px-10 md:px-12 lg:px-16 lg:py-20 ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-16">
        <div className={`lg:col-span-7 ${reverse ? "lg:order-2" : ""} ${imageClass}`}>
          <div className={imageWrapClass}>
            {allImages.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={title}
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out group-hover:scale-[1.03] ${
                  i === current ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          {allImages.length > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label={`${title} gallery`}>
              {allImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`${title} image ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                    i === current ? "bg-siddha-gold" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className={`lg:col-span-5 text-center lg:text-left ${reverse ? "lg:order-1" : ""} ${textClass}`}>
          {badgeText ? (
            <div className="mb-6 flex items-center justify-center gap-2 lg:justify-start">
              <Leaf className="h-4 w-4 text-siddha-gold" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-widest text-siddha-gold">
                {badgeText}
              </span>
            </div>
          ) : null}

          {subtitle ? (
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-siddha-dark">
              {subtitle}
            </p>
          ) : null}

          <h2 className="mb-8 font-display font-bold leading-[1.1] tracking-tight text-emerald-950 text-[34px] md:text-[48px] lg:text-[56px]">
            {title}
          </h2>

          <div className="mx-auto max-w-[520px] space-y-4 lg:mx-0 [&_strong]:font-semibold [&_strong]:text-siddha-dark">
            <p className="text-base leading-relaxed text-gray-500">{description}</p>
            {secondDescription ? (
              <p className="text-base leading-relaxed text-gray-500">{secondDescription}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
