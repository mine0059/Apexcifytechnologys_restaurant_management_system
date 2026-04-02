/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import InventoryItem from "@/models/inventoryItem";

import type { Request, Response } from "express";
import type { getAllInventoryQuerySchema } from "@/validations/inventory";
import type { z } from "zod";

type GetAllInventoryQuery = z.infer<typeof getAllInventoryQuerySchema>;

const getAllInventoryItems = async (req: Request, res: Response): Promise<void> => {
    const { limit, offset, lowStock, unit } = req.query as unknown as GetAllInventoryQuery;

    try {
        const filter: Record<string, unknown> = {};

        if (lowStock !== undefined) {
            filter.isLowStock = lowStock;
        }

        if (unit) {
            filter.unit = unit;
        }

        const [totalCount, inventoryItems] = await Promise.all([
            InventoryItem.countDocuments(filter).exec(),
            InventoryItem.find(filter)
                .select('name unit quantity minThreshold isLowStock createdAt')
                .sort({ isLowStock: -1, name: 1 })
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
            inventoryItems,
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
        logger.error('Error fetching inventory items', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default getAllInventoryItems;