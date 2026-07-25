import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Video, FileWarning, Trash2 } from "lucide-react";
import { uploadMediaFiles } from "../../api/upload";
import type { MediaItem } from "../../types";

interface UploadingFile {
  id: string;
  name: string;
  type: "image" | "video";
  preview: string;
  progress: number;
  error?: string;
}

interface MediaUploaderProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  maxFiles?: number;
}

let uploadIdCounter = 0;
function nextId() {
  return `upload_${++uploadIdCounter}_${Date.now()}`;
}

export default function MediaUploader({ media, onChange, maxFiles = 20 }: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const canAddMore = media.length < maxFiles;

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, maxFiles - media.length);
    if (fileArray.length === 0) return;

    const previews: UploadingFile[] = fileArray.map((f) => ({
      id: nextId(),
      name: f.name,
      type: f.type.startsWith("video") ? "video" : "image",
      preview: URL.createObjectURL(f),
      progress: 0,
    }));

    setUploading((prev) => [...prev, ...previews]);

    try {
      const results = await uploadMediaFiles(fileArray);
      onChange([...media, ...results]);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Upload failed";
      setUploading((prev) =>
        prev.map((u) => (u.error ? u : { ...u, error: msg }))
      );
    } finally {
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
      setUploading([]);
    }
  }, [media, onChange, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (canAddMore && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [canAddMore, processFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removeMedia = (index: number) => {
    onChange(media.filter((_, i) => i !== index));
  };

  const removeUpload = (id: string) => {
    setUploading((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-gray-400 uppercase">Product Media</label>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => canAddMore && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-siddha-dark bg-siddha-light/30"
            : "border-gray-200 hover:border-siddha-dark/40 bg-gray-50/50"
        } ${!canAddMore ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
        <p className="text-xs font-medium text-gray-500">
          {canAddMore
            ? "Drop files here or click to browse"
            : `Max ${maxFiles} files`}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          Images: JPG, PNG, WebP, AVIF (max 10MB) &bull; Videos: MP4, WebM, MOV (max 100MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
          onChange={handleInputChange}
          className="hidden"
          disabled={!canAddMore}
        />
      </div>

      {uploading.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {uploading.map((f) => (
            <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              {f.type === "video" ? (
                <video src={f.preview} className="w-full h-full object-cover" />
              ) : (
                <img src={f.preview} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                {f.error ? (
                  <div className="text-center p-1">
                    <FileWarning className="w-5 h-5 text-red-400 mx-auto" />
                    <p className="text-[9px] text-red-300 mt-1 line-clamp-2">{f.error}</p>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
                )}
              </div>
              <button
                type="button"
                onClick={() => removeUpload(f.id)}
                className="absolute top-1 right-1 p-0.5 bg-white/80 rounded-full hover:bg-white cursor-pointer"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {media.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {media.map((item, idx) => (
            <div key={item.publicId || idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
              {item.type === "video" ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
              )}
              <div className="absolute top-1 left-1">
                {item.type === "video" ? (
                  <Video className="w-3 h-3 text-white drop-shadow-lg" />
                ) : (
                  <ImageIcon className="w-3 h-3 text-white drop-shadow-lg" />
                )}
              </div>
              <button
                type="button"
                onClick={() => removeMedia(idx)}
                className="absolute top-1 right-1 p-0.5 bg-white/80 rounded-full hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-white truncate">{item.format?.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
