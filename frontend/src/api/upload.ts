import client from "./client";
import { MediaItem } from "../types";

export async function uploadMediaFiles(files: File[]): Promise<MediaItem[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await client.post("/api/products/upload-media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.media;
}

export async function deleteMediaFiles(publicIds: string[]): Promise<void> {
  await client.post("/api/products/delete-media", { publicIds });
}
