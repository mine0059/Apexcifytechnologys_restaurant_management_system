/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Router } from "express";
import authenticated from "@/middlewares/authenticated";
import authorize from "@/middlewares/authorize";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate";

import {
    inventoryItemIdParamSchema,
    ingredientIdParamSchema,
    menuItemIdParamSchema,
    createInventoryItemSchema,
    updateInventoryItemSchema,
    restockInventoryItemSchema,
    linkIngredientSchema,
    updateIngredientLinkSchema,
    getAllInventoryQuerySchema,
} from "@/validations/inventory";

import createInventoryItem from "@/controllers/v1/inventory/create_inventory";
import getAllInventoryItems from "@/controllers/v1/inventory/get_all_inventoryItem";
import getInventoryItemById from "@/controllers/v1/inventory/get_inventoryItems_by_id";
import updateInventoryItem from "@/controllers/v1/inventory/update_inventoryItem";
import restockInventoryItem from "@/controllers/v1/inventory/restock_inventoryItem";
import deleteInventoryItem from "@/controllers/v1/inventory/delete_inventory";

import linkIngredient from "@/controllers/v1/inventory/link_ingredient";
import getIngredientsByMenuItem from "@/controllers/v1/inventory/get_ingredient_by_menuItem";
import updateIngredientLink from "@/controllers/v1/inventory/update_ingredient_link";
import deleteIngredientLink from "@/controllers/v1/inventory/delete_ingredient_link";

const router = Router();

router.post(
    '/',
    authenticated,
    authorize(['admin']),
    validateBody(createInventoryItemSchema),
    createInventoryItem
);

/**
 *  Inventory Item Routes
 */
router.get(
    '/',
    authenticated,
    authorize(['admin']),
    validateQuery(getAllInventoryQuerySchema),
    getAllInventoryItems
);

router.get(
    '/:itemId',
    authenticated,
    authorize(['admin']),
    validateParams(inventoryItemIdParamSchema),
    getInventoryItemById
);

router.put(
    '/:itemId',
    authenticated,
    authorize(['admin']),
    validateParams(inventoryItemIdParamSchema),
    validateBody(updateInventoryItemSchema),
    updateInventoryItem
);

router.patch(
    '/:itemId/restock',
    authenticated,
    authorize(['admin']),
    validateParams(inventoryItemIdParamSchema),
    validateBody(restockInventoryItemSchema),
    restockInventoryItem
);

router.delete(
    '/:itemId',
    authenticated,
    authorize(['admin']),
    validateParams(inventoryItemIdParamSchema),
    deleteInventoryItem
);

/**
 * Ingredient Link Routes
 */

router.post(
    '/ingredients',
    authenticated,
    authorize(['admin']),
    validateBody(linkIngredientSchema),
    linkIngredient
);

router.get(
    '/ingredients/:menuItemId',
    authenticated,
    authorize(['admin']),
    validateParams(menuItemIdParamSchema),
    getIngredientsByMenuItem
);

router.patch(
    '/ingredients/:id',
    authenticated,
    authorize(['admin']),
    validateParams(ingredientIdParamSchema),
    validateBody(updateIngredientLinkSchema),
    updateIngredientLink
);

router.delete(
    '/ingredients/:id',
    authenticated,
    authorize(['admin']),
    validateParams(ingredientIdParamSchema),
    deleteIngredientLink
);

export default router;