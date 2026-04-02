/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import MenuItemIngredient from "@/models/menuItemIngredient";
import InventoryItem from "@/models/inventoryItem";
import { logger } from "@/lib/winston";

import type { ClientSession } from "mongoose";

interface OrderItem {
    menuItem: any;
    quantity: number;
}

/**
 * Deducts inventory for all items in an order.
 * Must be called within an existing transaction session.
 */
export const deductInventory = async (
    orderItems: OrderItem[],
    session: ClientSession
): Promise<void> => {
    const menuItemIds = orderItems.map(item => item.menuItem.toString());

    const ingredientLinks = await MenuItemIngredient.find({
        menuItem: { $in: menuItemIds },
    })
        .select('menuItem inventoryItem quantityNeeded')
        .lean()
        .exec();

    if (ingredientLinks.length === 0) return;

    const deductionMap = new Map<string, number>();

    for (const link of ingredientLinks) {
        const orderedItem = orderItems.find(
            (item) => item.menuItem.toString() === link.menuItem.toString()
        );

        if (!orderedItem) continue;

        const totalDeduction = link.quantityNeeded * orderedItem.quantity;
        const inventoryId = link.inventoryItem.toString();

        deductionMap.set(
            inventoryId,
            (deductionMap.get(inventoryId) ?? 0) + totalDeduction
        );
    }

    // Apply all deduction in parallel within the session
    await Promise.all(
        Array.from(deductionMap.entries()).map(async ([inventoryId, deductAmount]) => {
            const inventoryItem = await InventoryItem.findById(inventoryId)
                .select('quantity minThreshold')
                .lean()
                .exec();

            if (!inventoryItem) return;

            const newQuantity = Math.max(inventoryItem.quantity - deductAmount, 0);
            const isLowStock = newQuantity <= inventoryItem.minThreshold;

            const updated = await InventoryItem.findByIdAndUpdate(
                inventoryId,
                { $set: { quantity: newQuantity, isLowStock } },
                { new: true, returnDocument: 'after', session }
            )
                .select('name quantity minThreshold isLowStock')
                .lean()
                .exec();

            if (updated?.isLowStock) {
                logger.warn(
                    `Low stock alert: '${updated.name}' is at ${updated.quantity} (threshold: ${updated.minThreshold})`,
                    { inventoryId, quantity: updated.quantity }
                );
            }
        })
    );
};

/**
 * Restores inventory for all items in a cancelled order.
 * Must be called within an existing transaction session.
 */
export const restoreInventory = async (
    orderItems: OrderItem[],
    session: ClientSession
): Promise<void> => {
    const menuItemIds = orderItems.map((item) => item.menuItem.toString());

    const ingredientLinks = await MenuItemIngredient.find({
        menuItem: { $in: menuItemIds },
    })
        .select('menuItem inventoryItem quantityNeeded')
        .lean()
        .exec();

    if (ingredientLinks.length === 0) return;

    // Build restoration map — same logic as deduction but in reverse
    const restorationMap = new Map<string, number>();

    for (const link of ingredientLinks) {
        const orderedItem = orderItems.find(
            (item) => item.menuItem.toString() === link.menuItem.toString()
        );

        if (!orderedItem) continue;

        const totalRestoration = link.quantityNeeded * orderedItem.quantity;
        const inventoryId = link.inventoryItem.toString();

        restorationMap.set(
            inventoryId,
            (restorationMap.get(inventoryId) ?? 0) + totalRestoration
        );
    }

    // Apply all restorations in parallel within the session
    await Promise.all(
        Array.from(restorationMap.entries()).map(async ([inventoryId, restoreAmount]) => {
            const inventoryItem = await InventoryItem.findById(inventoryId)
                .select('quantity minThreshold')
                .lean()
                .exec();

            if (!inventoryItem) return;

            const newQuantity = inventoryItem.quantity + restoreAmount;
            const isLowStock = newQuantity <= inventoryItem.minThreshold;

            await InventoryItem.findByIdAndUpdate(
                inventoryId,
                { $set: { quantity: newQuantity, isLowStock } },
                { returnDocument: 'after', session }
            ).exec();
        })
    );
};