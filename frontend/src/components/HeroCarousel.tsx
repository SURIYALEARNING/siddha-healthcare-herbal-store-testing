import { useEffect, useState, useCallback } from "react";
import carosal1 from '../assets/carosal1.png'
import carosal2 from '../assets/carosal1.png'
import carosal3 from '../assets/carosal1.png'

const slides = [
  carosal1,carosal2,carosal3,
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const length = slides.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
  }, [length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? length - 1 : prev - 1));
  }, [length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            className="w-full flex-shrink-0 object-cover"
            style={{ aspectRatio: "1000 / 350" }}
            sizes="100vw"
            referrerPolicy="no-referrer"
          />
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center cursor-pointer transition z-10"
        aria-label="Previous"
      >
        ❮
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center cursor-pointer transition z-10"
        aria-label="Next"
      >
        ❯
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
              i === current ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
