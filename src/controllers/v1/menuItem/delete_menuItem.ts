/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { v2 as cloudinary } from 'cloudinary';

import { logger } from "@/lib/winston";

import MenuItem from "@/models/menuItem";
import User from "@/models/user";

import type { Request, Response } from "express";

const deleteMenuItem = async (req: Request, res : Response) : Promise<void> => {
    try {
        const { menuItemId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId)
                .select('role')
                .lean()
                .exec();

        const menuItem = await MenuItem.findById(menuItemId)
                    .select('createdBy banner.publicId')
                    .lean()
                    .exec();
        
        if (!menuItem) {
            res.status(404).json({
                code: 'NotFound',
                message: 'MenuItem not found'
            });
            return;
        }

        if (user?.role !== 'admin') {
            res.status(403).json({
                code: 'AuthorizationError',
                message: 'Access denied, insufficient permissions'
            });

            logger.warn('A user tried to delete a MenuItem without permission', {
                userId,
            });

            return;
        }

        await cloudinary.uploader.destroy(menuItem.banner.publicId);
        logger.info('MenuItem banner deleted from cloudinary', {
            publicId: menuItem.banner.publicId,
        });

        await MenuItem.deleteOne({ _id: menuItemId });

        logger.info('MenuItem deleted successfully', {
            menuItemId
        });

        res.sendStatus(204);

    } catch (error) {
        logger.error('Error while deleting MenuItem', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
}

export default deleteMenuItem;