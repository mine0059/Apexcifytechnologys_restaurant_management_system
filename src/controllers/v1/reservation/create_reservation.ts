/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import Reservation from "@/models/reservation";
import Table from "@/models/table";

import type { Request, Response } from "express";
import { Types } from "mongoose";

const createReservation = async (req: Request, res: Response) : Promise<void> => {
    const tableId = req.params.tableId as string;
    const userId = req.userId

    if (!Types.ObjectId.isValid(tableId)) {
        res.status(400).json({
            code: 'BadRequest',
            message: 'Invalid table ID format',
        });
        return;
    }

    try {
        const table = await Table.findById(tableId).select('_id capacity status').lean().exec();

        if (!table) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Table not found',
            });
            return;
        }

        if (table.status !== 'available') {
            res.status(409).json({
                code: 'ConflictError',
                message: `Table is currently ${table.status}`,
            });
            return;
        }

        const existingReservation = await Reservation.findOne({
            table: tableId,
            user: userId,
        }).lean().exec();

        if (existingReservation) {
            res.status(400).json({
                code: 'BadRequest',
                message: 'You have already reserved this table',
            });
            return;
        }

        const reservation = await Reservation.create({
            table: new Types.ObjectId(tableId),
            user: userId,
            reservationDate: new Date(),
        });

        await Table.findByIdAndUpdate(tableId, { status: 'reserved' }).exec();

        logger.info(`Table reserved successfully: ${reservation}`);

        res.status(201).json({
            reservation,
        });

    } catch (error) {
        logger.error('Error during Table Reservation', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default createReservation;