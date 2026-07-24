import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { ReviewPreview } from "../../types";

interface ReviewCarouselProps {
  reviews: ReviewPreview[];
  isLoading?: boolean;
}

function ReviewCardSimple({ review }: { review: ReviewPreview }) {
  console.log("reviwecarosal card");
  return (
    <div className="px-3 py-3 space-y-1.5 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-[9px] shrink-0">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] font-semibold text-gray-700 truncate">{review.userName}</span>
        </div>
        <div className="flex shrink-0">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-2.5 h-2.5 ${
                i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-[11px] text-gray-500 italic leading-relaxed line-clamp-2">
        &ldquo;{review.comment}&rdquo;
      </p>
    </div>
  );
}

const SWIPE_THRESHOLD = 50;
const AUTO_INTERVAL = 4000;

export function ReviewCarousel({ reviews, isLoading }: ReviewCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<number | null>(null);

  const slideCount = reviews.length;
console.log("reviwecarosal");


  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setDragOffset(0);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slideCount);
    setDragOffset(0);
  }, [slideCount]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slideCount) % slideCount);
    setDragOffset(0);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1 || isPaused) return;
    intervalRef.current = setInterval(next, AUTO_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slideCount, isPaused, next]);

  const handleDragStart = (clientX: number) => {
    dragStartRef.current = clientX;
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartRef.current === null) return;
    setDragOffset(clientX - dragStartRef.current);
  };

  const handleDragEnd = () => {
    if (dragStartRef.current === null) return;
    const dx = dragOffset;
    if (dx < -SWIPE_THRESHOLD) next();
    else if (dx > SWIPE_THRESHOLD) prev();
    else setDragOffset(0);
    dragStartRef.current = null;
    setIsDragging(false);
    setIsPaused(false);
  };

  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
    const onMove = (ev: MouseEvent) => handleDragMove(ev.clientX);
    const onUp = () => {
      handleDragEnd();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse px-3 py-4">
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-8 bg-gray-100 rounded w-full" />
      </div>
    );
  }

  if (!reviews || slideCount === 0) return null;

  return (
    <div
      className="relative border-t border-gray-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!isDragging) setIsPaused(false);
      }}
    >
      <div
        ref={trackRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))`,
          }}
        >
          {reviews.map((review, idx) => (
            <div key={review._id || `review-${review.userName}-${idx}`} className="min-w-full">
              <ReviewCardSimple review={review} />
            </div>
          ))}
        </div>
      </div>

      {slideCount > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-5 h-5 rounded-full bg-white/80 border border-gray-100 flex items-center justify-center hover:bg-white transition-colors shadow-sm cursor-pointer z-10"
          >
            <ChevronLeft className="w-3 h-3 text-gray-400" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-5 h-5 rounded-full bg-white/80 border border-gray-100 flex items-center justify-center hover:bg-white transition-colors shadow-sm cursor-pointer z-10"
          >
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </button>

          <div className="flex justify-center gap-1 pb-2">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === current ? "bg-emerald-500 w-3" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
