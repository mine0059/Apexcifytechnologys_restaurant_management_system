/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import MenuItemIngredient from "@/models/menuItemIngredient";

import type { Request, Response } from "express";

const deleteIngredientLink = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const ingredientLink = await MenuItemIngredient.findById(id)
            .select('_id menuItem inventoryItem')
            .populate('menuItem', 'name')
            .populate('inventoryItem', 'name')
            .lean()
            .exec();

        if (!ingredientLink) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Ingredient link not found',
            });
            return;
        }

        await MenuItemIngredient.deleteOne({ _id: id });

        logger.info(
            `Ingredient link deleted: '${(ingredientLink.inventoryItem as any).name}' unlinked from '${(ingredientLink.menuItem as any).name}'`,
            { id, menuItem: ingredientLink.menuItem, inventoryItem: ingredientLink.inventoryItem }
        );

        res.sendStatus(204);
    } catch (error) {
        logger.error('Error deleting ingredient link', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default deleteIngredientLink;