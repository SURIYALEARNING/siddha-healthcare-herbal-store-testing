import { useTranslation, Trans } from "react-i18next";
import { Award, Leaf, Shield, UserCheck, Heart } from "lucide-react";
import SupportCarousel from "../components/SupportCarousel";
import SocialProductMarquee from "../components/SocialProductMarquee";
import AboutHeroSection from "../components/About";
import video from "../assets/PUTHAR-AI-WEBSITE-VIDEO.mp4";

const socialItems = [
  {
    id: "herbgate",
    title: "Herbgate",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600&h=700",
    social: "instagram" as const,
    url: "https://instagram.com/yourreel1",
  },
  {
    id: "gelucon",
    title: "Gelucon",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600&h=700",
    social: "youtube" as const,
    url: "https://youtube.com/yourvideo1",
  },
  {
    id: "osteoherb",
    title: "Osteoherb",
    image: "https://images.unsplash.com/photo-1599639085605-a34414b6d32c?auto=format&fit=crop&q=80&w=600&h=700",
    social: "facebook" as const,
    url: "https://facebook.com/yourpage1",
  },
  {
    id: "ayush-cure",
    title: "Ayush Cure",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=600&h=700",
    social: "tiktok" as const,
    url: "https://tiktok.com/@yourchannel",
  },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 pb-20">
         {/* 2. FULL-WIDTH VIDEO */}
      <section className="w-full overflow-hidden" aria-label={t("about.videoLabel")}>
        <video
          src={video}
          className="block w-full h-auto pointer-events-none select-none"
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload noremoteplayback"
          preload="auto"
          onContextMenu={(event) => event.preventDefault()}
        />
      </section>

      
      {/* 1. HERO SEGMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <AboutHeroSection
          title={t("about.heroTitle")}
          description={
            <Trans
              i18nKey="about.heroDescription"
              components={{
                strong1: <strong />,
                strong2: <strong />,
                strong3: <strong />,
                strong4: <strong />,
              }}
            />
          }
          secondDescription={t("about.heroSecondDescription")}
          image="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=900"
          images={[
            "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=900",
            "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=900",
            "https://images.unsplash.com/photo-1599639085605-a34414b6d32c?auto=format&fit=crop&q=80&w=900",
          ]}
          square
        />
      </section>

      {/* 2. ABOUT US (MIRRORED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AboutHeroSection
          title={t("about.heading")}
          description={
            <Trans
              i18nKey="about.heroDescription"
              components={{
                strong1: <strong />,
                strong2: <strong />,
                strong3: <strong />,
                strong4: <strong />,
              }}
            />
          }
          secondDescription={t("about.heroSecondDescription")}
          image="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=900"
          images={[
            "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=900",
            "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=900",
            "https://images.unsplash.com/photo-1599639085605-a34414b6d32c?auto=format&fit=crop&q=80&w=900",
          ]}
          reverse
          square
        />
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

      {/* 4. SOCIAL PRODUCT MARQUEE */}
      <section className="w-full px-0">
        <div className="text-center space-y-2 mb-8 px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-siddha-dark uppercase tracking-widest block">{t("about.socialSection")}</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 tracking-tight">
            {t("about.socialHeading")}
          </h2>
        </div>
        <SocialProductMarquee
          items={socialItems}
          speed={30}
          pauseOnHover
          cardWidth={260}
          cardHeight={320}
        />
      </section>

    </div>
  );
}
