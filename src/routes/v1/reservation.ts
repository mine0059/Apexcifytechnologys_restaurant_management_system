/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Router } from "express";
import authenticated from "@/middlewares/authenticated";
import authorize from "@/middlewares/authorize";
import { validateParams } from "@/middlewares/validate";
import { reservationIdParamSchema, tableIdParamSchema } from "@/validations/reservation";

import createReservation from "@/controllers/v1/reservation/create_reservation";
import getReservations from "@/controllers/v1/reservation/get_reservations";
import deleteReservation from "@/controllers/v1/reservation/delete_reservation";

const router = Router();

router.get('/', authenticated, authorize(['admin', 'user']), getReservations);
router.post('/:tableId', authenticated, authorize(['admin', 'user']), validateParams(tableIdParamSchema), createReservation);
router.delete('/:id', authenticated, authorize(['admin', 'user']), validateParams(reservationIdParamSchema), deleteReservation);

export default router;