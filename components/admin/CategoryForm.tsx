'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { CategoryActionState } from '@/lib/admin/categories-actions';
import type { AdminCategory } from '@/lib/admin/categories';
import { FormField, Input, Textarea, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

const PRODUCT_TYPES = [
  { value: '', label: '— None (grouping category) —' },
  { value: 'food', label: 'Food' },
  { value: 'alcoholic_drink', label: 'Alcoholic Drink' },
  { value: 'wine', label: 'Wine' },
  { value: 'cocktail', label: 'Cocktail' },
  { value: 'soft_drink', label: 'Soft Drink' },
  { value: 'juice', label: 'Juice' },
] as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button>
  );
}

export function CategoryForm({
  action,
  category,
  parentOptions,
  submitLabel,
}: {
  action: (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;
  category?: AdminCategory;
  parentOptions: AdminCategory[];
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, null);

  return (
    <form action={formAction} className="max-w-lg space-y-5 rounded-md bg-cream-50 p-6">
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" defaultValue={category?.name} required />
      </FormField>

      <FormField label="Slug" htmlFor="slug" hint="Used in the URL — lowercase, hyphens only.">
        <Input id="slug" name="slug" defaultValue={category?.slug} required />
      </FormField>

      <FormField label="Description (optional)" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={category?.description ?? ''} rows={2} />
      </FormField>

      <FormField label="Parent category (optional)" htmlFor="parentId">
        <Select id="parentId" name="parentId" defaultValue={category?.parentId ?? ''}>
          <option value="">— Top level —</option>
          {parentOptions
            .filter((p) => p.id !== category?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </Select>
      </FormField>

      <FormField
        label="Product type"
        htmlFor="productType"
        hint="Leave as None for a top-level grouping category (e.g. 'Bar'). Set a type for a category products get assigned to (e.g. 'Wines')."
      >
        <Select id="productType" name="productType" defaultValue={category?.productType ?? ''}>
          {PRODUCT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Display order" htmlFor="displayOrder">
        <Input
          id="displayOrder"
          name="displayOrder"
          type="number"
          min={0}
          defaultValue={category?.displayOrder ?? 0}
        />
      </FormField>

      <div className="flex items-center gap-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          defaultChecked={category?.isActive ?? true}
        />
        <label htmlFor="isActive" className="font-body text-sm text-charcoal-800">
          Active (visible to customers)
        </label>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
