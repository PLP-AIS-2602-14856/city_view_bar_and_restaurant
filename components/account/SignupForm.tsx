'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signUpAction, type AuthActionState } from '@/lib/auth/actions';
import { FormField, Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating account…' : 'Create Account'}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState<AuthActionState, FormData>(signUpAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Full name" htmlFor="fullName">
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </FormField>

      <FormField label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>

      <FormField label="Phone (optional)" htmlFor="phone">
        <Input id="phone" name="phone" type="tel" autoComplete="tel" />
      </FormField>

      <FormField label="Password" htmlFor="password" hint="At least 8 characters.">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </FormField>

      <FormField label="Confirm password" htmlFor="confirmPassword">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
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
