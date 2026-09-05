import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name.').max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'Enter a slug.')
    .max(150)
    .regex(slugPattern, 'Use lowercase letters, numbers, and hyphens only.'),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  categoryId: z.string().uuid('Choose a category.'),
  productType: z.enum(['food', 'alcoholic_drink', 'wine', 'cocktail', 'soft_drink', 'juice']),
  basePrice: z.coerce.number().min(0, 'Price must be 0 or more.'),
  currency: z.string().trim().min(3).max(3).default('KES'),

  isAvailable: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),

  // Free-form per-type attributes, kept as plain optional strings on the form
  // and assembled into the products.attributes JSONB column server-side.
  spiceLevel: z.string().trim().max(30).optional().or(z.literal('')),
  abvPercentage: z.coerce.number().min(0).max(100).optional().or(z.nan()),
  varietal: z.string().trim().max(80).optional().or(z.literal('')),
  origin: z.string().trim().max(80).optional().or(z.literal('')),
  allergens: z.string().trim().max(200).optional().or(z.literal('')), // comma-separated
});

export type ProductInput = z.infer<typeof productSchema>;
