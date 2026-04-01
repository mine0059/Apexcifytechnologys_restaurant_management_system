/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import Order from "@/models/order";

import type { Request, Response } from "express";
import type { getAllOrdersQuerySchema } from "@/validations/order";
import type { z } from "zod";

type GetAllOrdersQuery = z.infer<typeof getAllOrdersQuerySchema>;

const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    const userRole = req.userRole;
    const { limit, offset, status } = req.query as unknown as GetAllOrdersQuery;

    try {
        const filter: Record<string, unknown> = {};

        if (userRole !== 'admin') {
            filter.user = userId;
        }

        if (status) {
            filter.status = status;
        }

        const [totalCount, orders] = await Promise.all([
            Order.countDocuments(filter).exec(),
            Order.find(filter)
                .select('table items totalAmount status createdAt')
                .populate('table', 'tableNumber')
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .lean()
                .exec(),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        const hasNextPage = offset + limit < totalCount;
        const hasPrevPage = offset > 0;

        res.status(200).json({
            orders,
            pagination: {
                totalCount,
                totalPages,
                currentPage,
                limit,
                offset,
                hasNextPage,
                hasPrevPage,
            },
        });

    } catch (error) {
        logger.error('Error fetching orders', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default getAllOrders;