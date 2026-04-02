/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import InventoryItem from "@/models/inventoryItem";

import type { Request, Response } from "express";
import type { updateInventoryItemSchema } from "@/validations/inventory";
import type { z } from "zod";

type UpdateInventoryItemBody = z.infer<typeof updateInventoryItemSchema>;

const updateInventoryItem = async (req: Request, res: Response): Promise<void> => {
    const { itemId } = req.params;
    const updates = req.body as UpdateInventoryItemBody;

    try {
        if (updates.name) {
            const existing = await InventoryItem.findOne({
                name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
                _id: { $ne: itemId },
            }).lean().exec();

            if (existing) {
                res.status(409).json({
                    code: 'ConflictError',
                    message: `An inventory item with the name '${updates.name}' already exists`,
                });
                return;
            }
        }

        const current = await InventoryItem.findById(itemId)
            .select('quantity minThreshold')
            .lean()
            .exec();

        if (!current) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Inventory item not found',
            });
            return;
        }

        const resolvedQuantity = updates.quantity ?? current.quantity;
        const resolvedMinThreshold = updates.minThreshold ?? current.minThreshold;
        const isLowStock = resolvedQuantity <= resolvedMinThreshold;

        const inventoryItem = await InventoryItem.findByIdAndUpdate(
            itemId,
            {
                $set: {
                    ...updates,
                    isLowStock,
                },
            },
            { new: true, runValidators: true }
        ).lean().exec();

        logger.info(`Inventory item updated: ${itemId}`, { updates });

        res.status(200).json({
            inventoryItem,
        });

    } catch (error) {
        logger.error('Error updating inventory item', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default updateInventoryItem;