import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Calendar, User, Clock } from "lucide-react";
import { fetchBlogByIdApi } from "../api/blogs";
import { Spinner } from "../components/ui/Spinner";
import type { Blog } from "../types";

function getVal(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

export default function BlogDetails() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { id } = useParams();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetchBlogByIdApi(id)
      .then((data) => { if (!cancelled) setBlog(data); })
      .catch(() => { if (!cancelled) setBlog(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!blog || !blog.images || blog.images.length < 2) return;
    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % blog.images!.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [blog]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <Spinner size="lg" className="py-20" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">{t("Blog not found")}</h2>
        <Link to="/blogs" className="text-sm font-bold text-siddha-dark hover:underline">
          {t("Back to Blogs")}
        </Link>
      </div>
    );
  }

  const images = blog.images && blog.images.length > 0 ? blog.images : (blog.image ? [blog.image] : []);
  const title = getVal(blog.title, lang);
  const content = getVal(blog.content, lang);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/blogs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-siddha-dark uppercase tracking-wider mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        {t("Back to Articles")}
      </Link>

      <article className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        {images.length > 0 && (
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[480px] overflow-hidden bg-slate-100">
            <img
              src={images[imgIndex]}
              alt={title}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-700 shadow cursor-pointer"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setImgIndex((prev) => (prev + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-700 shadow cursor-pointer"
                  aria-label="Next"
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        i === imgIndex ? "bg-white w-4" : "bg-white/50"
                      }`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="p-6 sm:p-10 lg:p-12 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            <span className="bg-emerald-50 text-siddha-dark px-3 py-1 rounded-full">{blog.category}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {blog.date}</span>
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {blog.author}</span>
            {blog.reads > 0 && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {blog.reads} reads</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-emerald-950 tracking-tight leading-tight">
            {title}
          </h1>

          <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {content}
          </div>
        </div>
      </article>

      <div className="mt-8 text-center">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-sm font-bold text-siddha-dark hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("View all articles")}
        </Link>
      </div>
    </div>
  );
}
