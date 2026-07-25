import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_TOTAL_FILES = 20;
const MAX_IMAGES = 10;
const MAX_VIDEOS = 10;

function validateFile(file) {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`Image "${file.originalname}" exceeds 10MB limit`);
    }
    return "image";
  }
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error(`Video "${file.originalname}" exceeds 100MB limit`);
    }
    return "video";
  }
  throw new Error(`Unsupported file type: ${file.mimetype}`);
}

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function uploadFiles(files) {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }
  if (files.length > MAX_TOTAL_FILES) {
    throw new Error(`Maximum ${MAX_TOTAL_FILES} files allowed`);
  }

  let imageCount = 0;
  let videoCount = 0;

  for (const file of files) {
    const type = validateFile(file);
    if (type === "image") imageCount++;
    else videoCount++;
  }

  if (imageCount > MAX_IMAGES) {
    throw new Error(`Maximum ${MAX_IMAGES} images allowed`);
  }
  if (videoCount > MAX_VIDEOS) {
    throw new Error(`Maximum ${MAX_VIDEOS} videos allowed`);
  }

  const results = [];

  for (const file of files) {
    const type = validateFile(file);
    const resourceType = type === "video" ? "video" : "image";

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: "siddha_herbal/products",
          eager: resourceType === "image"
            ? [{ width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" }]
            : undefined,
          eager_async: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      bufferToStream(file.buffer).pipe(uploadStream);
    });

    results.push({
      type,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width || 0,
      height: result.height || 0,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration || null,
      createdAt: new Date().toISOString(),
    });
  }

  return results;
}

export async function deleteMedia(publicIds) {
  if (!publicIds || publicIds.length === 0) return;
  const ids = publicIds.filter(Boolean);
  if (ids.length === 0) return;
  await cloudinary.api.delete_resources(ids, {
    resource_type: "image",
  });
  await cloudinary.api.delete_resources(ids, {
    resource_type: "video",
  });
}
