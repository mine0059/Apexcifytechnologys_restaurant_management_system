/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { z } from 'zod';

export const emailSchema = z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .max(50, { message: 'Email must be less than 50 characters' })
    .min(1);

export const passwordSchema = z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password must be at most 128 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/\d/, { message: 'Password must contain at least one number' })
    .regex(/[@$!%*?&]/, { message: 'Password must contain at least one special character (@$!%*?&)' });

export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(['admin', 'user'], { message: 'Role must be either admin or user' }).default('user'),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const refreshTokenSchema = z.object({
    refreshToken: z
        .string()
        .min(1, { message: 'Refresh token required' })
        .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, { message: 'Invalid refresh token' }),
});
