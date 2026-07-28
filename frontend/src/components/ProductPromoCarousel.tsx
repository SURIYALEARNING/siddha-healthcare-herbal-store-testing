import { memo, useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, Keyboard } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCarouselProductsApi } from "../api/carousel";
import PromoCard from "./PromoCard";
import type { Product } from "../types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function ProductPromoCarousel() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarouselProductsApi()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="relative w-full py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[300px] sm:min-w-[400px] lg:min-w-[500px] h-64 sm:h-72 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="relative w-full py-8" aria-label="Product promo carousel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, Keyboard]}
          spaceBetween={16}
          slidesPerView={1}
          centeredSlides={false}
          loop={true}
          speed={600}
          keyboard={{ enabled: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
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
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <PromoCard product={product} lang={lang} />
            </SwiperSlide>
          ))}
        </Swiper>

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
      </div>
    </section>
  );
}

export default memo(ProductPromoCarousel);
