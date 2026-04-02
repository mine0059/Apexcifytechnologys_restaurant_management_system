/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import Order from "@/models/order";
import Table from "@/models/table";
import { restoreInventory } from "@/lib/inventory";

import type { Request, Response } from "express";
import type { updateOrderStatusSchema } from "@/validations/order";
import type { z } from "zod";
import { IOrder } from "@/models/order";
import mongoose, { Types } from "mongoose";

type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusSchema>;

const VALID_TRANSITIONS: Record<string, string[]> = {
    pending:    ['preparing', 'cancelled'],
    preparing:  ['served', 'cancelled'],
    served:     ['completed'],
    completed:  [],
    cancelled:  [],
};

const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);

const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;
    const { status: newStatus } = req.body as UpdateOrderStatusBody;
    const userRole = req.userRole;

    try {
        const order = await Order.findById(orderId)
            .select('status user table items')
            .lean()
            .exec();

        if (!order) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Order not found',
            });
            return;
        }

        const currentStatus = order.status;
        const allowedTransitions = VALID_TRANSITIONS[currentStatus];

        if (!allowedTransitions.includes(newStatus)) {
            res.status(409).json({
                code: 'ConflictError',
                message: `Cannot transition order from '${currentStatus}' to '${newStatus}'`,
                allowedTransitions,
            });
            return;
        }

        const isOwner = order.user?.toString() === req.userId?.toString();

        if (userRole !== 'admin') {
            if (!isOwner) {
                logger.warn('Unauthorized order status update attempt', {
                    userId: req.userId,
                    orderId,
                });

                res.status(403).json({
                    code: 'AuthorizationError',
                    message: 'Access denied, insufficient permissions',
                });
                return;
            }

            // Owner can only cancel and only when pending
            if (newStatus !== 'cancelled' || currentStatus !== 'pending') {
                res.status(403).json({
                    code: 'AuthorizationError',
                    message: 'You can only cancel your own pending orders',
                });
                return;
            }
        }

        if (TERMINAL_STATUSES.has(newStatus)) {
            const session = await mongoose.startSession();

            try {
                type LeanOrder = IOrder & { _id: Types.ObjectId; __v?: number };
                let updatedOrder: LeanOrder | null = null;

                await session.withTransaction(async () => {
                    const [updated] = await Promise.all([
                        Order.findByIdAndUpdate(
                            orderId,
                            { $set: { status: newStatus } },
                            { new: true, select: 'status totalAmount createdAt updatedAt', session }
                        ).lean().exec(),

                        Table.findByIdAndUpdate(
                            order.table,
                            { $set: { status: 'available' } },
                            { session }
                        ).lean().exec(),
                    ]);

                    updatedOrder = updated;

                    if (newStatus === 'cancelled') {
                        await restoreInventory(order.items, session);
                    }
                });

                logger.info(
                    `Order ${orderId} status updated from '${currentStatus}' to '${newStatus}', table ${order.table} released`,
                    { updatedBy: req.userId, role: userRole }
                );

                res.status(200).json({
                    order: updatedOrder,
                });

            } finally {
                await session.endSession();
            }

            return;
        }

        // Non-terminal status update — no table change needed, no transaction needed
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { $set: { status: newStatus } },
            { new: true, select: 'status totalAmount createdAt updatedAt' }
        ).lean().exec();

        logger.info(`Order ${orderId} status updated from '${currentStatus}' to '${newStatus}'`, {
            updatedBy: req.userId,
            role: userRole,
        });

        res.status(200).json({
            order: updatedOrder,
        });

    } catch (error) {
        logger.error('Error updating order status', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default updateOrderStatus;