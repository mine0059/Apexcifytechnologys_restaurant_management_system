/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import MenuItemIngredient from "@/models/menuItemIngredient";

import type { Request, Response } from "express";
import type { updateIngredientLinkSchema } from "@/validations/inventory";
import type { z } from "zod";

type UpdateIngredientLinkBody = z.infer<typeof updateIngredientLinkSchema>;

const updateIngredientLink = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { quantityNeeded } = req.body as UpdateIngredientLinkBody;

    try {
        const ingredientLink = await MenuItemIngredient.findByIdAndUpdate(
            id,
            { $set: { quantityNeeded } },
            { new: true, runValidators: true }
        )
            .populate('menuItem', 'name')
            .populate('inventoryItem', 'name unit')
            .lean()
            .exec();

        if (!ingredientLink) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Ingredient link not found',
            });
            return;
        }

        logger.info(
            `Ingredient link updated: ${id} — quantityNeeded set to ${quantityNeeded}`,
            { id, quantityNeeded }
        );

        res.status(200).json({
            ingredientLink,
        });
        
    } catch (error) {
        logger.error('Error updating ingredient link', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default updateIngredientLink;