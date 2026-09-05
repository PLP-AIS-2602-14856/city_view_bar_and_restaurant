import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { CartIndicator } from '@/components/cart/CartIndicator';
import { primaryNavLinks } from '@/components/navigation/nav-links';

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-cream-50/10 bg-charcoal-950 text-cream-50">
      <Container className="relative flex h-20 items-center justify-between">
        <Link href="/" className="font-display text-xl italic tracking-wide text-gold-300">
          City View
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-7">
            {primaryNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-cream-100/85 transition-colors hover:text-gold-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/search"
            aria-label="Search the menu"
            className="text-cream-100/85 hover:text-gold-300"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <circle cx="7.5" cy="7.5" r="5.5" />
              <line x1="15.5" y1="15.5" x2="11.6" y2="11.6" />
            </svg>
          </Link>
          <CartIndicator />
          <Link
            href={user ? '/account' : '/account/login'}
            className="font-body text-sm text-cream-100/85 hover:text-gold-300"
          >
            {user ? 'My Account' : 'Login'}
          </Link>
          <Link
            href="/reservations"
            className={buttonStyles({
              variant: 'outline',
              size: 'sm',
              className: 'border-cream-50/30 text-cream-50 hover:bg-cream-50 hover:text-charcoal-950',
            })}
          >
            Reserve a Table
          </Link>
          <Link href="/restaurant" className={buttonStyles({ variant: 'solid', size: 'sm' })}>
            Order Now
          </Link>
        </div>

        <MobileMenu isSignedIn={!!user} />
      </Container>
    </header>
  );
}
