/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import MenuItemIngredient from "@/models/menuItemIngredient";
import MenuItem from "@/models/menuItem";
import InventoryItem from "@/models/inventoryItem";

import type { Request, Response } from "express";
import type { linkIngredientSchema } from "@/validations/inventory";
import type { z } from "zod";

type LinkIngredientBody = z.infer<typeof linkIngredientSchema>;

const linkIngredient = async (req: Request, res: Response): Promise<void> => {
    const { menuItemId, inventoryItemId, quantityNeeded } = req.body as LinkIngredientBody;

    try {
        const [menuItem, inventoryItem] = await Promise.all([
            MenuItem.findById(menuItemId).select('_id name').lean().exec(),
            InventoryItem.findById(inventoryItemId).select('_id name unit').lean().exec(),
        ]);

        if (!menuItem) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Menu item not found',
            });
            return;
        }

        if (!inventoryItem) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Inventory item not found',
            });
            return;
        }

        const existingLink = await MenuItemIngredient.findOne({
            menuItem: menuItemId,
            inventoryItem: inventoryItemId,
        }).lean().exec();

        if (existingLink) {
            res.status(409).json({
                code: 'ConflictError',
                message: `'${inventoryItem.name}' is already linked to '${menuItem.name}'`,
            });
            return;
        }

        const ingredientLink = await MenuItemIngredient.create({
            menuItem: menuItemId,
            inventoryItem: inventoryItemId,
            quantityNeeded,
        });

        logger.info(
            `Ingredient linked: '${inventoryItem.name}' → '${menuItem.name}', quantity: ${quantityNeeded} ${inventoryItem.unit}`,
            { menuItemId, inventoryItemId, quantityNeeded }
        );

        res.status(201).json({
            ingredientLink,
        });
        
    } catch (error: any) {
        if (error.code === 11000) {
            res.status(409).json({
                code: 'ConflictError',
                message: 'This ingredient is already linked to this menu item',
            });
            return;
        }

        logger.error('Error linking ingredient to menu item', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default linkIngredient;