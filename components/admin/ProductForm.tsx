'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { ProductActionState } from '@/lib/admin/products-actions';
import type { AdminProductDetail } from '@/lib/admin/products';
import type { AdminCategory } from '@/lib/admin/categories';
import type { ProductType } from '@/types/database.types';
import { FormField, Input, Textarea, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  food: 'Food',
  alcoholic_drink: 'Alcoholic Drink',
  wine: 'Wine',
  cocktail: 'Cocktail',
  soft_drink: 'Soft Drink',
  juice: 'Juice',
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button>
  );
}

export function ProductForm({
  action,
  product,
  categories,
  availableTypes,
  submitLabel,
}: {
  action: (state: ProductActionState, formData: FormData) => Promise<ProductActionState>;
  product?: AdminProductDetail;
  categories: AdminCategory[];
  /** Restricts the Product Type select — Menu Management only offers 'food',
   *  Drinks Management offers the five drink types — so a food item can't
   *  accidentally end up filed under the bar catalogue or vice versa. */
  availableTypes: ProductType[];
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, null);
  const attrs = product?.attributes ?? {};

  return (
    <form action={formAction} className="max-w-2xl space-y-5 rounded-md bg-cream-50 p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={product?.name} required />
        </FormField>
        <FormField label="Slug" htmlFor="slug" hint="Used in the product URL.">
          <Input id="slug" name="slug" defaultValue={product?.slug} required />
        </FormField>
      </div>

      <FormField label="Description (optional)" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ''}
          rows={3}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Category" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ''} required>
            <option value="" disabled>
              Choose a category…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Type" htmlFor="productType">
          <Select id="productType" name="productType" defaultValue={product?.productType ?? availableTypes[0]}>
            {availableTypes.map((t) => (
              <option key={t} value={t}>
                {PRODUCT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Base price (KES)" htmlFor="basePrice">
          <Input
            id="basePrice"
            name="basePrice"
            type="number"
            min={0}
            step="1"
            defaultValue={product?.basePrice}
            required
          />
        </FormField>
        <FormField label="Display order" htmlFor="displayOrder">
          <Input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min={0}
            defaultValue={product?.displayOrder ?? 0}
          />
        </FormField>
      </div>

      <fieldset className="rounded-md border border-charcoal-900/10 p-4">
        <legend className="px-1 font-body text-xs font-medium text-charcoal-700">
          Optional details (shown as badges on the product page)
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Spice level" htmlFor="spiceLevel">
            <Input
              id="spiceLevel"
              name="spiceLevel"
              placeholder="e.g. mild, medium, hot"
              defaultValue={typeof attrs.spice_level === 'string' ? attrs.spice_level : ''}
            />
          </FormField>
          <FormField label="ABV %" htmlFor="abvPercentage">
            <Input
              id="abvPercentage"
              name="abvPercentage"
              type="number"
              min={0}
              max={100}
              step="0.1"
              defaultValue={typeof attrs.abv_percentage === 'number' ? attrs.abv_percentage : ''}
            />
          </FormField>
          <FormField label="Varietal (wine)" htmlFor="varietal">
            <Input
              id="varietal"
              name="varietal"
              defaultValue={typeof attrs.varietal === 'string' ? attrs.varietal : ''}
            />
          </FormField>
          <FormField label="Origin" htmlFor="origin">
            <Input
              id="origin"
              name="origin"
              defaultValue={typeof attrs.origin === 'string' ? attrs.origin : ''}
            />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Allergens (comma-separated, optional)" htmlFor="allergens">
            <Input
              id="allergens"
              name="allergens"
              placeholder="e.g. dairy, nuts, gluten"
              defaultValue={Array.isArray(attrs.allergens) ? attrs.allergens.join(', ') : ''}
            />
          </FormField>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 font-body text-sm text-charcoal-800">
          <input type="checkbox" name="isAvailable" defaultChecked={product?.isAvailable ?? true} />
          Available to order
        </label>
        <label className="flex items-center gap-2 font-body text-sm text-charcoal-800">
          <input type="checkbox" name="isPublished" defaultChecked={product?.isPublished ?? true} />
          Published (visible to customers)
        </label>
        <label className="flex items-center gap-2 font-body text-sm text-charcoal-800">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} />
          Featured on homepage
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
