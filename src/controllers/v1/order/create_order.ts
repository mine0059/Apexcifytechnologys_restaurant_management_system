/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import Order from "@/models/order";
import Table from "@/models/table";
import MenuItem from "@/models/menuItem";

import type { Request, Response } from "express";
import type { createOrderSchema } from "@/validations/order";
import type { z } from "zod";

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
                message: 'Orders can only be placed for reserved tables',
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

        const order = await Order.create({
            user: userId,
            table: tableId,
            items: orderItems,
            totalAmount,
        });

        logger.info(`Order created successfully: ${order._id}`);

        res.status(201).json({
            order,
        });

    } catch (error) {
        logger.error('Error creating order', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default createOrder;