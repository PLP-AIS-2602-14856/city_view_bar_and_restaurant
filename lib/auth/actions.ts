'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, signupSchema } from '@/lib/validation/auth';
import { ADMIN_AREA_ROLES } from '@/lib/auth/session';

export type AuthActionState = { error?: string } | null;

/** Customer + staff share the same underlying Supabase Auth sign-in. */
export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: 'Incorrect email or password.' };
  }

  const redirectTo = formData.get('redirectedFrom');
  revalidatePath('/', 'layout');
  redirect(typeof redirectTo === 'string' && redirectTo ? redirectTo : '/account');
}

/**
 * Admin-area sign-in. Verifies the account's role AFTER a successful password
 * check; a customer account entering valid credentials here is still denied
 * admin-area access and immediately signed out again, so no admin-area session
 * cookie is ever left behind for a non-staff account.
 */
export async function adminSignInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return { error: 'Incorrect email or password.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single();

  if (!profile || !profile.is_active || !ADMIN_AREA_ROLES.includes(profile.role)) {
    await supabase.auth.signOut();
    return { error: 'This account does not have admin access.' };
  }

  revalidatePath('/admin', 'layout');
  redirect('/admin/dashboard');
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, phone: parsed.data.phone || null },
    },
  });
  if (error) {
    return { error: error.message.includes('already registered')
      ? 'An account already exists for this email.'
      : 'Could not create your account. Please try again.' };
  }

  revalidatePath('/', 'layout');
  redirect('/account?welcome=1');
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function adminSignOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/admin', 'layout');
  redirect('/admin/login');
}
