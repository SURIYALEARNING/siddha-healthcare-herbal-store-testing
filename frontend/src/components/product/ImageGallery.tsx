import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  name: string;
  hasDiscount: boolean;
}

export default function ImageGallery({ images, name, hasDiscount }: ImageGalleryProps) {
  const [active, setActive] = useState(images[0]);

  return (
    <div className="lg:col-span-5 space-y-4">
      <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-50 overflow-hidden relative border border-gray-100 p-2">
        <img
          src={active}
          alt={name}
          className="w-full h-full object-cover rounded-xl"
          referrerPolicy="no-referrer"
        />
        {hasDiscount && (
          <span className="absolute top-4 left-4 bg-siddha-gold text-siddha-dark text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-xs">
            Offer
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActive(img)}
              className={`w-18 h-18 rounded-lg overflow-hidden border-2 bg-slate-50 relative shrink-0 cursor-pointer ${active === img ? "border-siddha-dark" : "border-gray-200"}`}
            >
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
