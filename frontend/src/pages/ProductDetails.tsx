import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Star,
  Heart,
  ShoppingBag,
  ChevronLeft,
  CheckCircle2,
  Info,
  Sparkles,
  Lock,
  User,
  Send
} from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, isInWishlist } = useApp();


  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("benefits");

  // Review inputs
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [localReviews, setLocalReviews] = useState<any[]>([]);




  useEffect(() => {
    const prod = products.find((p) => p._id === id);
    if (prod) {
      setProduct(prod);
      setActiveImage(prod.images[0]);
      setLocalReviews(prod.reviews || []);
    }
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
  const inFav = isInWishlist(product._id);

  // Filter related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p._id !== product._id)
    .slice(0, 3);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      const savedUser = localStorage.getItem("siddha_user");
      const headers: { [key: string]: string } = { "Content-Type": "application/json" };
      if (savedUser) {
        const u = JSON.parse(savedUser);
        headers["Authorization"] = `Bearer ${u._id}`;
      }

      const res = await fetch(`/api/products/${product._id}/review`, {
        method: "POST",
        headers,
        body: JSON.stringify({ rating: ratingInput, comment: commentInput })
      });

      if (res.ok) {
        const data = await res.json();
        setLocalReviews(data.reviews);
        setCommentInput("");
        setReviewSuccess("Review submitted successfully! Thank you for sharing your healing feedback.");
        setTimeout(() => setReviewSuccess(""), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Back button */}
      <Link
        to="/shop"
        className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-siddha-dark uppercase tracking-wider mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Remedies Gallery</span>
      </Link>

      {/* Main product card columns */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* LEFT COMPONENT - IMAGE GALLERY */}
        <div className="lg:col-span-5 space-y-4">
          <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-50 overflow-hidden relative border border-gray-100 p-2">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-siddha-gold text-siddha-dark text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-xs">
                Offer
              </span>
            )}
          </div>

          {/* Sibling Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img: string, _idx: number) => (
                <button
                  key={_idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-18 h-18 rounded-lg overflow-hidden border-2 bg-slate-50 relative shrink-0 cursor-pointer ${activeImage === img ? "border-siddha-dark" : "border-gray-200"
                    }`}
                >
                  <img src={img} alt={`Thumb ${_idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COMPONENT - META DETAILS */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">

          <div className="space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <span className="text-xs bg-siddha-light text-siddha-dark font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-emerald-950 tracking-tight leading-tight mt-2.5">
                  {product.name}
                </h1>
              </div>

              {/* Wishlist Button right */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-3 rounded-full border border-gray-150 transition-colors shrink-0 cursor-pointer ${inFav ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-white text-gray-400 hover:text-rose-600"
                  }`}
                title="Save product to wishlist"
              >
                <Heart className={`w-5 h-5 ${inFav ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Ratings summary */}
            <div className="flex items-center space-x-2 text-xs text-amber-500 font-bold">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 fill-current ${i < Math.floor(product.rating) ? "text-amber-400" : "text-gray-200"
                      }`}
                  />
                ))}
              </div>
              <span className="text-gray-800 ml-1">{product.rating} / 5.0</span>
              <span className="text-gray-450 font-semibold">({localReviews.length} Verified Reviews)</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline space-x-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-fit">
              <span className="text-2xl font-black text-siddha-dark">₹{product.discountPrice}</span>
              {hasDiscount && (
                <>
                  <span className="text-sm font-semibold text-gray-400 line-through">₹{product.price}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Save ₹{product.price - product.discountPrice}
                  </span>
                </>
              )}
            </div>

            {/* Description brief */}
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Stock status indicator */}
            <div className="flex items-center space-x-1.5 text-xs font-bold">
              <span className="text-gray-400 uppercase">Availability State:</span>
              {product.stock > 0 ? (
                <span className="text-emerald-700 flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-0.5" />
                  In Stock ({product.stock} pieces left)
                </span>
              ) : (
                <span className="text-rose-600">Sold out</span>
              )}
            </div>
          </div>

          {/* Action row (quantity multiplier & buy keys) */}
          {product.stock > 0 ? (
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-gray-50 text-gray-600 font-bold text-sm select-none"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-bold text-gray-800 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 bg-gray-50 text-gray-600 font-bold text-sm select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="w-full py-3.5 px-6 bg-siddha-light hover:bg-[#cbfcd9] text-siddha-dark font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Bag</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-6 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-950/10"
                >
                  Buy Remedy Now
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
              <p className="text-xs font-bold text-rose-700">Currently out of stock</p>
              <p className="text-[10px] text-rose-600/80 mt-1">Our siddhars are sorting ingredients for a brand new batch. Ask Agathiyar AI on the corner for restock timelines!</p>
            </div>
          )}

          {/* Trust strip */}
          <div className="flex justify-around bg-slate-50 border border-slate-100 rounded-2xl py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest divide-x divide-gray-150">
            <div className="flex-1">Ministry of Ayush</div>
            <div className="flex-1">Zero Chemical pres.</div>
            <div className="flex-1">India-wide Delivery</div>
          </div>

        </div>
      </div>

      {/* Tabs / Stacked specifications sections (Ingredients, Benefits, Guidelines) */}
      <section className="mt-12 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 space-y-6">
        <div className="flex space-x-1.5 border-b border-gray-100 pb-2 overflow-x-auto">
          {["ingredients", "benefits", "usage"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0 ${activeTab === tab
                  ? "bg-siddha-dark text-white"
                  : "text-gray-400 hover:text-gray-700 hover:bg-slate-50"
                }`}
            >
              {tab === "usage" ? "How to Use" : tab}
            </button>
          ))}
        </div>

        {/* Tab content renders */}
        <div className="pt-2">
          {activeTab === "ingredients" && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                <Info className="w-4 h-4 text-siddha-dark mr-1.5" />
                Raw Organic Sourcing list:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.ingredients?.map((ing: string, _idx: number) => (
                  <li key={_idx} className="flex items-center space-x-2 text-xs text-gray-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-2 h-2 rounded-full bg-siddha-gold"></span>
                    <span className="font-semibold">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "benefits" && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                <Sparkles className="w-4 h-4 text-siddha-gold animate-bounce mr-1.5" />
                Therapeutic Health Advantages:
              </p>
              <ul className="space-y-2">
                {product.benefits?.map((ben: string, _idx: number) => (
                  <li key={_idx} className="flex items-start space-x-2 text-xs text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-s_iddha-dark shrink-0 mt-1.5"></span>
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "usage" && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                <Info className="w-4 h-4 text-siddha-dark mr-1.5" />
                Direction Rules & Dosage Levels:
              </p>
              <ol className="space-y-3">
                {product.usageInstructions?.map((ins: string, _idx: number) => (
                  <li key={_idx} className="flex space-x-3 text-xs text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-siddha-light text-siddha-dark flex items-center justify-center font-bold text-[10px] shrink-0">
                      {_idx + 1}
                    </span>
                    <span className="pt-0.5">{ins}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS COMMENTS & IN-APP SUBMISSIONS */}
      <section className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Review list */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 space-y-6">
          <h3 className="text-lg font-bold text-emerald-950 font-display">
            Buyer Feedback ({localReviews.length})
          </h3>

          {localReviews.length > 0 ? (
            <div className="space-y-4 divide-y divide-gray-100">
              {localReviews.map((rev: any, _idx: number) => (
                <div key={rev._id || _idx} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 rounded-full bg-siddha-light text-siddha-dark flex items-center justify-center font-bold text-[10px]">
                        {rev.user.substring(0, 1)}
                      </div>
                      <span className="font-bold text-gray-700">{rev.user}</span>
                      <span className="text-emerald-700 bg-emerald-50 text-[9px] px-1.5 rounded font-black uppercase">Verified Buyer</span>
                    </div>
                    <span className="text-gray-400 font-semibold">{rev.date}</span>
                  </div>

                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 fill-current ${i < rev.rating ? "text-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <p className="text-xs text-gray-400">No review comments yet. Be the first to try this remedy and leave a testimony!</p>
            </div>
          )}
        </div>

        {/* Input Add Review (In-App) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 sm:p-10 space-y-4 h-fit">
          <h3 className="text-lg font-bold text-emerald-950 font-display">Write a Testimony</h3>
          <p className="text-[11px] text-gray-400 block uppercase font-bold tracking-widest leading-none">Share physical health shifts with the clinic</p>

          {reviewSuccess && (
            <p className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-xs font-semibold">
              {reviewSuccess}
            </p>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">Remedy Rating</label>
              <div className="flex space-x-1.5">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRatingInput(starVal)}
                    className="p-1 cursor-pointer transition-transform duration-100 hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 fill-current ${ratingInput >= starVal ? "text-amber-400" : "text-gray-200"
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">Review Comment</label>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Ex. Restored my morning digestion. Highly recommend with warm water!"
                rows={4}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none placeholder-gray-400 text-gray-800 transition-colors resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
              disabled={!commentInput.trim()}
            >
              <Send className="w-4 h-4" />
              <span>Submit Testimony</span>
            </button>

          </form>
        </div>

      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 space-y-8">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-emerald-950 font-display">Related Traditional Remedies</h2>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">Siddhars highly recommend marrying these associated cures</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => {
              const inFav = isInWishlist(p._id);
              const isDiscounted = p.discountPrice < p.price;

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-100 transition-all p-4 group flex flex-col hover:shadow-md relative"
                >
                  <button
                    onClick={() => toggleWishlist(p._id)}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/80 text-rose-600 hover:bg-white z-10 cursor-pointer shadow-xs"
                  >
                    <Heart className={`w-3.5 h-3.5 ${inFav ? "fill-rose-500" : ""}`} />
                  </button>

                  <div className="w-full h-40 overflow-h_idden rounded-xl bg-slate-50 mb-4">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <Link to={`/products/${p._id}`} className="group-hover:text-siddha-dark transition-colors">
                    <h4 className="font-bold text-emerald-950 text-xs sm:text-sm lines-clamp-2 min-h-10 leading-tight">
                      {p.name}
                    </h4>
                  </Link>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                    <span className="text-base font-black text-siddha-dark">₹{p.discountPrice}</span>
                    <Link to={`/products/${p._id}`} className="text-xs font-semibold text-emerald-700 hover:underline">
                      See Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
