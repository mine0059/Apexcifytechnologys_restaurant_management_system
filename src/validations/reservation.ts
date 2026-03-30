/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { z } from 'zod';

export const tableIdParamSchema = z.object({
    tableId: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid table ID' }),
});

export const reservationIdParamSchema = z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid reservation ID' }),
});