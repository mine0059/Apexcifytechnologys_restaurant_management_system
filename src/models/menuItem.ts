/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Schema, model } from 'mongoose';

export interface IMenuItem {
    name: string;
    description: string;
    price: number;
    category: string;
    isAvailable: boolean;
    banner: {
        publicId: string;
        url: string;
        width: number,
        height: number,
    };
}

const bannerSchema = new Schema(
    {
        publicId: {
            type: String,
            required: [true, 'Banner public id is required']
        },
        url: {
            type: String,
            required: [true, 'Banner url is required']
        },
        width: {
            type: Number,
            required: [true, 'Banner width is required']
        },
        height: {
            type: Number,
            required: [true, 'Banner height is required']
        },
    }
)

const menuItemSchema = new Schema<IMenuItem>(
    {
        name: {
            type: String,
            required: [true, 'Menu Item Name is required'],
            maxLength: [100, 'Menu Item Name must be less then 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Menu Item Description is required'],
            maxLength: [200, 'Menu Item Description must be less then 200 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Menu Item Price is required'],
            min: [0, 'Menu Item Price must be a positive number']
        },
        category: {
            type: String,
            required: [true, 'Menu Item category name is required']
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        banner: {
            type: bannerSchema,
            required: [true, 'Menu Item banner is required']
        }
    },
    {
        timestamps: true,
    }
);

export default model<IMenuItem>('MenuItem', menuItemSchema);