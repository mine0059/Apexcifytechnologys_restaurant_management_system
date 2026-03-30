/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Schema, model, Types } from 'mongoose';

export interface ITable {
    tableNumber: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved'
}

const TableSchema = new Schema<ITable>(
    {
        tableNumber: { type: Number, required: true, unique: true },
        capacity: { type: Number, required: true },
        status: { 
            type: String, 
            enum: {
                values: ['available', 'occupied', 'reserved'],
                message: '{VALUE} is not supported',
            },
            default: 'available'
        },
    },
    {
        timestamps: true,
    }
);

export default model<ITable>('Table', TableSchema);