/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import Reservation from "@/models/reservation";
import Table from "@/models/table";

import type { Request, Response } from "express";
import mongoose from "mongoose";

const deleteReservation = async (req: Request, res: Response) : Promise<void> => {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    try {
        const reservation = await Reservation.findById(id).select('user table').lean().exec();

        if (!reservation) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Reservation not found',
            });
            return;
        }

        const isOwner = reservation.user?.toString() === userId?.toString();

        if (!isOwner && userRole !== 'admin') {
            logger.warn('A user tried to delete a Reservation without permission', {
                userId,
            });

            res.status(403).json({
                code: 'AuthorizationError',
                message: 'Access denied, insufficient permissions',
            });
            return;
        }

        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                await Reservation.deleteOne({  _id: id }).session(session);

                await Table.findByIdAndUpdate(
                    reservation.table, 
                    { $set: { status: 'available' } }
                ).session(session).exec();
            });

            logger.info(`Reservation deleted successfully: ${id}`);
            res.sendStatus(204);

        } finally {
            await session.endSession();
        }
    }  catch (error) {
        logger.error('Error while deleting reservation', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default deleteReservation;