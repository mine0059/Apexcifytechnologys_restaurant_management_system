/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import * as express from 'express';
import { Types } from 'mongoose';
import type { AuthRole } from '@/middlewares/authorize';

declare global {
    namespace Express {
        interface Request {
            userId?: Types.ObjectId;
            userRole?: AuthRole;
        }
    }
}
