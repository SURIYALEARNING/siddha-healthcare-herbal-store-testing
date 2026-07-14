import { Link } from "react-router-dom";
import { Award, Leaf, Shield, UserCheck, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* 1. HERO STORY SEGMENT */}
      <section className="bg-gradient-to-tr from-emerald-950 via-siddha-dark to-slate-900 text-white rounded-3xl p-6 sm:p-12 text-center space-y-4 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-siddha-light rounded-full filter blur-3xl opacity-10 -mr-6 -mt-6"></div>
        
        <div className="max-w-2xl mx-auto space-y-5 z-10 relative">
          <span className="text-xs font-bold text-siddha-gold uppercase tracking-widest block">Since 1999</span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-tight">
            Pioneering Pure Siddha Care for Families Worldwide
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 font-light leading-relaxed">
            Our clinic was established with a singular mission: to make ancient herbal preparations safe, authentic, and easily available to the modern household under registered medical guidance.
          </p>
        </div>
      </section>

      {/* 2. THE THREE HUMORS DOCTRINE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="text-xs font-bold text-siddha-dark uppercase tracking-widest block">Philosophy & Doctrine</span>
          <h2 className="text-2xl sm:text-3.5xl font-bold font-display text-emerald-950 tracking-tight leading-none">
            Vatham, Pitham & Kabham: The Secret to Long Living
          </h2>
          <p className="text-xs font-bold text-siddha-gold uppercase tracking-wider">The Baseline of Traditional Indian Siddha Therapeutics</p>
          <p className="text-sm text-gray-500 leading-relaxed font-light">
            In traditional Siddha science, the human body is formed by five natural elements (Earth, Water, Fire, Air, Space) governed by three regulatory humors: Vatham (phlegmatic air controls neural currents), Pitham (choleric fire dominates digestion and warmth), and Kabham (phlegmatic fluid governs joints and stability).
          </p>
          <p className="text-sm text-gray-500 leading-relaxed font-light">
            Imbalances due to stress, climatic shifts, or toxic industrial diets result in sickness. Through our customized range of Siddha medicines, we aim to carefully restore these humors into an immaculate equilibrium. Dr. Thirugnanasambandar counsels and guides every single client.
          </p>
        </div>

        <div className="lg:col-span-5 bg-white border border-gray-150 p-6 rounded-3xl space-y-4 shadow-xs relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-siddha-light rounded-full filter blur-xl opacity-25"></div>
          
          <h3 className="text-sm font-bold text-emerald-950">Three Humor Imbalance Signs:</h3>
          <div className="space-y-3 font-mono text-xs text-slate-705">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="font-bold text-amber-600 block">VATHAM Imbalances:</span>
              <p className="text-[11px] text-gray-500 mt-1 uppercase font-semibold">Dry skin envelope, stiff musculoskeletal joints, sleep disruptions.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="font-bold text-rose-650 block">PITHAM Imbalances:</span>
              <p className="text-[11px] text-gray-500 mt-1 uppercase font-semibold">Acidity refluxes, high body heat flashes, hyper irritability.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="font-bold text-blue-650 block">KABHAM Imbalances:</span>
              <p className="text-[11px] text-gray-500 mt-1 uppercase font-semibold">Respiratory congestions, heavy mornings, sluggish digestion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE PRINCIPLES STRIP */}
      <section className="bg-slate-50 border border-slate-100 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-siddha-light text-siddha-dark rounded-full flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-emerald-950 text-sm">Ministry Certified Dr. Pulse</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Our chief physician Dr. S. Thirugnanasambandar holds BSMS registration from state traditional councils.
          </p>
        </div>

        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-siddha-light text-siddha-dark rounded-full flex items-center justify-center mx-auto shadow-xs">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-emerald-950 text-sm">Authentic Handcrafted Preparations</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Dry herbs ground at correct cosmic hours using copper and stone grinders. No heating, no mechanical pressing.
          </p>
        </div>

        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-siddha-light text-siddha-dark rounded-full flex items-center justify-center mx-auto shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-emerald-950 text-sm">Heavy Metal-Free Guarantee</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Every batch goes through certified laboratory analysis tests to guarantee absolutely zero toxic heavy metal ash residues.
          </p>
        </div>
      </section>

      {/* 4. DR EXPERT SECTION BLOCK */}
      <section className="bg-white border border-gray-100 p-6 sm:p-10 rounded-3xl relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-siddha-light rounded-full filter blur-3xl opacity-15"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-4 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600" 
              alt="Physician Specialist"
              className="w-64 h-72 object-cover rounded-2xl shadow-md border-2 border-white"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-8 space-y-4">
            <span className="text-[10px] bg-siddha-light text-siddha-dark font-bold px-3 py-1 rounded-full uppercase tracking-wider w-fit block">Clinical Director</span>
            <h3 className="text-2xl font-bold text-emerald-950 font-display">Dr. S. Thirugnanasambandar, B.S.M.S</h3>
            <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">A Pioneer in Online Telemedicine Consultations</p>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-light">
              "When standard medicine fails, go back to elemental roots. Siddha utilizes natural elements. Our formulations have healed hundreds suffering from respiratory congestion, gut ulcers, eczema, and severe liver sluggishness. Connecting via digital portals lets us prescribe authentic cures anywhere!"
            </p>
            
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-block px-5 py-3 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Reach Our Physician Desk
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
