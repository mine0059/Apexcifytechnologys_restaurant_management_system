/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import MenuItem from "@/models/menuItem";

import type { Request, Response } from "express";

const getMenuItemById = async (req: Request, res : Response) : Promise<void> => {
    try {
        const id = req.params.menuItemId;
        const menuItem = await MenuItem.findById(id)
            .select('-banner.publicId -__v -createdAt -updatedAt')
            .lean()
            .exec();

        if (!menuItem) {
            res.status(404).json({
                code: 'NotFound',
                message: 'MenuItem not found',
            });
            return;
        }

        res.status(200).json(menuItem);
    } catch (error) {
        logger.error('Error while fetching MenuItem by ID', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
}

export default getMenuItemById;