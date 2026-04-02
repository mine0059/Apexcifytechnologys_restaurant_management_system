/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import InventoryItem from "@/models/inventoryItem";

import type { Request, Response } from "express";

const getInventoryItemById = async (req: Request, res: Response): Promise<void> => {
    const { itemId } = req.params;

    try {
        const inventoryItem = await InventoryItem.findById(itemId)
            .lean()
            .exec();

        if (!inventoryItem) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Inventory item not found',
            });
            return;
        }

        res.status(200).json({
            inventoryItem,
        });
        
    } catch (error) {
        logger.error('Error fetching inventory item', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default getInventoryItemById;