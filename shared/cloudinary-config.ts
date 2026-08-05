// Cloudinary Configuration
// Sign up free at: https://cloudinary.com/users/register_free
//
// After signing up:
// 1. Go to your Dashboard
// 2. Copy your "Cloud name" and paste it below
// 3. Go to Settings → Upload → Add upload preset
//    - Set "Signing Mode" to "Unsigned"
//    - Name it "goods_on_demand" (or whatever you want)
//    - Set folder to "products"
//    - Save
// 4. Paste the preset name below

export const CLOUDINARY_CONFIG = {
  cloudName: 'dv7m03se',
  uploadPreset: 'goods_on_demand',
};

// Cloudinary upload URL
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

// Upload an image to Cloudinary and return the secure URL
export async function uploadImageToCloudinary(imageUri: string): Promise<string> {
  const formData = new FormData();

  // For React Native, we need to create the file object differently
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as any);
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
  return data.secure_url;
}
