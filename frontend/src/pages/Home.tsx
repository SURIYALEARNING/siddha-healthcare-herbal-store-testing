import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import HeroCarousel from "../components/HeroCarousel";
import ProductPromoCarousel from "../components/ProductPromoCarousel";
import SupportCarousel from "../components/SupportCarousel";
import {  Shield, UserCheck,} from "lucide-react";
import Marquee from "../components/Marquee";
import logo from '../assets/logo.png'
import Shop from './Shop'
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  Clock,
  HelpCircle,
  ArrowRight,
  Leaf,
  Award,
  BookOpen
} from "lucide-react";

function getVal(val: any, lang: string): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || "";
}

export default function Home({ onConsultationClick }: { onConsultationClick: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { products, blogs, addToCart, toggleWishlist, isInWishlist } = useApp();
  const navigate = useNavigate();

  // Featured 3 products
  const featuredProducts = products.slice(0, 3);
  // Best Sellers (2 products)
  const bestSellers = products.slice(3, 5);

  const categories = [
    { name: "Immunity Boosters", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600", count: "2 Remedies" },
    { name: "Digestive Care", image: "https://images.unsplash.com/photo-1599639085605-a34414b6d32c?auto=format&fit=crop&q=80&w=600", count: "1 Remedy" },
    { name: "Skin Care", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600", count: "1 Remedy" },
    { name: "Hair Care", image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=600", count: "1 Remedy" }
  ];

  const testimonials = [
    {
      id: 1,
      quote: "The Nalangu Maavu powder is excellent. It leaves my skin radiant, and of course, it smells exactly like the traditional herbs my grandmother used to prepare.",
      author: "Janani Raja",
      location: "Madurai",
      rating: 5
    },
    {
      id: 2,
      quote: "Kabasura Kudineer from Ayush Siddha has become a household staple during monsoon transitions. Highly authentic and clean coarse powder formulation.",
      author: "Ganesh Kuppusamy",
      location: "Chennai",
      rating: 5
    },
    {
      id: 3,
      quote: "Their Bhringraj Vetiver hair oil is genuinely cooling. I suffer from high body temperature and constant hair loss. This oil drastically reduced scalp itching within weeks.",
      author: "Anantharaman",
      location: "Coimbatore",
      rating: 5
    }
  ];

  return (
    <div className="space-y-20 pb-20">

      <HeroCarousel />

  {/* Marquee strip under Brand section */}
      <section className="bg-siddha-dark py-6 -mt-20">
        <Marquee speed={28} gap={56}>
          <span className="text-lg sm:text-2xl lg:text-3xl font-semibold text-white">
            {t("home.marqueeText1")}
          </span>
          <Leaf className="text-green-400 w-6 h-6 sm:w-8 sm:h-8" />
          <span className="text-lg sm:text-2xl lg:text-3xl font-semibold text-white">
            {t("home.marqueeText2")}
          </span>
          <Leaf className="text-green-400 w-6 h-6 sm:w-8 sm:h-8" />
          <span className="text-lg sm:text-2xl lg:text-3xl font-semibold text-white">
            {t("home.marqueeText3")}
          </span>
          <Leaf className="text-green-400 w-6 h-6 sm:w-8 sm:h-8" />
          <span className="text-lg sm:text-2xl lg:text-3xl font-semibold text-white">
            {t("home.marqueeText4")}
          </span>
          <Leaf className="text-green-400 w-6 h-6 sm:w-8 sm:h-8" />
        </Marquee>
      </section>

      {/* Brand Logo + Quote Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="w-full md:w-[40%] flex justify-center">
            <img
              src={logo}
              alt="SRILAKSHMI HERBALS ROCKFORT Logo"
              className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-full md:w-[60%] text-center md:text-left space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 tracking-tight">
              {t("home.brandHeading")}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic font-serif">
              {t("home.brandQuote")}
            </p>
            <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">
              {t("home.brandCertification")}
            </p>
          </div>
        </div>
      </section>

    
     {/* 3. SUPPORT HIGHLIGHTS CAROUSEL */}
      <section className="w-full px-0">
        <section className="bg-slate-50 border border-slate-100 rounded-3xl py-10 px-0 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-siddha-dark uppercase tracking-widest block">{t("about.carouselSection")}</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 tracking-tight">
            {t("about.carouselHeading")}
          </h2>
        </div>
        <SupportCarousel
          items={[
            { id: "authentic", title: t("about.authenticTitle"), description: t("about.authenticDesc"), icon: <Leaf className="w-8 h-8" /> },
            { id: "certified", title: t("about.certifiedTitle"), description: t("about.certifiedDesc"), icon: <Award className="w-8 h-8" /> },
            { id: "metal-free", title: t("about.metalFreeTitle"), description: t("about.metalFreeDesc"), icon: <Shield className="w-8 h-8" /> },
            { id: "telemedicine", title: t("about.telemedicineTitle"), description: t("about.telemedicineDesc"), icon: <UserCheck className="w-8 h-8" /> },
            { id: "care", title: t("about.familyCareTitle"), description: t("about.familyCareDesc"), icon: <Heart className="w-8 h-8" /> },
          ]}
          cardWidth={380}
          cardHeight={190}
          speed={40}
          pauseOnHover
        />
        </section>
      </section>
     

      <ProductPromoCarousel />

      <Shop />

      {/* 6. HEALTH ARTICLES & BLOG PREVIEWS */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs font-bold text-siddha-dark uppercase tracking-widest block mb-1">{t("home.blogSection")}</span>
              <h2 className="text-3xl font-bold font-display text-emerald-950 tracking-tight">{t("home.blogTitle")}</h2>
            </div>
            <Link
              to="/blogs"
              className="text-sm font-bold text-siddha-dark hover:text-emerald-800 flex items-center space-x-1"
            >
              <BookOpen className="w-4 h-4 mr-0.5" />
              <span>{t("home.readAllArticles")}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.slice(0, 3).map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-150 p-4 hover:shadow-lg transition-all"
              >
                <div className="w-full h-44 overflow-hidden rounded-xl bg-slate-100 mb-4">
                  <img
                    src={blog.image}
                    alt={getVal(blog.title, lang)}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] bg-emerald-50 text-siddha-dark font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {blog.category}
                  </span>
                  <p className="text-xs text-gray-400 font-semibold">{blog.date}</p>
                  <Link to={`/blogs/${blog.id}`} className="block hover:text-siddha-dark transition-colors">
                    <h3 className="text-base font-bold text-emerald-900 leading-snug">
                      {getVal(blog.title, lang)}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 leading-relaxed lines-clamp-3">
                    {getVal(blog.content, lang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-siddha-dark uppercase tracking-widest">{t("home.testimonials")}</span>
          <h2 className="text-3xl font-bold font-display text-emerald-950 tracking-tight">{t("home.testimonialsTitle")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4 hover:border-emerald-100 transition-all"
            >
              <div className="flex text-amber-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase">{t.author}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold">{t.location}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-siddha-light flex items-center justify-center text-siddha-dark text-xs font-bold">
                  ✓
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
