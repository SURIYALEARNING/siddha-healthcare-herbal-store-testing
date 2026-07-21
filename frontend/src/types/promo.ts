export interface PromoItem {
  id: number;
  image: string;
}

export interface ProductPromoCarouselProps {
  items: PromoItem[];
  autoPlay?: boolean;
  delay?: number;
  showNavigation?: boolean;
  showPagination?: boolean;
}
