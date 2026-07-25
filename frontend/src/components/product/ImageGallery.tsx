import { useTranslation } from 'react-i18next';
import { useState } from "react";
import type { MediaItem } from "../../types";

interface ImageGalleryProps {
  images: string[];
  media?: MediaItem[];
  name: string;
  hasDiscount: boolean;
}

export default function ImageGallery({ images, media, name, hasDiscount }: ImageGalleryProps) {
  const { t } = useTranslation();
  const items = (media && media.length > 0 ? media : images.map((url) => ({ type: "image" as const, url } as MediaItem)));
  const [active, setActive] = useState(items[0]);

  const isVideo = active.type === "video";

  return (
    <div className="lg:col-span-5 space-y-4">
      <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-50 overflow-hidden relative border border-gray-100 p-2">
        {isVideo ? (
          <video
            src={active.url}
            controls
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <img
            src={active.url}
            alt={name}
            className="w-full h-full object-cover rounded-xl"
            referrerPolicy="no-referrer"
          />
        )}
        {hasDiscount && (
          <span className="absolute top-4 left-4 bg-siddha-gold text-siddha-dark text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-xs">
            {t('product.offer')}
          </span>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex gap-2">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActive(item)}
              className={`w-18 h-18 rounded-lg overflow-hidden border-2 bg-slate-50 relative shrink-0 cursor-pointer ${active.url === item.url ? "border-siddha-dark" : "border-gray-200"}`}
            >
              {item.type === "video" ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
