/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Router } from "express";
import multer from "multer";

import authenticated from "@/middlewares/authenticated";
import authorize from "@/middlewares/authorize";
import uploadMenuItemBanner from "@/middlewares/uploadMenuItemBanner";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate";

import createMenuItem from "@/controllers/v1/menuItem/create_menuItem";
import updateMenuItem from "@/controllers/v1/menuItem/update_menuItem";
import deleteMenuItem from "@/controllers/v1/menuItem/delete_menuItem";
import getAllMenuItems from "@/controllers/v1/menuItem/get_all_menuItems";
import getMenuItemById from "@/controllers/v1/menuItem/get_menuItem_by_id";

import { CreateMenuItemBodySchema, UpdateMenuItemBodySchema, MenuItemIdParamSchema, getAllMenuItemsQuerySchema } from "@/validations/menuItem";

const upload = multer();

const router = Router();

router.post('/', authenticated, authorize(['admin']), upload.single('banner_image'), uploadMenuItemBanner('post'), validateBody(CreateMenuItemBodySchema), createMenuItem);
router.get('/', authenticated, authorize(['admin', 'user']), validateQuery(getAllMenuItemsQuerySchema), getAllMenuItems);
router.get('/:menuItemId', authenticated, authorize(['admin', 'user']), validateParams(MenuItemIdParamSchema), getMenuItemById);
router.put('/:menuItemId', authenticated, authorize(['admin']), validateParams(MenuItemIdParamSchema), upload.single('banner_image'), uploadMenuItemBanner('put'), validateBody(UpdateMenuItemBodySchema), updateMenuItem);
router.delete('/:menuItemId', authenticated, authorize(['admin']), validateParams(MenuItemIdParamSchema), deleteMenuItem);

export default router;