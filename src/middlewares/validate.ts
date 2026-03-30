/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validateParams = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
        const flatErrors = result.error.flatten();
        res.status(400).json({
            code: 'ValidationError',
            message: 'Invalid request parameters',
            errors: flatErrors.fieldErrors,
            formErrors: flatErrors.formErrors,
        });
        return;
    }

    next();
};

export const validateQuery = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
        const flatErrors = result.error.flatten();
        res.status(400).json({
            code: 'ValidationError',
            message: 'Invalid query parameters',
            errors: flatErrors.fieldErrors,
            formErrors: flatErrors.formErrors,
        });
        return;
    }

    next();
};

export const validateBody = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const flatErrors = result.error.flatten();
        res.status(400).json({
            code: 'ValidationError',
            message: 'Invalid request data',
            errors: flatErrors.fieldErrors,
            formErrors: flatErrors.formErrors,
        });
        return;
    }

    // Update req.body with validated and transformed data
    req.body = result.data;
    next();
};