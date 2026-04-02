/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import Order from "@/models/order";
import Table from "@/models/table";
import MenuItem from "@/models/menuItem";
import { deductInventory } from "@/lib/inventory";

import type { Request, Response } from "express";
import type { createOrderSchema } from "@/validations/order";
import type { z } from "zod";
import mongoose from "mongoose";

type CreateOrderBody = z.infer<typeof createOrderSchema>;

const createOrder = async (req: Request, res: Response) : Promise<void> => {
    const { tableId, items } = req.body as CreateOrderBody;
    const userId = req.userId;

    try {
        const table = await Table.findById(tableId).select('_id status').lean().exec();

        if (!table) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Table not found',
            });
            return;
        }

        if (table.status !== 'reserved') {
            res.status(409).json({
                code: 'ConflictError',
                message: table.status === 'occupied'
                    ? 'This table already has an active order'
                    : 'Orders can only be placed for reserved tables',
            });
            return;
        }

        const menuItemIds = items.map(item => item.menuItemId);

        const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } })
                                .select('_id price isAvailable name')
                                .lean()
                                .exec();

        if (menuItems.length !== menuItemIds.length) {
            const foundIds = menuItems.map(m => m._id.toString());
            const missingIds = menuItemIds.filter(id => !foundIds.includes(id));

            res.status(404).json({
                code: 'NotFound',
                message: 'One or more menu items not found',
                missing: missingIds,
            });
            return;
        }

        const unavailableItems = menuItems.filter(m => !m.isAvailable);

        if (unavailableItems.length > 0) {
            res.status(409).json({
                code: 'ConflictError',
                message: 'One or more menu items are currently unavailable',
                unavailable: unavailableItems.map(i => ({ id: i._id, name: i.name })),
            });
            return;
        }

        const priceMap = new Map(
            menuItems.map(m => [m._id.toString(), m.price])
        );

        let totalAmount = 0;

        const orderItems = items.map((item) => {
            const price = priceMap.get(item.menuItemId)!;
            const lineTotal = price * item.quantity;
            totalAmount += lineTotal;

            return {
                menuItem: item.menuItemId,
                quantity: item.quantity,
                price,
            };
        });

        const session = await mongoose.startSession();

        try {
            let order: InstanceType<typeof Order> | null = null;

            await session.withTransaction(async () => {
                const claimedTable = await Table.findOneAndUpdate(
                    { _id: tableId, status: 'reserved' },
                    { $set: { status: 'occupied' } },
                    { session }
                ).lean().exec();

                // Another request may have changed the status between our check and now
                if (!claimedTable) {
                    const error = new Error('TABLE_NO_LONGER_RESERVED');
                    throw error;
                }

                const [createdOrder] = await Order.create(
                    [{
                        user: userId,
                        table: tableId,
                        items: orderItems,
                        totalAmount,
                    }],
                    { session }
                );

                order = createdOrder;

                await deductInventory(orderItems, session);
            });

            logger.info(
                `Order created: ${order!._id}, table ${tableId} occupied, inventory deducted`
            );

            res.status(201).json({
                order,
            });
        } finally {
            await session.endSession();
        }

    } catch (error: any) {
        // Handle the race condition where table status changed mid-request
        if (error.message === 'TABLE_NO_LONGER_RESERVED') {
            res.status(409).json({
                code: 'ConflictError',
                message: 'Table is no longer available for ordering',
            });
            return;
        }
        
        logger.error('Error creating order', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default createOrder;