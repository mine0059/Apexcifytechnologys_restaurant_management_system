/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";
import User from "@/models/user";
import MenuItem from "@/models/menuItem";

import type { Request, Response } from "express";

const updateMenuItem = async (req: Request, res : Response) : Promise<void> => {
    const { name, description, price, category, isAvailable, banner } = req.body;

    try {
        const { menuItemId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId)
                    .select('role')
                    .lean()
                    .exec();

        const menuItem = await MenuItem.findById(menuItemId)
                        .select('-__v')
                        .exec();

        if (!menuItem) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Menu item not found',
            });
            return;
        }

        if (user?.role !== 'admin') {
            res.status(403).json({
                code: 'AuthorizationError',
                message: 'Access denied, insufficient permissions',
            });

            logger.warn('A user tired to update a Event without permission', {
                userId,
                event,
            });

            return;
        }

        if (name) menuItem.name = name;
        if (description) menuItem.description = description;
        if (price) menuItem.price = price;
        if (category) menuItem.category = category;
        if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
        if (banner) menuItem.banner = banner;

        await menuItem.save();

        logger.info(`MenuItem updated successfully: ${menuItem}`);

        res.status(200).json({
            menuItem,
        });

    } catch (error) {
        logger.error('Error while updating MenuItem', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
}

export default updateMenuItem;