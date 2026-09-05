'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signInAction, type AuthActionState } from '@/lib/auth/actions';
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

export function LoginForm({ redirectedFrom }: { redirectedFrom?: string }) {
  const [state, formAction] = useFormState<AuthActionState, FormData>(signInAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirectedFrom" value={redirectedFrom ?? ''} />

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
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
