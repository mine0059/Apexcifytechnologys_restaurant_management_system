/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston"

import MenuItemIngredient from "@/models/menuItemIngredient";
import MenuItem from "@/models/menuItem";

import type { Request, Response } from "express";

const getIngredientsByMenuItem = async (req: Request, res: Response): Promise<void> => {
    const { menuItemId } = req.params;

    try {
        const menuItem = await MenuItem.findById(menuItemId)
            .select('_id name')
            .lean()
            .exec();

        if (!menuItem) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Menu item not found',
            });
            return;
        }

        const ingredients = await MenuItemIngredient.find({ menuItem: menuItemId })
            .select('inventoryItem quantityNeeded createdAt')
            .populate('inventoryItem', 'name unit quantity isLowStock')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        res.status(200).json({
            menuItem: {
                id: menuItem._id,
                name: menuItem.name,
            },
            ingredients,
            totalIngredients: ingredients.length,
        });
        
    } catch (error) {
        logger.error('Error fetching ingredients for menu item', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default getIngredientsByMenuItem;