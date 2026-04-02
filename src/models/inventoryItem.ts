/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Schema, model } from 'mongoose';

export interface IInventoryItem {
    name: string;
    unit: 'kg' | 'grams' | 'litres' | 'ml' | 'pieces';
    quantity: number;
    minThreshold: number;
    isLowStock: boolean;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
    {
        name: {
            type: String,
            required: [true, 'Inventory item name is required'],
            trim: true,
            unique: true,
        },
        unit: {
            type: String,
            enum: {
                values: ['kg', 'grams', 'litres', 'ml', 'pieces'],
                message: '{VALUE} is not a supported unit',
            },
            required: [true, 'Unit is required'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
            default: 0,
        },
        minThreshold: {
            type: Number,
            required: [true, 'Minimum threshold is required'],
            min: [0, 'Minimum threshold cannot be negative'],
            default: 0,
        },
        isLowStock: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// compute isLowStock before every save
inventoryItemSchema.pre('save', async function () {
    this.isLowStock = this.quantity <= this.minThreshold;
});

// handle findOneAndUpdate to ensure isLowStock is updated when quantity or minThreshold changes
inventoryItemSchema.pre('findOneAndUpdate', async function () {
    const update = this.getUpdate() as Record<string, any>;

    if (update?.$set?.quantity !== undefined || update?.$set?.minThreshold !== undefined) {
    }
});

inventoryItemSchema.index({ isLowStock: 1 });

export default model<IInventoryItem>('InventoryItem', inventoryItemSchema);