/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import Reservation from "@/models/reservation";
import Table from "@/models/table";

import type { Request, Response } from "express";
import mongoose, { Types } from "mongoose";

const createReservation = async (req: Request, res: Response) : Promise<void> => {
    const tableId = req.params.tableId as string;
    const userId = req.userId;

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Atomically claim the table only if it's still available
        const claimedTable = await Table.findOneAndUpdate(
            { _id: tableId, status: 'available' }, // condition
            { $set: { status: 'reserved' } }, // what to change
            { new: true, session }
        ).select('_id capacity status').lean().exec();

        // If null, either table doesn't exist OR it's already reserved/occupied
        if (!claimedTable) {
            await session.abortTransaction();

            const tableExists = await Table.exists({ _id: tableId }).lean().exec();

            if (!tableExists) {
                res.status(404).json({
                    code: 'NotFound',
                    message: 'Table not found',
                });
                return;
            }

            res.status(409).json({
                code: 'ConflictError',
                message: 'Table is not available for reservation',
            });
            return;
        }

        // create the reservation within same session
        const [reservation] = await Reservation.create(
            [{
                table: new Types.ObjectId(tableId),
                user: userId,
                reservationDate: new Date(),
            }],
            { session }
        );

        await session.commitTransaction();

        logger.info(`Table reserved successfully: ${reservation._id}`);

        res.status(201).json({
            reservation,
        });

    } catch (error: any) {
        await session.abortTransaction();
        
        // Catch duplicate key error (shouldn't happen due to findOneAndUpdate, but defensive)
        if (error.code === 11000) {
            res.status(409).json({
                code: 'ConflictError',
                message: 'Table is already reserved',
            });
            return;
        }

        logger.error('Error during Table Reservation', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    } finally {
        await session.endSession();
    }
};

export default createReservation;