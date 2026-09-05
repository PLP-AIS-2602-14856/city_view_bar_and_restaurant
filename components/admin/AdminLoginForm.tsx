'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { adminSignInAction, type AuthActionState } from '@/lib/auth/actions';
import { FormField, Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign In'}
    </Button>
  );
}

export function AdminLoginForm() {
  const [state, formAction] = useFormState<AuthActionState, FormData>(
    adminSignInAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <FormField label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </FormField>

      <FormField label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>

      {state?.error && (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
