import { createClient } from '@/lib/supabase/server';
import type { GalleryCategory } from '@/types/database.types';

export interface GalleryImageData {
  id: string;
  storagePath: string;
  caption: string | null;
  category: GalleryCategory;
}

export async function getPublishedGalleryImages(limit = 6): Promise<GalleryImageData[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gallery_images')
    .select('id, storage_path, caption, category')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('getPublishedGalleryImages failed:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    storagePath: row.storage_path,
    caption: row.caption,
    category: row.category,
  }));
}
