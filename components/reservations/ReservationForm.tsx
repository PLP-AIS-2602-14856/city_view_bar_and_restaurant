'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitReservationAction, type ReservationActionState } from '@/lib/reservations/actions';
import { FormField, Input, Textarea } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Sending…' : 'Request Reservation'}
    </Button>
  );
}

const todayIso = () => new Date().toISOString().split('T')[0];

export function ReservationForm() {
  const [state, formAction] = useFormState<ReservationActionState, FormData>(
    submitReservationAction,
    null,
  );

  if (state?.success) {
    return (
      <div className="rounded-md border border-gold-500/30 bg-gold-500/5 p-6">
        <p className="font-display text-xl text-charcoal-900">Reservation requested</p>
        <p className="mt-2 font-body text-sm text-charcoal-700">
          We've received your request and will confirm it by phone or email shortly.
          Reservations are reviewed by staff, so this isn't guaranteed until confirmed.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="guestName">
          <Input id="guestName" name="guestName" autoComplete="name" required />
        </FormField>
        <FormField label="Phone" htmlFor="guestPhone">
          <Input id="guestPhone" name="guestPhone" type="tel" autoComplete="tel" required />
        </FormField>
      </div>

      <FormField label="Email (optional)" htmlFor="guestEmail">
        <Input id="guestEmail" name="guestEmail" type="email" autoComplete="email" />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField label="Party size" htmlFor="partySize">
          <Input id="partySize" name="partySize" type="number" min={1} max={30} defaultValue={2} required />
        </FormField>
        <FormField label="Date" htmlFor="reservationDate">
          <Input
            id="reservationDate"
            name="reservationDate"
            type="date"
            min={todayIso()}
            required
          />
        </FormField>
        <FormField label="Time" htmlFor="reservationTime">
          <Input id="reservationTime" name="reservationTime" type="time" required />
        </FormField>
      </div>

      <FormField
        label="Table preference (optional)"
        htmlFor="tablePreference"
        hint="e.g. window, outdoor, bar-side — we'll try to accommodate but it isn't guaranteed."
      >
        <Input id="tablePreference" name="tablePreference" />
      </FormField>

      <FormField label="Special requests (optional)" htmlFor="specialRequests">
        <Textarea id="specialRequests" name="specialRequests" rows={3} />
      </FormField>

      {state?.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
