/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Router } from "express";

const router = Router();

// Routes
import authRoutes from '@/routes/v1/auth';
import menuItemRoutes from '@/routes/v1/menuItem';

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
router.use('/menu-items', menuItemRoutes);

export default router;