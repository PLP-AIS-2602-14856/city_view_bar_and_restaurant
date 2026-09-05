'use client';

import { useState } from 'react';
import Link from 'next/link';
import { primaryNavLinks } from '@/components/navigation/nav-links';

export function MobileMenu({ isSignedIn }: { isSignedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="flex h-11 w-11 items-center justify-center text-cream-50"
      >
        <span className="relative block h-4 w-6">
          <span
            className={`absolute left-0 top-0 h-px w-6 bg-current transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`absolute left-0 top-2 h-px w-6 bg-current transition-opacity ${open ? 'opacity-0' : ''}`}
          />
          <span
            className={`absolute left-0 top-4 h-px w-6 bg-current transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </span>
      </button>

      {open && (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-t border-cream-50/10 bg-charcoal-950 px-6 py-6"
        >
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/search"
                onClick={() => setOpen(false)}
                className="block py-3 font-body text-base text-cream-100"
              >
                Search
              </Link>
            </li>
            {primaryNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-body text-base text-cream-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-3 border-t border-cream-50/10 pt-3">
              <Link
                href={isSignedIn ? '/account' : '/account/login'}
                onClick={() => setOpen(false)}
                className="block py-3 font-body text-base text-cream-100"
              >
                {isSignedIn ? 'My Account' : 'Login'}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
