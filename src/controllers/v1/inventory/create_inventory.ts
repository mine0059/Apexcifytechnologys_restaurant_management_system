/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import InventoryItem from "@/models/inventoryItem";
import type { Request, Response } from "express";
import type { createInventoryItemSchema } from "@/validations/inventory";
import type { z } from "zod";

type CreateInventoryItemBody = z.infer<typeof createInventoryItemSchema>;

const createInventoryItem = async (req: Request, res: Response): Promise<void> => {
    const { name, unit, quantity, minThreshold } = req.body as CreateInventoryItemBody;

    try {
        // Case-insensitive duplicate check before creating
        const existing = await InventoryItem.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
        }).lean().exec();

        if (existing) {
            res.status(409).json({
                code: 'ConflictError',
                message: `An inventory item with the name '${name}' already exists`,
            });
            return;
        }

        const inventoryItem = await InventoryItem.create({
            name,
            unit,
            quantity,
            minThreshold,
        });

        logger.info(`Inventory item created: ${inventoryItem._id} — ${inventoryItem.name}`);

        res.status(201).json({
            inventoryItem,
        });
    } catch (error) {
        logger.error('Error creating inventory item', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
}

export default createInventoryItem;