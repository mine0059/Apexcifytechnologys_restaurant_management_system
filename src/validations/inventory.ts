/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { z } from 'zod';

export const inventoryItemIdParamSchema = z.object({
    itemId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid inventory item ID' }),
});
export const ingredientIdParamSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid ingredient link ID' }),
});
export const menuItemIdParamSchema = z.object({
    menuItemId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid menu item ID' }),
});

export const createInventoryItemSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, { message: 'Name must be at least 2 characters' })
        .max(100, { message: 'Name must not exceed 100 characters' }),
    unit: z.enum(
        ['kg', 'grams', 'litres', 'ml', 'pieces'],
        { message: 'Unit must be one of: kg, grams, litres, ml, pieces' }
    ),
    quantity: z
        .coerce.number().int()
        .min(0, { message: 'Quantity cannot be negative' }),
    minThreshold: z
        .coerce.number().int()
        .min(0, { message: 'Minimum threshold cannot be negative' }),
});

export const updateInventoryItemSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, { message: 'Name must be at least 2 characters' })
        .max(100, { message: 'Name must not exceed 100 characters' })
        .optional(),
    unit: z
        .enum(
            ['kg', 'grams', 'litres', 'ml', 'pieces'],
            { message: 'Unit must be one of: kg, grams, litres, ml, pieces' }
        )
        .optional(),
    quantity: z
         .coerce.number().int()
        .min(0, { message: 'Quantity cannot be negative' })
        .optional(),
    minThreshold: z
        .coerce.number().int()
        .min(0, { message: 'Minimum threshold cannot be negative' })
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
);

export const restockInventoryItemSchema = z.object({
    quantity: z
        .coerce.number().int()
        .positive({ message: 'Restock quantity must be greater than 0' }),
});

export const linkIngredientSchema = z.object({
    menuItemId: z
        .string()
        .regex(/^[a-f\d]{24}$/i, { message: 'Invalid menu item ID' }),
    inventoryItemId: z
        .string()
        .regex(/^[a-f\d]{24}$/i, { message: 'Invalid inventory item ID' }),
    quantityNeeded: z
        .coerce.number()
        .positive({ message: 'Quantity needed must be greater than 0' }),
});

export const updateIngredientLinkSchema = z.object({
    quantityNeeded: z
        .coerce.number()
        .positive({ message: 'Quantity needed must be greater than 0' }),
});

export const getAllInventoryQuerySchema = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val >= 1 && val <= 100, {
            message: 'Limit must be between 1 and 100',
        }),
    offset: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 0))
        .refine((val) => val >= 0, {
            message: 'Offset must be a non-negative integer',
        }),
    lowStock: z
        .enum(['true', 'false'])
        .optional()
        .transform((val) => {
            if (val === 'true') return true;
            if (val === 'false') return false;
            return undefined;
        }),
    unit: z
        .enum(['kg', 'grams', 'litres', 'ml', 'pieces'])
        .optional(),
});