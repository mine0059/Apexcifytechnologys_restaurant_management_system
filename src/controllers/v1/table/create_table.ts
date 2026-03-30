/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";
import Table from "@/models/table";

import type { Request, Response } from "express";

const createTable = async (req: Request, res: Response) : Promise<void> => {
    const { tableNumber, capacity, status } = req.body;

    try {
        const existingTable = await Table.findOne({ tableNumber }).lean().exec();

        if (existingTable) {
            res.status(409).json({
                code: 'DuplicateError',
                message: `Table with number ${tableNumber} already exists`,
            });
            return;
        }

        const newTable = await Table.create({
            tableNumber,
            capacity,
            status,
        });

        logger.info(`Table created successfully: ${newTable}`);

        res.status(201).json({
            table: newTable,
        });

    } catch (error) {
        logger.error('Error while creating Table', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
}

export default createTable;