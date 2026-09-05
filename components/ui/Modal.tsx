'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utilities/cn';

/**
 * Built on the native <dialog> element: free focus trap, Esc-to-close, and
 * ::backdrop styling, without shipping a bespoke portal/focus-trap implementation.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className={cn(
        'w-full max-w-md rounded-md border border-charcoal-900/10 bg-cream-50 p-0 shadow-card backdrop:bg-charcoal-950/60',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-charcoal-900/10 px-5 py-4">
        <h2 className="font-display text-lg text-charcoal-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-charcoal-700 hover:text-charcoal-900"
        >
          ✕
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}
