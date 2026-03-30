/**
 * @copyright 2026 oghenemine emmanuel
 * @license Apache-2.0
 */

import { Router } from "express";

import authenticated from "@/middlewares/authenticated";
import authorize from "@/middlewares/authorize";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate";

import createTable from "@/controllers/v1/table/create_table";
import updateTable from "@/controllers/v1/table/update_table";
import getAllTables from "@/controllers/v1/table/get_all_tables";

import { createTableSchema, updateTableSchema, tableIdParamSchema, getAllTablesQuerySchema } from "@/validations/table";

const router = Router();

router.post('/', authenticated, authorize(['admin']), validateBody(createTableSchema), createTable);
router.get('/', authenticated, authorize(['admin', 'user']), validateQuery(getAllTablesQuerySchema), getAllTables);
router.put('/:tableId', authenticated, authorize(['admin']), validateParams(tableIdParamSchema), validateBody(updateTableSchema), updateTable);

export default router;