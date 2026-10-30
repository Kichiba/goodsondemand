// Browser-compatible Cloudinary upload.
//
// NOTE: The shared `cloudinary-config.ts` upload helper is written for
// React Native (it appends a { uri, name, type } object). Browsers need a
// real File/Blob from an <input type="file">, so the admin uses this helper.

import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '@shared/cloudinary-config';

// Upload a browser File to Cloudinary and return the secure URL.
export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'products');

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.secure_url as string;
}
