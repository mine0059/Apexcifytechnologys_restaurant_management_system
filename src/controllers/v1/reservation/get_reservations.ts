/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { logger } from "@/lib/winston";

import Reservation from "@/models/reservation";

import type { Request, Response } from "express";

const getReservations = async (req: Request, res: Response) : Promise<void> => {
    const userId = req.userId;

    try {
        const reservations = await Reservation.find({ user: userId })
                .select('table reservationDate')
                .populate('table', 'tableNumber capacity')
                .sort({ reservationDate: -1 })
                .lean()
                .exec();
        
        res.status(200).json({
            reservations,
        });

    } catch (error) {
        logger.error('Error fetching reservations', error);
        res.status(500).json({
            code: 'ServerError',
            message: 'Internal server error',
        });
    }
};

export default getReservations; 