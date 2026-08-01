import { memo } from "react";
import type { ComponentType } from "react";
import { Instagram, Youtube, Facebook } from "lucide-react";
import type { SocialItem, SocialPlatform } from "./SocialProductMarquee";

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  tiktok: "TikTok",
};

function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4c1 1 3.5 3.5 6.5 4.25" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<SocialPlatform, ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  tiktok: TikTokIcon,
};

interface SocialProductCardProps {
  item: SocialItem;
  aspect: string;
  gap: boolean;
}

function SocialProductCardComponent({ item, aspect, gap }: SocialProductCardProps) {
  const Icon = PLATFORM_ICONS[item.social];
  const platformLabel = SOCIAL_LABELS[item.social];

  return (
    <article
      className={`group relative w-[var(--spm-card-width)] flex-shrink-0 overflow-hidden rounded-[24px] bg-[#FAF6EE] shadow-md focus-within:shadow-xl ${
        gap ? "mr-[var(--spm-gap)]" : ""
      }`}
      style={{ aspectRatio: aspect }}
    >
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.05]"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-siddha-dark/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
        <p className="px-4 text-center font-display text-xl font-bold tracking-tight text-white drop-shadow-sm">
          {item.title}
        </p>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${item.title} on ${platformLabel}`}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-siddha-dark shadow-lg transition-all duration-300 hover:scale-110 hover:bg-siddha-gold hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-siddha-gold/50"
        >
          <Icon className="h-7 w-7" />
        </a>
      </div>
    </article>
  );
}

export const SocialProductCard = memo(SocialProductCardComponent);
