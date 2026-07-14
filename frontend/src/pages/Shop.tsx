import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Star, Heart, ShoppingBag, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export default function Shop() {
  const { products, addToCart, toggleWishlist, isInWishlist } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();



  // States for filter conditions
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state with URL params (like from Home Page Category Clicks)
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setCategoryFilter(cat);
    }
  }, [searchParams]);

  const categories = ["All", "Immunity Boosters", "Digestive Care", "Skin Care", "Hair Care"];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    const matchesPrice = p.discountPrice <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.discountPrice - b.discountPrice;
    if (sortBy === "price-high") return b.discountPrice - a.discountPrice;
    if (sortBy === "best-selling") return b.reviews.length - a.reviews.length;

    // 'newest' - Fixed by using MongoDB's _id
  
    
    return b._id.localeCompare(a._id);
  });


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Title Header */}
      <div className="mb-8 border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-bold font-display text-emerald-950 tracking-tight leading-none">
          Traditional Therapeutics Pharmacy
        </h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-2">
          Discover handpicked organic Siddha medicines, certified by Ministry of AYUSH
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 space-y-6 sticky top-24">

          {/* Search */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Search Catalog</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex. Kabasura, Sandal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark focus:bg-white text-gray-800 transition-colors"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</h3>
            <div className="flex flex-col space-y-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategoryFilter(c);
                    setSearchParams({});
                  }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer ${categoryFilter === c
                      ? "bg-siddha-light text-siddha-dark"
                      : "text-gray-500 hover:bg-gray-50 hover:text-siddha-dark"
                    }`}
                >
                  <span>{c}</span>
                  {categoryFilter === c && <span className="text-[10px] font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs text-gray-400 uppercase font-bold">
              <span>Max Budget Price</span>
              <span className="text-siddha-dark font-black">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-siddha-dark bg-slate-100 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
              <span>₹100</span>
              <span>₹1000</span>
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Sorter</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2.5 border border-gray-150 rounded-xl text-xs bg-gray-50 text-gray-600 focus:outline-none focus:border-siddha-dark cursor-pointer"
            >
              <option value="newest">Newest Launch</option>
              <option value="best-selling">Top Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </aside>

        {/* MOBILE CONTROLS & PRODUCT GRID AREA */}
        <main className="lg:col-span-9 space-y-6">

          {/* Mobile search bar and filters trigger */}
          <div className="lg:hidden flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search herbal remedies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white border border-gray-150 rounded-xl text-xs focus:outline-none focus:border-siddha-dark text-gray-800"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-3 bg-white border border-gray-150 rounded-xl text-xs font-medium text-gray-600 active:bg-gray-50 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters {categoryFilter !== "All" ? `(${categoryFilter})` : ""}</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none p-3 border border-gray-150 bg-white rounded-xl text-xs text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest Item</option>
                <option value="best-selling">Best Sellers</option>
                <option value="price-low">Price Low-High</option>
                <option value="price-high">Price High-Low</option>
              </select>
            </div>
          </div>

          {/* Horizontal drawer for mobile filters */}
          {mobileFiltersOpen && (
            <div className="lg:hidden p-5 bg-white border border-emerald-100 rounded-2xl space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter & Refine Remedials</h3>
              <div className="space-y-3">

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Therapeutic Categories</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCategoryFilter(c);
                          setSearchParams({});
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-colors border ${categoryFilter === c
                            ? "bg-siddha-dark text-white border-siddha-dark"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-gray-400 uppercase font-bold mb-1">
                    <span>Upper Price Limit:</span>
                    <span className="text-siddha-dark font-black">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-siddha-dark bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-2 bg-siddha-dark text-white text-xs font-bold rounded-xl"
              >
                Apply Criteria
              </button>
            </div>
          )}

          {/* Results statement */}
          <div className="flex justify-between items-center px-2">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Displaying <span className="text-gray-800 font-bold">{sortedProducts.length}</span> results
              {categoryFilter !== "All" && <span> within {categoryFilter}</span>}
            </p>
          </div>

          {/* Product Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((p) => {
                const hasDiscount = p.discountPrice < p.price;
                const inFav = isInWishlist(p._id);

                return (
                  <div
                    key={p._id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-emerald-150 transition-all flex flex-col hover:shadow-md relative group p-4"
                  >

                    {/* Floating top pills */}
                    <div className="absolute top-6 left-6 flex flex-col space-y-1 z-10">
                      {hasDiscount && (
                        <span className="bg-[#a49870] text-siddha-dark text-[9px] font-black uppercase px-2 py-0.5 rounded">
                          Offer
                        </span>
                      )}
                      {p.stock <= 0 ? (
                        <span className="bg-rose-100 text-rose-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          Sold Out
                        </span>
                      ) : p.stock < 10 ? (
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          Short Stock
                        </span>
                      ) : null}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(p._id)}
                      className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white text-rose-600 hover:text-rose-700 transition-colors shadow-xs z-10 cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${inFav ? "fill-rose-600 text-rose-600" : ""}`} />
                    </button>

                    {/* Image */}
                    <div className="w-full h-44 rounded-xl bg-slate-50 overflow-hidden mb-4">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Stars */}
                    <div className="flex items-center text-xs text-amber-500 space-x-1.5 mb-1.5 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                      <span className="text-gray-700">{p.rating}</span>
                      <span className="text-gray-400 font-semibold">({p.reviews.length})</span>
                    </div>

                    {/* Info */}
                    <Link to={`/products/${p._id}`} className="group-hover:text-siddha-dark transition-colors">
                      <h3 className="font-bold text-emerald-950 text-sm tracking-tight leading-snug lines-clamp-2 min-h-10">
                        {p.name}
                      </h3>
                    </Link>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">
                      {p.category}
                    </p>

                    {/* Actions panel */}
                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-50">
                      <div className="flex items-baseline space-x-1.5">
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">₹{p.price}</span>
                        )}
                        <span className="text-base font-black text-siddha-dark">₹{p.discountPrice}</span>
                      </div>

                      {p.stock > 0 ? (
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="px-3.5 py-1.5 bg-siddha-light hover:bg-[#cbfcd9] text-siddha-dark rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-gray-400">Sold out</span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-gray-400 mx-auto">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-emerald-950">No remedies match filters</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                We couldn't located any traditional offerings aligned with your filters. Clear keywords or slide price filter bounds upwards.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                  setMaxPrice(1000);
                  setSearchParams({});
                }}
                className="px-4 py-2 bg-siddha-dark text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}
