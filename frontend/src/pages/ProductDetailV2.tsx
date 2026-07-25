import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Star } from "lucide-react";
import { fetchProductBySlugV2Api, fetchProductsV2Api } from "../api/productsV2";
import ProductCardV2 from "../components/product/ProductCardV2";
import type { ProductV2 } from "../types/v2";

export default function ProductDetailV2() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "en" | "ta";

  const [product, setProduct] = useState<ProductV2 | null>(null);
  const [related, setRelated] = useState<ProductV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlugV2Api(slug)
      .then((data) => {
        setProduct(data);
        setSelectedImage(0);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product && typeof product.category === "object" && product.category?._id) {
      const catId = typeof product.category === "object" ? product.category._id : product.category;
      fetchProductsV2Api({ category: catId, limit: 4, active: true })
        .then((res) =>
          setRelated(res.data.filter((p) => p._id !== product._id).slice(0, 3))
        )
        .catch(() => setRelated([]));
    }
  }, [product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-siddha-dark border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400 mt-3">{t("common.loading")}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">
          {lang === "ta" ? "தயாரிப்பு கிடைக்கவில்லை" : "Product not found"}
        </h2>
        <Link to="/products-v2" className="text-sm font-bold text-siddha-dark hover:underline">
          {lang === "ta" ? "மருந்துகளுக்குத் திரும்பு" : "Back to Products"}
        </Link>
      </div>
    );
  }

  const category = typeof product.category === "object" ? product.category : null;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const images = product.images?.length > 0 ? product.images : ["/placeholder.png"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/products-v2"
        className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-siddha-dark uppercase tracking-wider mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{lang === "ta" ? "மருந்துகளுக்குத் திரும்பு" : "Back to Products"}</span>
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Image Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden border border-gray-100">
            <img
              src={images[selectedImage]}
              alt={product.name[lang]}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-colors ${
                    i === selectedImage ? "border-siddha-dark" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:col-span-7 space-y-6">
          {category && (
            <span className="inline-block text-[10px] font-bold bg-siddha-light text-siddha-dark px-3 py-1 rounded-full uppercase tracking-wider">
              {category.name?.[lang] || category.name?.en || ""}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 tracking-tight leading-tight">
            {product.name[lang]}
          </h1>

          {product.productMotto?.[lang] && (
            <p className="text-sm italic text-emerald-700 font-serif">
              {product.productMotto[lang]}
            </p>
          )}

          {product.shortDescription?.[lang] && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.shortDescription[lang]}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(product.averageRating || 0)
                      ? "fill-current"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700">
              {product.averageRating?.toFixed(1) || "0.0"}
            </span>
            <span className="text-xs text-gray-400">
              ({product.totalReviews || 0} {lang === "ta" ? "மதிப்புரைகள்" : "reviews"})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {hasDiscount && (
              <span className="text-2xl text-gray-400 line-through font-medium">
                ₹{product.price}
              </span>
            )}
            <span className="text-3xl font-black text-siddha-dark">
              ₹{hasDiscount ? product.discountPrice : product.price}
            </span>
            {hasDiscount && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Size */}
          {product.size && (
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{lang === "ta" ? "அளவு:" : "Size:"}</span>{" "}
              {product.size.value} {product.size.unit}
            </p>
          )}

          {/* Stock */}
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                product.stock > 0 ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <span
              className={`text-xs font-bold ${
                product.stock > 0 ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {product.stock > 0 ? t("product.inStock") : t("product.outOfStock")}
            </span>
            {product.stock > 0 && product.stock < 10 && (
              <span className="text-[10px] text-amber-600 font-semibold">
                ({lang === "ta" ? `மட்டும் ${product.stock} உள்ளது` : `Only ${product.stock} left`})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      {product.description?.[lang] && (
        <div className="mt-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-bold font-display text-emerald-950 mb-4">
            {t("product.description")}
          </h2>
          <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description[lang]}
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingredients */}
        {product.ingredients?.length > 0 && (
          <SectionCard title={lang === "ta" ? "பொருட்கள்" : "Ingredients"}>
            <ul className="space-y-1">
              {product.ingredients.map((item, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-siddha-gold mt-1.5 shrink-0" />
                  {item[lang] || item.en}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Benefits */}
        {product.benefits?.length > 0 && (
          <SectionCard title={lang === "ta" ? "நன்மைகள்" : "Benefits"}>
            <ul className="space-y-1">
              {product.benefits.map((item, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  {item[lang] || item.en}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Usage Instructions */}
        {product.usageInstructions?.length > 0 && (
          <SectionCard title={lang === "ta" ? "பயன்படுத்தும் முறை" : "Usage Instructions"}>
            <ol className="space-y-1 list-decimal list-inside">
              {product.usageInstructions.map((item, i) => (
                <li key={i} className="text-sm text-gray-600">
                  {item[lang] || item.en}
                </li>
              ))}
            </ol>
          </SectionCard>
        )}

        {/* Safety Instructions */}
        {product.safetyInstructions?.length > 0 && (
          <SectionCard title={lang === "ta" ? "பாதுகாப்பு வழிமுறைகள்" : "Safety Instructions"}>
            <ul className="space-y-1">
              {product.safetyInstructions.map((item, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  {item[lang] || item.en}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Storage Instructions */}
        {product.storageInstructions?.length > 0 && (
          <SectionCard title={lang === "ta" ? "சேமிப்பு வழிமுறைகள்" : "Storage Instructions"}>
            <ul className="space-y-1">
              {product.storageInstructions.map((item, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  {item[lang] || item.en}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>

      {/* Tags & Expiry */}
      <div className="mt-6 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 flex flex-wrap items-start gap-8">
        {product.tags?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {lang === "ta" ? "குறிச்சொற்கள்" : "Tags"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200"
                >
                  {tag[lang] || tag.en}
                </span>
              ))}
            </div>
          </div>
        )}
        {product.expiryDuration?.[lang] && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {lang === "ta" ? "காலாவதி" : "Expiry"}
            </h3>
            <p className="text-sm font-semibold text-gray-700">
              {product.expiryDuration[lang]}
            </p>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold font-display text-emerald-950 mb-6">
            {t("product.relatedProducts")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <ProductCardV2 key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8">
      <h3 className="text-base font-bold font-display text-emerald-950 mb-4">{title}</h3>
      {children}
    </div>
  );
}
