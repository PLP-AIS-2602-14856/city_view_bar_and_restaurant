const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Product photography lives in the "product-images" bucket, gallery photos in
 * "gallery-images" — both public buckets. This just builds the public URL from a
 * stored path; it does not check that the file exists (the <Image> fallback in
 * ProductCard/GalleryGrid handles that).
 */
export function getPublicStorageUrl(bucket: string, path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function getProductImageUrl(path: string) {
  return getPublicStorageUrl('product-images', path);
}

export function getGalleryImageUrl(path: string) {
  return getPublicStorageUrl('gallery-images', path);
}
