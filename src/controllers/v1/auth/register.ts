/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";
import config from "@/config";
import { genUsername } from "@/utils";
import { registerSchema } from '@/validations/auth';

import User from '@/models/user';
import Token from '@/models/token';
/**
 * types
 */
import type { Request, Response } from "express";

const register = async (req : Request, res: Response): Promise<void> => {
    // const { email, password, role } = req.body as UserData;
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            code: 'ValidationError',
            message: 'Invalid request data',
            errors: result.error.flatten().fieldErrors,
        });
        return;
    }

    const { email, role, password } = result.data;

    if (role === 'admin' && !config.WHITELIST_ADMINS_MAIL.includes(email)) {
        res.status(403).json({
            code: 'AuthorizationError',
            message: 'You cannon register as an admin',
        });

        logger.warn(
            `User with email ${email} tried to register as an admin but is not in the whitelist`,
        );
        return;
    }

    try {
        const existingUser = await User.exists({ email });

        if (existingUser) {
            res.status(409).json({
                code: 'ConflictError',
                message: 'Email is already registered',
            });
            logger.warn(`Registration attempt with already registered email: ${email}`);
            return;
        }

        const username = genUsername();

        const newUser = await User.create({
            username,
            email,
            password,
            role,
        });

        // Generate access token and refresh token for new user
        const accessToken = generateAccessToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);

        // store refresh token in db
        await Token.create({ token: refreshToken, userId: newUser._id });
        logger.info('Refresh token created for user', {
            userId: newUser._id,
            token: refreshToken,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(201).json({
            user: {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            },
            accessToken
        });

        logger.info('User registered successfully', {
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        });
    } catch (error) {
        res.status(500).json({
            code: 'ServerError', 
            message: 'internal server error',
            error: error
        });

        logger.error('Error during user registration', error);
    }
}

export default register;