import { Product } from "../../types";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "../ui/EmptyState";
import { Spinner } from "../ui/Spinner";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (id: string) => void;
}

export function ProductGrid({
  products, loading, wishlist, onToggleWishlist, onAddToCart, onProductClick,
}: ProductGridProps) {
  if (loading) return <Spinner size="lg" className="py-20" />;
  if (products.length === 0) return <EmptyState icon="🔍" title="No products found" description="Try adjusting your filters." />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard
          key={product._id}
          product={product}
          isInWishlist={wishlist.includes(product._id)}
          onToggleWishlist={onToggleWishlist}
          onAddToCart={onAddToCart}
          onClick={onProductClick}
        />
      ))}
    </div>
  );
}
