import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import HeroCarousel from "../components/HeroCarousel";
import ProductPromoCarousel from "../components/ProductPromoCarousel";
import { promoData } from "../data/promoData";
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

export default function Home({ onConsultationClick }: { onConsultationClick: () => void }) {
  const { t } = useTranslation();
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

      {/* Brand Logo + Quote Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="w-full md:w-[40%] flex justify-center">
            <img
              src={logo}
              alt="Siddha Healthcare Logo"
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

      {/* 2. WHY CHOOSE US? BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold font-serif text-emerald-950 tracking-tight">
            {t("home.whyChooseUs")}
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed font-sans">
            {t("home.whyChooseUsDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#fdfdfb] p-6 rounded-2xl border border-[#14532D]/10 hover:border-[#D4AF37]/30 transition-all text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-siddha-light rounded-full flex items-center justify-center text-siddha-dark mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-950 text-sm font-serif">{t("home.benefitAyush")}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("home.benefitAyushDesc")}
            </p>
          </div>

          <div className="bg-[#fdfdfb] p-6 rounded-2xl border border-[#14532D]/10 hover:border-[#D4AF37]/30 transition-all text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-siddha-light rounded-full flex items-center justify-center text-siddha-dark mx-auto">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-950 text-sm font-serif">{t("home.benefitNatural")}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("home.benefitNaturalDesc")}
            </p>
          </div>

          <div className="bg-[#fdfdfb] p-6 rounded-2xl border border-[#14532D]/10 hover:border-[#D4AF37]/30 transition-all text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-siddha-light rounded-full flex items-center justify-center text-siddha-dark mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-950 text-sm font-serif">{t("home.benefitAI")}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("home.benefitAIDesc")}
            </p>
          </div>

          <div className="bg-[#fdfdfb] p-6 rounded-2xl border border-[#14532D]/10 hover:border-[#D4AF37]/30 transition-all text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-siddha-light rounded-full flex items-center justify-center text-siddha-dark mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-950 text-sm font-serif">{t("home.benefitOnline")}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("home.benefitOnlineDesc")}
            </p>
          </div>
        </div>
      </section>

      <ProductPromoCarousel items={promoData} />

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
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] bg-emerald-50 text-siddha-dark font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {blog.category}
                  </span>
                  <p className="text-xs text-gray-400 font-semibold">{blog.date}</p>
                  <Link to="/blogs" className="block hover:text-siddha-dark transition-colors">
                    <h3 className="text-base font-bold text-emerald-900 leading-snug">
                      {blog.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 leading-relaxed lines-clamp-3">
                    {blog.content}
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

      {/* footer details */}
      <footer className="bg-emerald-950 text-emerald-200 text-xs py-8 px-4 rounded-t-3xl border-t border-emerald-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold mb-3">{t("footer.storeName")}</h4>
            <p className="text-emerald-300 leading-relaxed font-light">
              {t("footer.storeDescription")}
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">{t("footer.remediesLibrary")}</h4>
            <ul className="space-y-1 text-emerald-300 font-light">
              <li><Link to="/shop?category=Immunity%20Boosters" className="hover:text-white">{t("footer.immunityBoosters")}</Link></li>
              <li><Link to="/shop?category=Digestive%20Care" className="hover:text-white">{t("footer.digestiveCare")}</Link></li>
              <li><Link to="/shop?category=Skin%20Care" className="hover:text-white">{t("footer.skinCare")}</Link></li>
              <li><Link to="/shop?category=Hair%20Care" className="hover:text-white">{t("footer.hairCare")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">{t("footer.shortcuts")}</h4>
            <ul className="space-y-1 text-emerald-300 font-light">
              <li><Link to="/track-order" className="hover:text-white">{t("footer.trackOrder")}</Link></li>
              <li><button onClick={onConsultationClick} className="hover:text-white text-left">{t("footer.bookConsultation")}</button></li>
              <li><Link to="/about" className="hover:text-white">{t("footer.aboutClinic")}</Link></li>
              <li><Link to="/contact" className="hover:text-white">{t("footer.contactPage")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">{t("footer.addressLocation")}</h4>
            <p className="text-emerald-350 leading-relaxed font-light">
              {t("footer.clinicName")}<br />
              {t("footer.addressLine1")}<br />
              {t("footer.addressLine2")}
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center border-t border-emerald-900/50 mt-8 pt-4 text-[11px] text-emerald-400">
          {t("footer.copyrightText")}
        </div>
      </footer>

    </div>
  );
}
