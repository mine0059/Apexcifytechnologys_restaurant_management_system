/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Router } from "express";

const router = Router();

// Routes
import authRoutes from '@/routes/v1/auth';

// Root route
router.get('/', (_, res) => {
    res.status(200).json({
        message: "API is live",
        status: 'Ok',
        version: '1.0.0',
        docs: '',
        timestamp: new Date().toISOString(),
    });
});

router.use('/auth', authRoutes);

export default router;