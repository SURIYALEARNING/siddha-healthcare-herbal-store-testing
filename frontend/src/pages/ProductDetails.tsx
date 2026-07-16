import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ChevronLeft } from "lucide-react";
import ImageGallery from "../components/product/ImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductActions from "../components/product/ProductActions";
import ProductTabs from "../components/product/ProductTabs";
import ReviewSection from "../components/product/ReviewSection";
import RelatedProducts from "../components/product/RelatedProducts";
import type { Product } from "../types";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist } = useApp();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const prod = products.find((p) => p._id === id);
    if (prod) setProduct(prod);
  }, [id, products]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Locating Siddha formulation...</h2>
        <Link to="/shop" className="text-sm font-bold text-siddha-dark hover:underline">
          Return to Pharmacy
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice < product.price;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p._id !== product._id)
    .slice(0, 3);

  const handleAddToCart = (quantity: number) => {
    addToCart(product, quantity);
  };

  const handleBuyNow = (quantity: number) => {
    addToCart(product, quantity);
    navigate("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/shop"
        className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-siddha-dark uppercase tracking-wider mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Remedies Gallery</span>
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <ImageGallery images={product.images} name={product.name} hasDiscount={hasDiscount} />

        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <ProductInfo
            name={product.name}
            category={product.category}
            rating={product.rating}
            reviewCount={product.reviews?.length || 0}
            price={product.price}
            discountPrice={product.discountPrice}
            description={product.description}
            stock={product.stock}
            inWishlist={isInWishlist(product._id)}
            onToggleWishlist={() => toggleWishlist(product._id)}
          />

          <ProductActions
            stock={product.stock}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />

          <div className="flex justify-around bg-slate-50 border border-slate-100 rounded-2xl py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest divide-x divide-gray-150">
            <div className="flex-1">Ministry of Ayush</div>
            <div className="flex-1">Zero Chemical pres.</div>
            <div className="flex-1">India-wide Delivery</div>
          </div>
        </div>
      </div>

      <ProductTabs
        ingredients={product.ingredients}
        benefits={product.benefits}
        usageInstructions={product.usageInstructions}
      />

      <ReviewSection productId={product._id} reviews={product.reviews || []} />

      <RelatedProducts
        products={relatedProducts}
        isInWishlist={isInWishlist}
        onToggleWishlist={toggleWishlist}
      />
    </div>
  );
}
