/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import InventoryItem from "@/models/inventoryItem";
import MenuItemIngredient from "@/models/menuItemIngredient";

import type { Request, Response } from "express";
import mongoose from "mongoose";

const deleteInventoryItem = async (req: Request, res: Response): Promise<void> => {
    const { itemId } = req.params;

    try {
        const inventoryItem = await InventoryItem.findById(itemId)
            .select('_id name')
            .lean()
            .exec();

        if (!inventoryItem) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Inventory item not found',
            });
            return;
        }

        const linkedIngredients = await MenuItemIngredient.countDocuments({
            inventoryItem: itemId,
        }).exec();

        if (linkedIngredients > 0) {
            res.status(409).json({
                code: 'ConflictError',
                message: `Cannot delete '${inventoryItem.name}' — it is linked to ${linkedIngredients} menu item(s). Remove all ingredient links first.`,
            });
            return;
        }

        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                await InventoryItem.deleteOne({ _id: itemId }).session(session);
            });

            logger.info(`Inventory item deleted: ${itemId} — ${inventoryItem.name}`);

            res.sendStatus(204);
            
        } finally {
            await session.endSession();
        }
    } catch (error) {
        logger.error('Error deleting inventory item', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default deleteInventoryItem;