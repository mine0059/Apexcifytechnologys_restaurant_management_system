/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Schema, model, Types } from 'mongoose';

export interface IMenuItemIngredient {
    menuItem: Types.ObjectId;
    inventoryItem: Types.ObjectId;
    quantityNeeded: number;
}

const menuItemIngredientSchema = new Schema<IMenuItemIngredient>(
    {
        menuItem: {
            type: Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: [true, 'Menu item reference is required'],
        },
        inventoryItem: {
            type: Schema.Types.ObjectId,
            ref: 'InventoryItem',
            required: [true, 'Inventory item reference is required'],
        },
        quantityNeeded: {
            type: Number,
            required: [true, 'Quantity needed is required'],
            min: [0.01, 'Quantity needed must be greater than 0'],
        },
    },
    {
        timestamps: true,
    }
);

// One menu item cannot link to the same ingredient twice
menuItemIngredientSchema.index({ menuItem: 1, inventoryItem: 1 }, { unique: true });

// Index to optimize lookups of ingredients by menu item
menuItemIngredientSchema.index({ menuItem: 1 });

export default model<IMenuItemIngredient>('MenuItemIngredient', menuItemIngredientSchema);
