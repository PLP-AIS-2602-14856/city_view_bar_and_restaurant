import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Enter a name.').max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'Enter a slug.')
    .max(120)
    .regex(slugPattern, 'Use lowercase letters, numbers, and hyphens only.'),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  parentId: z.string().uuid().optional().or(z.literal('')),
  productType: z
    .enum(['food', 'alcoholic_drink', 'wine', 'cocktail', 'soft_drink', 'juice'])
    .optional()
    .or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;
