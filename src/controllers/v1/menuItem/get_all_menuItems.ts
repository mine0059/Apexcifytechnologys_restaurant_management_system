/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";
import config from "@/config";

import MenuItem from "@/models/menuItem";

import type { Request, Response } from "express";

const getAllMenuItems = async (req: Request, res : Response) : Promise<void> => {
    try {
        const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
        const offset = parseInt(req.query.offset as string) || config.defaultResOffset;
        
        const total = await MenuItem.countDocuments().exec();

        const menuItems = await MenuItem.find()
                        .select('-banner.publicId -__v -createdAt -updatedAt')
                        .limit(limit)
                        .skip(offset)
                        .sort({ createdAt: -1 })
                        .lean()
                        .exec(); 
        
        res.status(200).json({
            limit,
            offset,
            total,
            menuItems,
        });

    } catch (error) {
        logger.error('Error while fetching MenuItems', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
}

export default getAllMenuItems;