import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.12 29.12 0 0 0 1 12a29.12 29.12 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.12 29.12 0 0 0 23 12a29.12 29.12 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const footerLinks = [
  {
    heading: "Pages",
    links: [
      { label: "Home", to: "/" },
      { label: "About Us", to: "/about" },
      { label: "Our Shop", to: "/shop" },
      { label: "Blogs", to: "/blogs" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    heading: "Our Policies",
    links: [
      { label: "Terms & Services", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Return & Refund Policy", to: "/returns" },
      { label: "Shipping Policy", to: "/shipping-policy" },
    ],
  },
];

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={ref} className="footer-fade-up">
      <div className="relative bg-[#2D4A4A] text-white">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none -translate-y-[99%]">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-[60px]">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 pt-20 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            <div className="text-center md:text-left">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto md:mx-0 mb-5">
                <span className="text-xl font-black text-siddha-gold font-serif">SH</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed font-sans">
                Rediscover the ancient wisdom of Siddha medicine. We bring you authentic herbal formulations crafted with traditional knowledge and modern care.
              </p>
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/60 mb-3 font-sans">
                  Follow Us
                </p>
                <div className="flex gap-3 justify-center md:justify-start">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:bg-siddha-gold hover:text-white transition-all duration-300 hover:scale-110 cursor-pointer"
                  >
                    <InstagramIcon />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:bg-siddha-gold hover:text-white transition-all duration-300 hover:scale-110 cursor-pointer"
                  >
                    <YoutubeIcon />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white/80 hover:bg-siddha-gold hover:text-white transition-all duration-300 hover:scale-110 cursor-pointer"
                  >
                    <FacebookIcon />
                  </a>
                </div>
              </div>
            </div>

            {footerLinks.map((col) => (
              <div key={col.heading} className="text-center md:text-left">
                <h3 className="text-lg font-semibold font-serif text-white mb-5">
                  {col.heading}
                </h3>
                <ul className="space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-white/80 hover:text-white text-sm font-sans transition-all duration-300 hover:underline hover:underline-offset-4 hover: decoration-white/40 relative inline-block hover:-translate-x-0.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold font-serif text-white mb-5">
                Get In Touch
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 justify-center md:justify-start">
                  <MapPin className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm font-sans leading-relaxed">
                    12, Siddha Vaidyar Street,<br />
                    Mylapore, Chennai - 600004,<br />
                    Tamil Nadu, India
                  </span>
                </li>
                <li className="flex items-center gap-3 justify-center md:justify-start">
                  <MapPin className="w-4 h-4 text-siddha-gold shrink-0" />
                  <a
                    href="https://maps.google.com/?q=Siddha+Healthcare+Chennai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-siddha-gold/80 hover:text-siddha-gold text-sm font-sans transition-colors duration-300 underline underline-offset-2 decoration-siddha-gold/30"
                  >
                    View on Google Maps
                  </a>
                </li>
                <li className="flex items-center gap-3 justify-center md:justify-start">
                  <Phone className="w-4 h-4 text-siddha-gold shrink-0" />
                  <a href="tel:+919999999999" className="text-siddha-gold text-lg sm:text-xl font-bold font-sans tracking-wide hover:text-white transition-colors duration-300">
                    +91 99999 99999
                  </a>
                </li>
                <li className="flex items-center gap-3 justify-center md:justify-start">
                  <Mail className="w-4 h-4 text-siddha-gold/70 shrink-0" />
                  <a href="mailto:care@siddhahealthcare.com" className="text-siddha-gold/80 hover:text-siddha-gold text-sm font-sans transition-colors duration-300">
                    care@siddhahealthcare.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-6">
            <p className="text-center text-white/40 text-xs font-sans">
              Siddha Healthcare &copy; {new Date().getFullYear()} &mdash; All Rights Reserved | Designed with care
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
