/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import Reservation from "@/models/reservation";
import User from "@/models/user";
import Table from "@/models/table";

import type { Request, Response } from "express";

const deleteReservation = async (req: Request, res: Response) : Promise<void> => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const reservation = await Reservation.findById(id).select('user table').lean().exec();

        if (!reservation) {
            res.status(404).json({
                code: 'NotFound',
                message: 'Reservation not found',
            });
            return;
        }

        const user = await User.findById(userId).select('role').lean().exec();

        if (!user) {
            res.status(404).json({
                code: 'NotFound',
                message: 'User not found',
            });
            return;
        }

        if (reservation.user !== userId && user.role !== 'admin') {
            res.status(403).json({
                code: 'AuthorizationError',
                message: 'Access denied, insufficient permissions',
            });

            logger.warn('A user tried to delete a Reservation without permission', {
                userId,
            });

            return;
        }

        await Reservation.deleteOne({ _id: id });

        await Table.findByIdAndUpdate(reservation.table, { status: 'available' }).exec();

        logger.info(`Reservation deleted successfully: ${id}`);

        res.sendStatus(204);
    } catch (error) {
        logger.error('Error while deleting reservation', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default deleteReservation;