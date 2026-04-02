/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import InventoryItem from "@/models/inventoryItem";

import type { Request, Response } from "express";
import type { restockInventoryItemSchema } from "@/validations/inventory";
import type { z } from "zod";

type RestockInventoryItemBody = z.infer<typeof restockInventoryItemSchema>;

const restockInventoryItem = async (req: Request, res: Response): Promise<void> => {
    const { itemId } = req.params;
    const { quantity: restockAmount } = req.body as RestockInventoryItemBody;

    try {
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

        const newQuantity = current.quantity + restockAmount;
        const isLowStock = newQuantity <= current.minThreshold;

        const inventoryItem = await InventoryItem.findByIdAndUpdate(
            itemId,
            {
                $set: {
                    quantity: newQuantity,
                    isLowStock,
                },
            },
            { new: true }
        ).lean().exec();

        logger.info(
            `Inventory item restocked: ${itemId} — added ${restockAmount}, new quantity: ${newQuantity}`,
            { restockAmount, newQuantity, isLowStock }
        );

        res.status(200).json({
            inventoryItem,
        });
        
    } catch (error) {
        logger.error('Error restocking inventory item', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default restockInventoryItem;