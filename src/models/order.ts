/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Schema, model, Types } from 'mongoose';

export interface IOrder {
    user: Types.ObjectId;
    table: Types.ObjectId;
    items: {
        menuItem: Types.ObjectId;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: 'pending' | 'preparing' | 'served' | 'completed' | 'cancelled';
}

const itemsSchema = new Schema(
    {
        menuItem: {
            type: Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: [true, 'Menu item reference is required']
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1']
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        }
    }
)

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required']
        },
        table: {
            type: Schema.Types.ObjectId,
            ref: 'Table',
            required: [true, 'Table reference is required']
        },
        items: {
            type: [itemsSchema],
            required: [true, 'Order items are required'],
            validate: {                          
                validator: (val: any[]) => val.length > 0,
                message: 'Order must contain at least one item'
            }
        },
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount cannot be negative']
        },
        status: {
            type: String,
            enum: {
                values: ['pending', 'preparing', 'served', 'completed', 'cancelled'],
                message: '{VALUE} is not supported',
            },
            default: 'pending'
        }
    },
    {
        timestamps: true,
    }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ table: 1, status: 1 });

export default model<IOrder>('Order', orderSchema);