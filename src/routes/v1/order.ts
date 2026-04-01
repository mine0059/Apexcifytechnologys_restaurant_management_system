/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Router } from "express";
import authenticated from "@/middlewares/authenticated";
import authorize from "@/middlewares/authorize";
import { validateParams, validateBody, validateQuery } from "@/middlewares/validate";

import createOrder from "@/controllers/v1/order/create_order";
import getOrderById from "@/controllers/v1/order/get_order_id";
import getAllOrders from "@/controllers/v1/order/get_all_order";
import updateOrderStatus from "@/controllers/v1/order/update_order_status";

import { updateOrderStatusSchema, createOrderSchema, orderIdParamSchema, getAllOrdersQuerySchema } from "@/validations/order";

const router = Router();

router.post('/', authenticated, authorize(['admin', 'user']), validateBody(createOrderSchema), createOrder);
router.get('/', authenticated, authorize(['admin', 'user']), validateQuery(getAllOrdersQuerySchema), getAllOrders);
router.get('/:orderId', authenticated, authorize(['admin', 'user']), validateParams(orderIdParamSchema), getOrderById);
router.put('/:orderId/status', authenticated, authorize(['admin', 'user']), validateParams(orderIdParamSchema), validateBody(updateOrderStatusSchema), updateOrderStatus);

export default router;