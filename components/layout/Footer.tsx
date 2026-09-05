import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { primaryNavLinks } from '@/components/navigation/nav-links';

export function Footer() {
  return (
    <footer className="border-t border-charcoal-900/10 bg-charcoal-950 text-cream-50">
      <Container className="grid gap-10 py-16 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl italic text-gold-300">City View</p>
          <p className="mt-3 max-w-xs font-body text-sm text-cream-100/70">
            Restaurant dining, bar, wines and cocktails, in the heart of Nairobi.
          </p>
        </div>

        <div>
          <p className="font-body text-sm font-medium text-cream-50">Explore</p>
          <ul className="mt-4 space-y-2">
            {primaryNavLinks.slice(0, 5).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-cream-100/70 hover:text-gold-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-body text-sm font-medium text-cream-50">Visit</p>
          {/* Address/phone/hours are admin-editable via restaurant_settings — wired
              once Step 6+ connects this footer to the database. */}
          <p className="mt-4 font-body text-sm text-cream-100/70">
            Details available soon — see Contact.
          </p>
        </div>
      </Container>

      <div className="border-t border-cream-50/10 py-6">
        <Container>
          <p className="font-body text-xs text-cream-100/50">
            © {new Date().getFullYear()} City View Bar &amp; Restaurant.
          </p>
        </Container>
      </div>
    </footer>
  );
}
