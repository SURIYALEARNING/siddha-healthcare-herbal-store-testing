import { useTranslation } from 'react-i18next';
import { MouseEvent } from "react";
import { Product } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { RatingStars } from "./RatingStars";
import { ReviewCarousel } from "./ReviewCarousel";
import { formatCurrency } from "../../utils";

interface ProductCardProps {
  key?: string;
  product: Product;
  isInWishlist: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onClick: (id: string) => void;
}

export function ProductCard({ product, isInWishlist, onToggleWishlist, onAddToCart, onClick }: ProductCardProps) {
  const { t } = useTranslation();
  const { reviewStats, latestReviews } = product;

  return (
    <Card hover className="overflow-hidden group" onClick={() => onClick(product._id)}>
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.discountPrice < product.price && (
          <Badge variant="danger" className="absolute top-3 left-3">
            {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
          </Badge>
        )}
        <button
          onClick={(e: MouseEvent) => { e.stopPropagation(); onToggleWishlist(product._id); }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
        >
          {isInWishlist ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="p-4 pb-0">
        <p className="text-xs text-emerald-600 font-medium mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <RatingStars
            rating={reviewStats?.averageRating || 0}
            size="sm"
            showValue
            count={reviewStats?.totalReviews || 0}
          />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-emerald-600">{formatCurrency(product.discountPrice)}</span>
          {product.discountPrice < product.price && (
            <span className="text-sm text-gray-400 line-through">{formatCurrency(product.price)}</span>
          )}
        </div>
        <Button
          size="sm"
          className="w-full"
          onClick={(e: MouseEvent) => { e.stopPropagation(); onAddToCart(product); }}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? t('product.outOfStock') : t('product.addToCart')}
        </Button>
      </div>
      {latestReviews && latestReviews.length > 0 && (
        <ReviewCarousel reviews={latestReviews} />
      )}
    </Card>
  );
}
