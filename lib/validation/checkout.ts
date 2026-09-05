import { z } from 'zod';

export const cartItemInputSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable(),
  addonOptionIds: z.array(z.string().uuid()),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z
  .object({
    channel: z.enum(['dine_in', 'takeaway', 'delivery']),
    tableNumber: z.string().trim().max(20).optional().or(z.literal('')),
    deliveryLine1: z.string().trim().max(200).optional().or(z.literal('')),
    deliveryArea: z.string().trim().max(120).optional().or(z.literal('')),
    deliveryNotes: z.string().trim().max(300).optional().or(z.literal('')),
    contactName: z.string().trim().min(2, 'Enter your name.').max(120),
    contactPhone: z.string().trim().min(7, 'Enter a valid phone number.').max(30),
    contactEmail: z.string().trim().email('Enter a valid email address.').optional().or(z.literal('')),
    notes: z.string().trim().max(500).optional().or(z.literal('')),
    items: z.array(cartItemInputSchema).min(1, 'Your cart is empty.'),
  })
  .refine((data) => data.channel !== 'delivery' || data.deliveryLine1, {
    message: 'Enter a delivery address.',
    path: ['deliveryLine1'],
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
