import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
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

      {/* 1. HERO BANNER SECTION */}
      <section className="relative bg-gradient-to-br from-emerald-950 via-siddha-dark to-slate-900 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(220,252,231,0.08),transparent)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-800/40 border border-emerald-500/20 rounded-full text-xs font-semibold text-siddha-light uppercase tracking-wider">
                <Leaf className="w-3.5 h-3.5 text-siddha-gold" />
                <span>100% Traditional Siddha Medicine</span>
              </div>
              <h1 className="text-4xl sm:text-5.5xl font-black font-display leading-tight tracking-tight">
                Ancient Herbal Secrets for <br className="hidden sm:inline" />
                <span className="text-siddha-light">Modern Lifespans</span>
              </h1>
              <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                Connect directly with certified Siddha Doctors (Ayush Board) and discover premium organic remedies carefully made from pure herbs floating in cold-pressed natural oils. Restore your life's three humors: Vatham, Pitham & Kabham.
              </p>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start pt-4">
                <Link
                  to="/shop"
                  className="px-8 py-4 bg-siddha-gold hover:bg-yellow-500 text-siddha-dark rounded-xl font-bold tracking-tight text-center transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg shadow-yellow-500/10"
                >
                  Shop Pure Remedies
                </Link>
                <button
                  onClick={onConsultationClick}
                  className="px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/25 text-white rounded-xl font-bold tracking-tight text-center transition-all cursor-pointer"
                >
                  Book Free Consultation
                </button>
              </div>

              {/* Badges preview */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-emerald-800/50 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <h4 className="text-lg font-bold text-siddha-gold">Ayush</h4>
                  <p className="text-xs text-emerald-250">Ministry Certified</p>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className="text-lg font-bold text-siddha-gold">100%</h4>
                  <p className="text-xs text-emerald-250">Handcrafted Organic</p>
                </div>
                <div className="text-center lg:text-left">
                  <h4 className="text-lg font-bold text-siddha-gold">5.0★</h4>
                  <p className="text-xs text-emerald-250">Client Trust Score</p>
                </div>
              </div>
            </div>

            {/* Hero Interactive Card / Image */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-siddha-gold to-emerald-500 rounded-3xl blur-md opacity-25"></div>
              <div className="relative bg-white rounded-3xl p-6 text-gray-800 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-siddha-light rounded-full filter blur-xl opacity-30 -mr-6 -mt-6"></div>

                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
                  alt="Traditional Siddha Decoction Herbs"
                  className="w-full h-48 object-cover rounded-2xl mb-5 shadow-xs"
                  referrerPolicy="no-referrer"
                />

                <span className="bg-emerald-100 text-siddha-dark text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full">
                  Doctor's Pick
                </span>
                <h3 className="text-lg font-bold text-emerald-950 mt-2">
                  Premium Kabasura Kudineer Pack
                </h3>
                <p className="text-xs text-gray-500 mt-1 lines-clamp-2">
                  15 powerful herbal ingredients blended nicely to reinforce immediate respiratory protection against monsoon seasonal flus.
                </p>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-400 line-through">₹180</span>
                    <span className="text-lg font-black text-siddha-dark ml-1 p-0.5">₹145</span>
                  </div>
                  <Link
                    to="/products/prod-1"
                    className="flex items-center space-x-1 text-xs font-bold text-siddha-dark hover:text-emerald-800 transition-colors"
                  >
                    <span>View Recipe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY CHOOSE US? BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold font-serif text-emerald-950 tracking-tight">
            Restoring Balanced Humors Since 2012
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed font-sans">
            Siddha medicine acknowledges that a perfect baseline of health implies a state of harmony among the three vital fluids: wind (Vatham), fire (Pitham), and phlegm (Kabham).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#fdfdfb] p-6 rounded-2xl border border-[#14532D]/10 hover:border-[#D4AF37]/30 transition-all text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-siddha-light rounded-full flex items-center justify-center text-siddha-dark mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-950 text-sm font-serif">Ministry of AYUSH</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Approved formulations meticulously manufactured meeting GMP standards of traditional Indian systems.
            </p>
          </div>

          <div className="bg-[#fdfdfb] p-6 rounded-2xl border border-[#14532D]/10 hover:border-[#D4AF37]/30 transition-all text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-siddha-light rounded-full flex items-center justify-center text-siddha-dark mx-auto">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-950 text-sm font-serif">Natural Ingredients Only</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Strictly zero heavy metal, zero chemical dyes, zero artificial preservatives. Crafted purely from dry herbs.
            </p>
          </div>

          <div className="bg-[#fdfdfb] p-6 rounded-2xl border border-[#14532D]/10 hover:border-[#D4AF37]/30 transition-all text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-siddha-light rounded-full flex items-center justify-center text-siddha-dark mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-950 text-sm font-serif">AI Health Grounding</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Our Agathiyar AI Assistant chatbot resolves any daily wellness or herbal inquiry from standard traditional scriptures instantly.
            </p>
          </div>

          <div className="bg-[#fdfdfb] p-6 rounded-2xl border border-[#14532D]/10 hover:border-[#D4AF37]/30 transition-all text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-siddha-light rounded-full flex items-center justify-center text-siddha-dark mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-emerald-950 text-sm font-serif">Online Prescriptions</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Schedule live virtual tele-consultations and get herbal prescriptions delivered straight onto your doorstep.
            </p>
          </div>
        </div>
      </section>

  


      <Shop />


   



      {/* 6. HEALTH ARTICLES & BLOG PREVIEWS */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs font-bold text-siddha-dark uppercase tracking-widest block mb-1">Ancient Sciences</span>
              <h2 className="text-3xl font-bold font-display text-emerald-950 tracking-tight">Siddha Wellness Blog</h2>
            </div>
            <Link
              to="/blogs"
              className="text-sm font-bold text-siddha-dark hover:text-emerald-800 flex items-center space-x-1"
            >
              <BookOpen className="w-4 h-4 mr-0.5" />
              <span>Read All Articles</span>
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
          <span className="text-xs font-bold text-siddha-dark uppercase tracking-widest">Our Devotees</span>
          <h2 className="text-3xl font-bold font-display text-emerald-950 tracking-tight">Stories of Natural Recovery</h2>
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
            <h4 className="text-white font-bold mb-3">Siddha Healing Store</h4>
            <p className="text-emerald-300 leading-relaxed font-light">
              We preserve natural herbal wisdom under direct BSMS physician supervisions, formulating safe organic remedies.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Remedies Library</h4>
            <ul className="space-y-1 text-emerald-300 font-light">
              <li><Link to="/shop?category=Immunity%20Boosters" className="hover:text-white">Immunity Boosters</Link></li>
              <li><Link to="/shop?category=Digestive%20Care" className="hover:text-white">Digestive Care</Link></li>
              <li><Link to="/shop?category=Skin%20Care" className="hover:text-white">Skin Care</Link></li>
              <li><Link to="/shop?category=Hair%20Care" className="hover:text-white">Hair Care</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Shortcuts</h4>
            <ul className="space-y-1 text-emerald-300 font-light">
              <li><Link to="/track-order" className="hover:text-white">Track Order ID</Link></li>
              <li><button onClick={onConsultationClick} className="hover:text-white text-left">Book Consultation</button></li>
              <li><Link to="/about" className="hover:text-white">About the Clinic</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Page</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Address Location</h4>
            <p className="text-emerald-350 leading-relaxed font-light">
              Ayush Siddha Clinic<br />
              12, Traditional Herb Street,<br />
              Tamil Nadu, India.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center border-t border-emerald-900/50 mt-8 pt-4 text-[11px] text-emerald-400">
          © 2026 Ayush Siddha Healthcare Clinic & Herbal Store. Ministry of AYUSH Standards Approved.
        </div>
      </footer>

    </div>
  );
}
