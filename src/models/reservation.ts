/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Schema, model, Types } from "mongoose";

export interface IReservation {
    user: Types.ObjectId;
    table: Types.ObjectId;
    reservationDate: Date;
}

const reservationSchema = new Schema<IReservation>({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    table: { 
        type: Schema.Types.ObjectId, 
        ref: 'Table', 
        required: true 
    },
    reservationDate: { 
        type: Date, 
        default: Date.now,
    },
});

reservationSchema.index({ table: 1 }, { unique: true });

reservationSchema.index({ user: 1, reservationDate: -1 });

export default model<IReservation>('Reservation', reservationSchema);