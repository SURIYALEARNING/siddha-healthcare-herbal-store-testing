import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const { submitConsultation } = useApp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [healthConcern, setHealthConcern] = useState("");
  const [detailedNote, setDetailedNote] = useState("");
  
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const savedUser = localStorage.getItem("siddha_user");
      let uId = "";
      if (savedUser) {
        const u = JSON.parse(savedUser);
        uId = u.id;
      }

      await submitConsultation({
        fullName,
        email,
        phone,
        healthConcern,
        detailedNote,
        userId: uId
      });

      setLoading(false);
      setSuccess("Consultation & Contact query submitted successfully! Dr. S. Thirugnanasambandar's desk will call your mobile within 24 hours.");
      
      // Clear fields
      setFullName("");
      setEmail("");
      setPhone("");
      setHealthConcern("");
      setDetailedNote("");
      
      setTimeout(() => setSuccess(""), 8000);
    } catch (err) {
      setLoading(false);
      alert("Something went wrong. Let's send details again!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="border-b border-gray-100 pb-5 max-w-2xl">
        <h1 className="text-3xl font-bold font-display text-emerald-950 tracking-tight">Contact support desk</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-2 leading-relaxed">
          Reach Dr. Thirugnanasambandar for private pulse diagnosis or query our AYUSH certified pharmacy order team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* CONTACT FORM & CONSULTATION TRIGGER - LEFT COLUMN (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-gray-850 font-display">Schedule Tele-Consultation / Ask Support</h2>
            <p className="text-xs text-gray-400">Consultation queries are logged directly for our Chief Siddha Doctor to review.</p>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-2xl text-xs font-bold flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4 pt-2">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Your Name *</label>
                <input 
                  type="text"
                  placeholder="Ex. Suriyashankara bose"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Contact Mobile *</label>
                <input 
                  type="text"
                  placeholder="Ex. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address (Optional)</label>
              <input 
                type="email"
                placeholder="Ex. suriyashankara@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Core Health Concern / Purpose *</label>
              <select
                value={healthConcern}
                onChange={(e) => setHealthConcern(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark rounded-xl text-xs text-gray-700 font-semibold cursor-pointer"
                required
              >
                <option value="">Select Primary Imbalance / Symptom</option>
                <option value="Respiratory or Cough (Kabham)">Respiratory / Chronic Cough (Kabham)</option>
                <option value="Gastric or reflux acidities (Pitham)">Digestive Sluggishness / Reflux (Pitham)</option>
                <option value="Joint or skeletal stiffness (Vatham)">Joint stiffness / Knee pains (Vatham)</option>
                <option value="Eczema, Psoriasis or Skin rashes">Eczema / Psoriasis / Skin lesions</option>
                <option value="General Immunity or fatigue booster">Immunity exhaustion / General fatigue</option>
                <option value="Online Pharmacy order inquiry">Pharmacy Shipping / Discount question</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Describe Health Imbalances / Specific symptoms</label>
              <textarea
                value={detailedNote}
                onChange={(e) => setDetailedNote(e.target.value)}
                placeholder="Ex. Experiencing constant reflux acidity and loss of appetite for the past 2 weeks. Need natural Ayurvedic treatment options."
                rows={5}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 focus:border-siddha-dark focus:bg-white text-xs rounded-xl focus:outline-none text-gray-850 resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-siddha-dark hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/10"
              disabled={loading}
            >
              <Send className="w-4 h-4 text-siddha-gold" />
              <span>{loading ? "Registering query..." : "Register Free Doctor Call"}</span>
            </button>

          </form>
        </div>

        {/* DETAILS INFO CARDS & MAPS EMBED - RIGHT COLUMN (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick contact direct desk */}
          <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-widest block">Direct Helpline</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-siddha-light text-siddha-dark flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-405 text-[10px] font-bold uppercase">Phone Assistance</p>
                  <a href="tel:+919876543210" className="text-gray-800 font-extrabold hover:underline font-mono">+91 98765 43210</a>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-siddha-light text-siddha-dark flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-450 text-[10px] font-bold uppercase font-sans">Support Email Inbox</p>
                  <a href="mailto:support@ayushsiddha.com" className="text-gray-850 font-extrabold hover:underline font-mono">support@ayushsiddha.com</a>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-siddha-light text-siddha-dark flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-450 text-[10px] font-bold uppercase">Main Consulting Clinic</p>
                  <p className="text-gray-850 font-bold leading-normal">
                    Ayush Siddha Clinic, 12 Traditional Herb Street, Tamil Nadu, India.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp clicker */}
            <div className="pt-2">
              <a
                href="https://wa.me/919876543210?text=Hi%20Ayush%20Siddha%20Clinic,%20I'd%20like%20to%20schedule%20an%20appointment%20with%20Dr.%20Thirugnanasambandar."
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>💬 Start WhatsApp Fast Inquiry</span>
              </a>
            </div>
          </div>

          {/* Secure iFrame Embedded Map */}
          {/* <div className="bg-white border border-gray-100 p-4 rounded-3xl space-y-3 shadow-xs">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block pl-1.5">Direct Clinic Location Map:</h4>
            
            <div className="w-full h-52 rounded-2xl overflow-hidden border border-gray-150">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15664.843798934507!2d76.9535384!3d11.011676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDAwJzQyLjAiTiA3Nlw0NScxMi43IkU!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                title="Traditional Clinic Location Google Map"
                className="w-full h-full border-none grayscale opacity-85"
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div> */}

        </div>

      </div>
    </div>
  );
}
