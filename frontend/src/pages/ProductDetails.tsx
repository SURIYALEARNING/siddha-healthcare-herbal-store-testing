import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ChevronLeft, Truck, CheckCircle, XCircle, Loader2 } from "lucide-react";
import ImageGallery from "../components/product/ImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductActions from "../components/product/ProductActions";
import ProductTabs from "../components/product/ProductTabs";
import ReviewSection from "../components/product/ReviewSection";
import RelatedProducts from "../components/product/RelatedProducts";
import { Spinner } from "../components/ui/Spinner";
import type { Product, PincodeResponse } from "../types";
import { fetchProductByIdApi } from "../api/products";
import { checkPincodeApi, checkMyAddressApi } from "../api/shipping";

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
  const { user, products, addToCart, toggleWishlist, isInWishlist } = useApp();
  const productsRef = useRef(products);
  productsRef.current = products;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<PincodeResponse | null>(null);
  const [pincodeError, setPincodeError] = useState("");

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

  useEffect(() => {
    if (user && user.address?.pincode) {
      setPincodeLoading(true);
      checkMyAddressApi()
        .then((res) => setPincodeResult(res))
        .catch(() => setPincodeError(t('productDetails.deliveryCheckFailed')))
        .finally(() => setPincodeLoading(false));
    }
  }, [user?.address?.pincode]);

  const handleCheckPincode = async () => {
    const pin = pincodeInput.trim();
    if (!/^\d{6}$/.test(pin)) {
      setPincodeError(t('productDetails.invalidPincode'));
      return;
    }
    setPincodeLoading(true);
    setPincodeError("");
    setPincodeResult(null);
    try {
      const res = await checkPincodeApi(pin);
      setPincodeResult(res);
    } catch {
      setPincodeError(t('productDetails.deliveryCheckFailed'));
    } finally {
      setPincodeLoading(false);
    }
  };

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
        <span>{t('Remedies Gallery')}</span>
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
            <div className="flex-1">{t('Ministry Badge')}</div>
            <div className="flex-1">{t('Zero Chemical Badge')}</div>
            <div className="flex-1">{t('India Delivery Badge')}</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <Truck className="w-4 h-4 text-siddha-dark" />
              {t('Delivery To')}
            </div>

            {user?.address?.pincode ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-800">
                  {t('Delivering To')} {user.address.pincode}
                </p>
                {pincodeLoading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t('Checking Delivery')}
                  </div>
                ) : pincodeResult ? (
                  <DeliveryResult result={pincodeResult} />
                ) : pincodeError ? (
                  <p className="text-xs text-rose-600">{pincodeError}</p>
                ) : null}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincodeInput}
                  onChange={(e) => { setPincodeInput(e.target.value); setPincodeError(""); }}
                  placeholder={t('Enter Pincode')}
                  maxLength={6}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white"
                />
                <button
                  onClick={handleCheckPincode}
                  disabled={pincodeLoading}
                  className="px-4 py-2 bg-siddha-dark text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {pincodeLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    t('check')
                  )}
                </button>
              </div>
            )}

            {pincodeError && !user?.address?.pincode && (
              <p className="text-xs text-rose-600">{pincodeError}</p>
            )}

            {pincodeResult && !user?.address?.pincode && (
              <DeliveryResult result={pincodeResult} />
            )}
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

function DeliveryResult({ result }: { result: PincodeResponse }) {
  const { t } = useTranslation();
  if (!result.available) {
    return (
      <div className="flex items-start gap-2 text-xs">
        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-rose-700">{t('Delivery Not Available')}</p>
          <p className="text-gray-500 mt-0.5">{result.message}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-semibold text-emerald-700">{t('Delivery Available')}</span>
      </div>
      {result.estimatedDays && (
        <p className="text-[11px] text-gray-500">
          {t('Estimated Delivery')} {result.estimatedDays} {t('Days')}
        </p>
      )}
      {/* <div className="flex gap-3 text-[11px]">
        {result.codAvailable && (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle className="w-3 h-3" /> {t('productDetails.codAvailable')}
          </span>
        )}
        {result.prepaidAvailable && (
          <span className="inline-flex items-center gap-1 text-siddha-dark font-medium">
            <CheckCircle className="w-3 h-3" /> {t('productDetails.prepaidAvailable')}
          </span>
        )}
      </div> */}
      {/* {result.courier && (
        <p className="text-[10px] text-gray-400">
          {t('productDetails.by')} {result.courier.name}
        </p>
      )} */}
    </div>
  );
}
