import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { buttonStyles } from '@/components/ui/Button';

/**
 * No real City View photography exists yet, and the spec explicitly warns
 * against low-quality placeholder imagery — so the hero leans on an original
 * skyline illustration instead of a stock photo. It's a literal read of the
 * brand name (a rooftop bar's view of the city at dusk) rather than a generic
 * gradient-and-headline treatment. Swap in real photography here once it
 * exists; this remains a legitimate treatment either way.
 */
function SkylineIllustration() {
  const buildings = [
    { x: 0, w: 60, h: 120 },
    { x: 64, w: 40, h: 200 },
    { x: 108, w: 52, h: 150 },
    { x: 164, w: 34, h: 240 },
    { x: 202, w: 58, h: 170 },
    { x: 264, w: 44, h: 260 },
    { x: 312, w: 36, h: 190 },
    { x: 352, w: 62, h: 220 },
    { x: 418, w: 40, h: 150 },
    { x: 462, w: 54, h: 210 },
    { x: 520, w: 38, h: 170 },
    { x: 562, w: 60, h: 240 },
    { x: 626, w: 44, h: 190 },
    { x: 674, w: 50, h: 150 },
    { x: 728, w: 36, h: 220 },
    { x: 768, w: 58, h: 180 },
    { x: 830, w: 42, h: 230 },
    { x: 876, w: 54, h: 160 },
    { x: 934, w: 46, h: 200 },
  ];

  return (
    <svg
      viewBox="0 0 980 260"
      className="absolute inset-x-0 bottom-0 h-[42%] w-full"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="glow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#8f6a24" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8f6a24" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="140" width="980" height="120" fill="url(#glow)" />
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={260 - b.h} width={b.w} height={b.h} fill="#161311" />
          {/* lit windows */}
          {Array.from({ length: Math.floor(b.h / 26) }).map((_, row) =>
            Array.from({ length: Math.max(1, Math.floor(b.w / 18)) }).map((_, col) => {
              const lit = (i + row + col) % 5 === 0;
              if (!lit) return null;
              return (
                <rect
                  key={`${row}-${col}`}
                  x={b.x + 8 + col * 16}
                  y={260 - b.h + 10 + row * 26}
                  width={5}
                  height={7}
                  fill="#d8b968"
                  fillOpacity={0.8}
                />
              );
            }),
          )}
        </g>
      ))}
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-charcoal-950">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal-950 via-charcoal-950/95 to-transparent" />
      <SkylineIllustration />

      <Container className="relative max-w-2xl py-32">
        <p className="font-body text-sm text-gold-300">Nairobi</p>
        <h1 className="mt-5 font-display text-6xl italic leading-[1.05] text-cream-50 md:text-7xl">
          Dinner, drinks,
          <br />
          and the skyline.
        </h1>
        <p className="mt-6 max-w-md font-body text-base leading-relaxed text-cream-100/75">
          A restaurant and rooftop bar built for long dinners and later nights —
          char-grilled classics, a serious wine and cocktail list, and a room
          that looks over all of it.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/restaurant" className={buttonStyles({ variant: 'solid', size: 'lg' })}>
            Order Now
          </Link>
          <Link
            href="/restaurant"
            className={buttonStyles({
              variant: 'outline',
              size: 'lg',
              className: 'border-cream-50/25 text-cream-50 hover:bg-cream-50 hover:text-charcoal-950',
            })}
          >
            Explore Menu
          </Link>
          <Link
            href="/reservations"
            className={buttonStyles({ variant: 'ghost', size: 'lg', className: 'text-cream-50' })}
          >
            Reserve a Table
          </Link>
        </div>
      </Container>
    </section>
  );
}
