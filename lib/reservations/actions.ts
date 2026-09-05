'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { reservationSchema } from '@/lib/validation/reservations';

export type ReservationActionState = { error?: string; success?: boolean } | null;

export async function submitReservationAction(
  _prevState: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  const parsed = reservationSchema.safeParse({
    guestName: formData.get('guestName'),
    guestPhone: formData.get('guestPhone'),
    guestEmail: formData.get('guestEmail'),
    partySize: formData.get('partySize'),
    reservationDate: formData.get('reservationDate'),
    reservationTime: formData.get('reservationTime'),
    tablePreference: formData.get('tablePreference'),
    specialRequests: formData.get('specialRequests'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid reservation.' };
  }
  const input = parsed.data;

  const user = await getCurrentUser();
  // Same guest-vs-authenticated split as checkout: there is no anon-insert
  // policy on reservations either (0014_row_level_security.sql), so a guest
  // reservation can only be created through this trusted server path.
  const db = user ? createClient() : createAdminClient();

  const { error } = await db.from('reservations').insert({
    customer_id: user?.id ?? null,
    guest_name: input.guestName,
    guest_phone: input.guestPhone,
    guest_email: input.guestEmail || null,
    party_size: input.partySize,
    reservation_date: input.reservationDate,
    reservation_time: input.reservationTime,
    table_preference: input.tablePreference || null,
    special_requests: input.specialRequests || null,
  });

  if (error) {
    console.error('submitReservationAction failed:', error.message);
    return { error: 'Could not submit your reservation. Please try again.' };
  }

  return { success: true };
}
