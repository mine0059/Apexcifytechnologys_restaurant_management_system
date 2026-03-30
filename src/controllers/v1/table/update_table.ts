/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";
import Table from "@/models/table";
import User from "@/models/user";

import type { Request, Response } from "express";

const updateTable = async (req: Request, res: Response) : Promise<void> => {
    const { tableNumber, capacity, status } = req.body;

    try {
        const userId = req.userId;
        const { tableId } = req.params;

        const user = await User.findById(userId)
                    .select('role')
                    .lean()
                    .exec();
        
        const table = await Table.findById(tableId)
                    .select('-__v')
                    .exec();
        
        if (!table) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Table not found',
            });
            return;
        } 
        
        if (user?.role !== 'admin') {
            res.status(403).json({
                code: 'AuthorizationError',
                message: 'Access denied, insufficient permissions',
            });

            logger.warn('A user tried to update a Table without permission', {
                userId,
                table,
            });
            return;
        }

        if(tableNumber !== undefined) table.tableNumber = tableNumber;
        if(capacity !== undefined) table.capacity = capacity;
        if(status !== undefined) table.status = status;

        await table.save();

        logger.info(`Table updated successfully: ${ table }`);

        res.status(200).json({
            table,
        });

    } catch (error) {
        logger.error('Error while updating Table', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
}

export default updateTable;