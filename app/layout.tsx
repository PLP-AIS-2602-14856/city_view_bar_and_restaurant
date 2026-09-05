import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

// Fraunces: a serif with real character (soft-contrast, slightly wonky ink traps) —
// carries the "premium restaurant menu" personality without reaching for the
// generic cream/high-contrast-serif combination. Inter stays quiet in the body.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'City View Bar & Restaurant',
    template: '%s · City View Bar & Restaurant',
  },
  description:
    'Premium Kenyan hospitality — restaurant dining, bar, wines, cocktails and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
