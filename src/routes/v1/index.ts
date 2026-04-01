/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Router } from "express";

const router = Router();

// Routes
import authRoutes from '@/routes/v1/auth';
import menuItemRoutes from '@/routes/v1/menuItem';
import tableRoutes from '@/routes/v1/table';
import reservationRoutes from '@/routes/v1/reservation';
import orderRoutes from '@/routes/v1/order';

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
router.use('/tables', tableRoutes);
router.use('/reservations', reservationRoutes);
router.use('/orders', orderRoutes);

export default router;