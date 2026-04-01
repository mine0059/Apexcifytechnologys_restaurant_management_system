/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { z } from 'zod';

export const orderIdParamSchema = z.object({
    orderId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid order ID' }),
});

export const createOrderSchema = z.object({
    tableId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid table ID' }),
    items: z
        .array(
            z.object({
                menuItemId: z
                    .string()
                    .regex(/^[a-f\d]{24}$/i, { message: 'Invalid menu item ID' }),
                quantity: z
                    .coerce.number()
                    .int({ message: 'Quantity must be a whole number' })
                    .min(1, { message: 'Quantity must be at least 1' }),
            })
        )
        .min(1, { message: 'Order must contain at least one item' }),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(
        ['pending', 'preparing', 'served', 'completed', 'cancelled'],
        { message: 'Invalid status value' }
    ),
});

export const getAllOrdersQuerySchema = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val >= 1 && val <= 50, {
            message: 'Limit must be between 1 and 50',
        }),
    offset: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0))
        .refine((val) => val >= 0, {
            message: 'Offset must be a non-negative integer',
        }),
    status: z
        .enum(['pending', 'preparing', 'served', 'completed', 'cancelled'])
        .optional(),
});