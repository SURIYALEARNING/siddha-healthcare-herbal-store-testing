import { memo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, Keyboard } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PromoCard from "./PromoCard";
import type { ProductPromoCarouselProps } from "../types/promo";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function ProductPromoCarousel({
  items,
  autoPlay = true,
  delay = 4000,
  showNavigation = true,
  showPagination = true,
}: ProductPromoCarouselProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (!items || items.length === 0) return null;

  return (
    <section className="relative w-full py-8" aria-label="Image carousel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, Keyboard]}
          spaceBetween={16}
          slidesPerView={1}
          centeredSlides={false}
          loop={true}
          speed={600}
          keyboard={{ enabled: true }}
          autoplay={
            autoPlay
              ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false
          }
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
            enabled: showNavigation,
          }}
          pagination={
            showPagination
              ? { clickable: true, dynamicBullets: true }
              : false
          }
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }}
          onBeforeInit={(swiper) => {
            if (swiper.params.navigation && typeof swiper.params.navigation !== "boolean") {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }
          }}
          className="!pb-12"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id}>
              <PromoCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>

        {showNavigation && (
          <>
            <button
              ref={prevRef}
              className="absolute left-1 sm:left-3 top-[45%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              ref={nextRef}
              className="absolute right-1 sm:right-3 top-[45%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export default memo(ProductPromoCarousel);
