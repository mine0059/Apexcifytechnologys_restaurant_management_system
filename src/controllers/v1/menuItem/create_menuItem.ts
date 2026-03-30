/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";
import menuItem from "@/models/menuItem";

import type { Request, Response } from "express";

const createMenuItem = async (req: Request, res : Response) : Promise<void> => {
    const { name, description, price, category, isAvailable, banner } = req.body;

    try {
        
        const newMenuItem = await menuItem.create({
            name,
            description,
            price,
            category,
            isAvailable,
            banner,
        });

        logger.info(`MenuItem created successfully: ${newMenuItem}`);

        res.status(201).json({
            menuItem: newMenuItem,
        });

    } catch (error) {
        logger.error('Error while creating Event', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
}

export default createMenuItem;