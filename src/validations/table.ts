/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { z } from 'zod';

export const createTableSchema = z.object({
    tableNumber: z.coerce.number().int().positive(),
    capacity: z.coerce.number().int().positive(),
    status: z.enum(['available', 'occupied', 'reserved'], { message: 'Status must be either available, occupied, or reserved' }).default('available'),
});

export const updateTableSchema = z.object({
    tableNumber: z.coerce.number().int().positive().optional(),
    capacity: z.coerce.number().int().positive().optional(),
    status: z.enum(['available', 'occupied', 'reserved'], { message: 'Status must be either available, occupied, or reserved' }).optional(),
});

export const tableIdParamSchema = z.object({
    tableId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid table ID' }),
});

export const getAllTablesQuerySchema = z.object({
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined).refine((val) => val === undefined || (val >= 1 && val <= 50), { message: 'Limit must be between 1 and 50' }),
    offset: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined).refine((val) => val === undefined || val >= 0, { message: 'Offset must be a non-negative integer' }),
});