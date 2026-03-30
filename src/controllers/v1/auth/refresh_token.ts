/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { generateAccessToken, verifyRefreshToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";

import Token from "@/models/token";
import { refreshTokenSchema } from '@/validations/auth';

/**
 * Types
 */
import type { Request, Response } from "express";
import { Types } from 'mongoose';

const refreshToken = async (req: Request, res: Response) => {
    const result = refreshTokenSchema.safeParse(req.cookies);

    if (!result.success) {
        res.status(400).json({
            code: 'ValidationError',
            message: 'Invalid request data',
            errors: result.error.flatten().fieldErrors,
        });
        return;
    }

    const refreshToken = result.data.refreshToken;
    try {
        const tokenExists = await Token.exists({ token: refreshToken });

        if(!tokenExists) {
            res.status(401).json({
                code: 'AuthenticationError',
                message: 'Invalid refresh token',
            });
            return;
        }

        // verify refresh token
        const jwtPayload = verifyRefreshToken(refreshToken) as { userId: Types.ObjectId };

        const accessToken = generateAccessToken(jwtPayload.userId);

        res.status(200).json({
            accessToken,
        });
        
    } catch (error) {
        if(error instanceof TokenExpiredError) {
            res.status(401).json({
                code: 'AuthenticationError',
                message: 'Refresh token expired, please login again',
            });
            return;
        }

        if(error instanceof JsonWebTokenError) {
            res.status(401).json({
                code: 'AuthenticationError',
                message: 'Invalid refresh token',
            });
            return;
        }

        res.status(500).json({
            code: 'ServerError', 
            message: 'internal server error',
            error: error
        });

        logger.error('Error during refresh token', error);
    }
}

export default refreshToken;