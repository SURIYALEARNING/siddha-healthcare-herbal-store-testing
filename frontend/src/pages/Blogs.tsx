import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import { BookOpen, Search, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

function getVal(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

export default function Blogs() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { blogs } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [carouselIndex, setCarouselIndex] = useState<Record<string, number>>({});

  const categories = ["All", "Daily Wellness", "Herbs Science", "Monsoon Care", "Pitha Healing"];

  const filteredBlogs = blogs.filter((blog) => {
    const title = getVal(blog.title, lang).toLowerCase();
    const content = getVal(blog.content, lang).toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || content.includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || blog.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Blog header */}
      <div className="border-b border-gray-100 pb-5 max-w-2xl">
        <h1 className="text-3xl font-bold font-display text-emerald-950 tracking-tight leading-none">
          Traditional Siddha Wellness Blog
        </h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-2 leading-relaxed">
          Unlock dry herbs formulas, diet plans, and pulse self-assessment articles authored by Dr. S. Thirugnanasambandar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* BLOG GRID - LEFT COLUMN (8 cols) */}
        <main className="lg:col-span-8 space-y-8">
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredBlogs.map((blog) => (
                <article 
                  key={blog.id} 
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-emerald-100 transition-all duration-300 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-50 mb-4 relative group">
                      {blog.images && blog.images.length > 1 ? (
                        <>
                          <img
                            src={blog.images[carouselIndex[blog.id] || 0]}
                            alt={getVal(blog.title, lang)}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const current = carouselIndex[blog.id] || 0;
                              const prev = current === 0 ? blog.images!.length - 1 : current - 1;
                              setCarouselIndex({ ...carouselIndex, [blog.id]: prev });
                            }}
                            className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const current = carouselIndex[blog.id] || 0;
                              const next = current === blog.images!.length - 1 ? 0 : current + 1;
                              setCarouselIndex({ ...carouselIndex, [blog.id]: next });
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {blog.images.map((_, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCarouselIndex({ ...carouselIndex, [blog.id]: i });
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                                  (carouselIndex[blog.id] || 0) === i
                                    ? "bg-white w-3"
                                    : "bg-white/50"
                                }`}
                                aria-label={`Image ${i + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <img
                          src={blog.image}
                          alt={getVal(blog.title, lang)}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <span className="bg-emerald-50 text-siddha-dark px-2.5 py-1 rounded-full">{blog.category}</span>
                        <span>•</span>
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-0.5" /> {blog.date}</span>
                      </div>

                      <Link to={`/blogs/${blog.id}`} className="block hover:text-siddha-dark transition-colors">
                        <h2 className="text-base sm:text-lg font-black text-emerald-950 leading-tight tracking-tight">
                          {getVal(blog.title, lang)}
                        </h2>
                      </Link>
                      
                      <p className="text-xs text-gray-500 leading-relaxed lines-clamp-4">
                        {getVal(blog.content, lang)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">By Dr. S Thirugnanasambandar</span>
                    <Link
                      to={`/blogs/${blog.id}`}
                      className="text-xs font-bold text-siddha-dark hover:underline flex items-center gap-0.5 p-1.5 leading-none"
                    >
                      <span>Read Full</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-gray-250 p-6">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-400 mt-2">No authentic essays match query search.</p>
            </div>
          )}
        </main>

        {/* SIDE BAR SEARCH & CATEGORIES LIST - RIGHT COLUMN (4 cols) */}
        <aside className="lg:col-span-4 bg-white border border-gray-150 rounded-2xl p-6 space-y-6 sticky top-24">
          
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Search Essays</h3>
            <div className="relative">
              <input 
                type="text"
                placeholder="Ex. Kabham, Diet, Skin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs focus:bg-white focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Therapeutic Focuses</h3>
            <div className="flex flex-col space-y-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all cursor-pointer ${
                    activeCategory === c 
                      ? "bg-siddha-light text-siddha-dark" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-siddha-dark"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Quote box */}
          <div className="bg-emerald-950 text-white rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-siddha-light rounded-full filter blur-2xl opacity-10"></div>
            <p className="text-[10px] text-siddha-gold uppercase font-bold tracking-widest leading-none">Traditional Shloka Advice</p>
            <p className="text-xs italic leading-relaxed text-emerald-100/90 font-light">
              "Let food be thy medicine, and medicine be thy food. In Siddha scriptures, physical baseline starts with balanced morning humors."
            </p>
            <span className="text-[10px] block text-emerald-300 font-bold uppercase">— Saint Agathiyar, 2500 BCE</span>
          </div>

        </aside>

      </div>
    </div>
  );
}
