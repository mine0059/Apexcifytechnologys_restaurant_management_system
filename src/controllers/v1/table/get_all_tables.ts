/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";
import config from "@/config";

import Table from "@/models/table";
import User from "@/models/user";

import type { Request, Response } from "express";

interface QueryType {
    status?: 'available' | 'occupied' | 'reserved';
} 

const getAllTables = async (req: Request, res : Response) : Promise<void> => {
    try {
        const userId = req.userId;
        const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
        const offset = parseInt(req.query.offset as string) || config.defaultResOffset;

        const user = await User.findById(userId).select('role').lean().exec();
        const query: QueryType = {};

        if (user?.role !== 'admin') {
            query.status = 'available';
        }
        const total = await Table.countDocuments(query);

        const tables = await Table.find(query)
                        .select('-__v -createdAt -updatedAt')
                        .limit(limit)
                        .skip(offset)
                        .sort({ createdAt: -1 })
                        .lean()
                        .exec();

        res.status(200).json({
            limit,
            offset,
            total,
            tables,
        });
        
    } catch (error) {
        logger.error('Error while fetching Tables', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
}

export default getAllTables;