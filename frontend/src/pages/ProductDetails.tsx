import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ChevronLeft } from "lucide-react";
import ImageGallery from "../components/product/ImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductActions from "../components/product/ProductActions";
import ProductTabs from "../components/product/ProductTabs";
import ReviewSection from "../components/product/ReviewSection";
import RelatedProducts from "../components/product/RelatedProducts";
import { Spinner } from "../components/ui/Spinner";
import type { Product } from "../types";
import { fetchProductByIdApi } from "../api/products";

function getVal(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

function getArr(arr: any[], lang: string): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === "string") return item;
    return item[lang] || item.en || "";
  });
}

function getCategoryName(cat: any, lang: string): string {
  if (!cat) return "";
  if (typeof cat === "string") return cat;
  return getVal(cat.name, lang) || cat._id || "";
}

export default function ProductDetails() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist } = useApp();
  const productsRef = useRef(products);
  productsRef.current = products;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetchProductByIdApi(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        const fallback = productsRef.current.find((p) => p._id === id);
        if (!cancelled && fallback) setProduct(fallback);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <Spinner size="lg" className="py-20" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">{t('productDetails.loading')}</h2>
        <Link to="/shop" className="text-sm font-bold text-siddha-dark hover:underline">
          {t('productDetails.returnToShop')}
        </Link>
      </div>
    );
  }

  const { reviewStats, latestReviews } = product;
  const hasDiscount = product.discountPrice < product.price;

  const productName = getVal(product.name, lang);
  const productDesc = getVal(product.description, lang);
  const categoryName = getCategoryName(product.category, lang);

  const productMottoText = getVal(product.productMotto, lang);
  const ingredients = getArr(product.ingredients, lang);
  const benefits = getArr(product.benefits, lang);
  const usageInstructions = getArr(product.usageInstructions, lang);
  const safetyInstructions = getArr(product.safetyInstructions, lang);
  const storageInstructions = getArr(product.storageInstructions, lang);
  const tags = getArr(product.tags, lang);

  const relatedProducts = products
    .filter((p) => {
      const pCat = typeof p.category === "object" ? (p.category as any)?._id : p.category;
      const prodCat = typeof product.category === "object" ? (product.category as any)?._id : product.category;
      return pCat === prodCat && p._id !== product._id;
    })
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
        <span>{t('product.remediesGallery')}</span>
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <ImageGallery images={product.images} media={product.media} name={productName} hasDiscount={hasDiscount} />

        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <ProductInfo
            name={productName}
            productMotto={productMottoText}
            size={product.size}
            category={categoryName}
            reviewStats={reviewStats}
            price={product.price}
            discountPrice={product.discountPrice}
            description={productDesc}
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
            <div className="flex-1">{t('productDetails.ministryBadge')}</div>
            <div className="flex-1">{t('productDetails.zeroChemicalBadge')}</div>
            <div className="flex-1">{t('productDetails.indiaDeliveryBadge')}</div>
          </div>
        </div>
      </div>

      <ProductTabs
        ingredients={ingredients}
        benefits={benefits}
        usageInstructions={usageInstructions}
        safetyInstructions={safetyInstructions}
        storageInstructions={storageInstructions}
        tags={tags}
      />

      <ReviewSection
        productId={product._id}
        initialStats={reviewStats}
      />

      <RelatedProducts
        products={relatedProducts}
        isInWishlist={isInWishlist}
        onToggleWishlist={toggleWishlist}
      />
    </div>
  );
}
