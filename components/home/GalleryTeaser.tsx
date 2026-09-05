import Link from 'next/link';
import Image from 'next/image';
import { Section, Container } from '@/components/layout/Container';
import { buttonStyles } from '@/components/ui/Button';
import { getGalleryImageUrl } from '@/lib/utilities/storage';
import type { GalleryImageData } from '@/lib/database/gallery';

export function GalleryTeaser({ images }: { images: GalleryImageData[] }) {
  if (images.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-body text-sm text-gold-700">Inside City View</p>
            <h2 className="mt-2 font-display text-3xl text-charcoal-900">The Room</h2>
          </div>
          <Link href="/gallery" className={buttonStyles({ variant: 'outline', size: 'sm' })}>
            View Gallery
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {images.slice(0, 6).map((image, i) => (
            <div
              key={image.id}
              className={`relative aspect-square overflow-hidden rounded-md ${
                i === 0 ? 'col-span-2 row-span-2 aspect-auto' : ''
              }`}
            >
              <Image
                src={getGalleryImageUrl(image.storagePath)}
                alt={image.caption ?? 'City View Bar & Restaurant'}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 50vw"
              />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
