import { z } from 'zod';

// Kept generous rather than trying to encode real opening hours here — the
// database doesn't reject out-of-hours requests either. A "pending" reservation
// review by staff (who know the real hours) is the actual guard, not this form.
export const reservationSchema = z.object({
  guestName: z.string().trim().min(2, 'Enter your name.').max(120),
  guestPhone: z.string().trim().min(7, 'Enter a valid phone number.').max(30),
  guestEmail: z.string().trim().email('Enter a valid email address.').optional().or(z.literal('')),
  partySize: z.coerce.number().int().min(1, 'Party size must be at least 1.').max(30),
  reservationDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Enter a valid date.')
    .refine((v) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(v) >= today;
    }, 'Choose today or a future date.'),
  reservationTime: z.string().min(1, 'Choose a time.'),
  tablePreference: z.string().trim().max(60).optional().or(z.literal('')),
  specialRequests: z.string().trim().max(500).optional().or(z.literal('')),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
