import { z } from 'zod';

export const enableTrackingSchema = z.object({
  quantityOnHand: z.coerce.number().int().min(0, 'Starting quantity must be 0 or more.'),
  reorderThreshold: z.coerce.number().int().min(0, 'Reorder threshold must be 0 or more.'),
});

export const adjustStockSchema = z.object({
  changeQty: z.coerce
    .number()
    .int()
    .refine((v) => v !== 0, 'Enter a non-zero amount.'),
  reason: z.enum(['manual_restock', 'wastage', 'correction']),
});

export const reorderThresholdSchema = z.object({
  reorderThreshold: z.coerce.number().int().min(0, 'Reorder threshold must be 0 or more.'),
});
