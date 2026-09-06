'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart/CartContext';
import { formatPrice } from '@/lib/utilities/format';
import { Button } from '@/components/ui/Button';
import type { ProductDetailData } from '@/lib/database/products';

export function AddToCartForm({ product }: { product: ProductDetailData }) {
  const { addItem } = useCart();

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0] ?? null;
  const [variantId, setVariantId] = useState<string | null>(defaultVariant?.id ?? null);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = selectedVariant?.priceOverride ?? product.basePrice;

  const addonsTotal = useMemo(() => {
    let total = 0;
    for (const group of product.addonGroups) {
      for (const optionId of selectedAddons[group.id] ?? []) {
        const opt = group.options.find((o) => o.id === optionId);
        if (opt) total += opt.priceDelta;
      }
    }
    return total;
  }, [selectedAddons, product.addonGroups]);

  const lineTotal = (unitPrice + addonsTotal) * quantity;

  // Every required group must have at least min_select options chosen.
  const missingRequiredGroup = product.addonGroups.find(
    (g) => g.isRequired && (selectedAddons[g.id]?.length ?? 0) < g.minSelect,
  );

  function toggleAddon(groupId: string, optionId: string, maxSelect: number) {
    setJustAdded(false);
    setSelectedAddons((prev) => {
      const current = prev[groupId] ?? [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      if (maxSelect === 1) {
        return { ...prev, [groupId]: [optionId] };
      }
      if (current.length >= maxSelect) {
        return prev; // at the group's selection limit — ignore further picks
      }
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }

  function handleAddToCart() {
    const addonOptionIds = Object.values(selectedAddons).flat();
    const addons = product.addonGroups.flatMap((g) =>
      (selectedAddons[g.id] ?? [])
        .map((optionId) => g.options.find((o) => o.id === optionId))
        .filter((o): o is NonNullable<typeof o> => !!o)
        .map((o) => ({ addonOptionId: o.id, name: o.name, priceDelta: o.priceDelta })),
    );

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      productType: product.productType,
      categoryName: product.categoryName,
      primaryImagePath: product.primaryImagePath,
      currency: product.currency,
      variantId: selectedVariant?.id ?? null,
      variantName: selectedVariant?.name ?? null,
      unitPrice,
      addons,
      quantity,
      addonOptionIds,
    });

    setJustAdded(true);
    setQuantity(1);
  }

  return (
    <div>
      {product.variants.length > 0 && (
        <div className="mt-6">
          <p className="font-body text-sm font-medium text-charcoal-900">Options</p>
          <div className="mt-2 space-y-1.5">
            {product.variants.map((v) => (
              <label
                key={v.id}
                className="flex cursor-pointer items-center justify-between border-b border-charcoal-900/5 py-2 font-body text-sm text-charcoal-800"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="variant"
                    checked={variantId === v.id}
                    onChange={() => {
                      setVariantId(v.id);
                      setJustAdded(false);
                    }}
                  />
                  {v.name}
                  {v.isDefault && <span className="text-xs text-gold-700">Default</span>}
                </span>
                <span>{formatPrice(v.priceOverride ?? product.basePrice, product.currency)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {product.addonGroups.length > 0 && (
        <div className="mt-6 space-y-5">
          {product.addonGroups.map((group) => (
            <div key={group.id}>
              <p className="font-body text-sm font-medium text-charcoal-900">
                {group.name}
                {group.isRequired && <span className="text-gold-700"> · required</span>}
                {group.maxSelect > 1 && (
                  <span className="text-charcoal-700/60"> · choose up to {group.maxSelect}</span>
                )}
              </p>
              <div className="mt-2 space-y-1.5">
                {group.options.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex cursor-pointer items-center justify-between font-body text-sm text-charcoal-800"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type={group.maxSelect === 1 ? 'radio' : 'checkbox'}
                        name={`addon-group-${group.id}`}
                        checked={(selectedAddons[group.id] ?? []).includes(opt.id)}
                        onChange={() => toggleAddon(group.id, opt.id, group.maxSelect)}
                      />
                      {opt.name}
                    </span>
                    <span>
                      {opt.priceDelta > 0
                        ? `+${formatPrice(opt.priceDelta, product.currency)}`
                        : 'Included'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center rounded border border-charcoal-900/15">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 font-body text-charcoal-700 hover:text-charcoal-900"
          >
            −
          </button>
          <span className="w-8 text-center font-body text-sm text-charcoal-900">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            className="px-3 py-2 font-body text-charcoal-700 hover:text-charcoal-900"
          >
            +
          </button>
        </div>

        <p className="font-display text-xl text-charcoal-900">
          {formatPrice(lineTotal, product.currency)}
        </p>
      </div>

      <Button
        type="button"
        onClick={handleAddToCart}
        disabled={!!missingRequiredGroup}
        className="mt-4 w-full"
      >
        Add to Cart
      </Button>
      {missingRequiredGroup && (
        <p className="mt-2 font-body text-xs text-red-700">
          Select an option for “{missingRequiredGroup.name}” first.
        </p>
      )}

      {justAdded && (
        <p className="mt-3 font-body text-sm text-charcoal-700">
          Added to cart.{' '}
          <Link href="/cart" className="text-gold-700 underline">
            View cart
          </Link>
        </p>
      )}

      <p className="mt-4 font-body text-xs text-charcoal-700/60">
        Prices are confirmed at checkout. Online payment is coming soon — for now
        your order is settled in person, by phone, or on delivery.
      </p>
    </div>
  );
}
