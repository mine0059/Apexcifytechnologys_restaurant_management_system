/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { z } from 'zod';

export const CreateMenuItemBodySchema = z.object({
    name: z.string().max(100, { message: 'Menu Item Name must be less than 100 characters' }),
    description: z.string().max(200, { message: 'Menu Item Description must be less than 200 characters' }),
    price: z.coerce.number().int().positive({ message: 'Menu Item Price must be a positive number' }),
    category: z.string().max(50, { message: 'Menu Item Category must be less than 50 characters' }),
    isAvailable: z.union([z.boolean(), z.string()]).transform((val) => {
        if (typeof val === 'boolean') return val;
        return val === 'true' || val === '1';
    }).default(true),
    banner: z.object({
        publicId: z.string(),
        url: z.string().url({ message: 'Banner URL must be a valid URL' }),
        width: z.number().positive({ message: 'Banner width must be a positive number' }),
        height: z.number().positive({ message: 'Banner height must be a positive number' }),
    }),
});

export const UpdateMenuItemBodySchema = z.object({
    name: z.string().max(100, { message: 'Menu Item Name must be less than 100 characters' }).optional(),
    description: z.string().max(200, { message: 'Menu Item Description must be less than 200 characters' }).optional(),
    price: z.coerce.number().int().positive({ message: 'Menu Item Price must be a positive number' }).optional(),
    category: z.string().max(50, { message: 'Menu Item Category must be less than 50 characters' }).optional(),
    isAvailable: z.union([z.boolean(), z.string()]).transform((val) => {
        if (typeof val === 'boolean') return val;
        return val === 'true' || val === '1';
    }).optional(),
    banner: z.object({
        publicId: z.string(),
        url: z.string().url({ message: 'Banner URL must be a valid URL' }),
        width: z.number().positive({ message: 'Banner width must be a positive number' }),
        height: z.number().positive({ message: 'Banner height must be a positive number' }),
    }).optional(),
});

export const MenuItemIdParamSchema = z.object({
    menuItemId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid menu item ID' }),
});

export const getAllMenuItemsQuerySchema = z.object({
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined).refine((val) => val === undefined || (val >= 1 && val <= 50), { message: 'Limit must be between 1 and 50' }),
    offset: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined).refine((val) => val === undefined || val >= 0, { message: 'Offset must be a non-negative integer' }),
});