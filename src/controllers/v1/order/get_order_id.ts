/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import Order from "@/models/order";

import type { Request, Response } from "express";

const getOrderById = async (req: Request, res: Response) : Promise<void> => {
    const { orderId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    try {
        const order = await Order.findById(orderId)
            .populate('table', 'tableNumber capacity')
            .populate('items.menuItem', 'name category')
            .lean()
            .exec();
        
        if (!order) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Order not found',
            });
            return;
        }


        const isOwner = order.user?.toString() === userId?.toString();

        if (!isOwner && userRole !== 'admin') {
            logger.warn('Unauthorized order access attempt', { userId, orderId });

            res.status(403).json({
                code: 'AuthorizationError',
                message: 'Access denied, insufficient permissions',
            });
            return;
        }

        res.status(200).json({
            order,
        });
        
    } catch (error) {
        logger.error('Error fetching order', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }

};

export default getOrderById;