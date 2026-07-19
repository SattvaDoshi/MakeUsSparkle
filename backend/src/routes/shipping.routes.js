/**
 * shipping.routes.js
 *
 * Mounted at /api/shipping in src/app.js.
 * Follows the same middleware pattern as adminOrder.routes.js:
 *   requireAuth           – authenticated user or admin
 *   requireAuth + requireAdmin – admin only
 */

import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import {
	checkPincode,
	getRate,
	createShipment,
	trackShipment,
	cancelShipment,
	printLabel,
	addWarehouse,
	listWarehouses,
} from "../controllers/shipping.controller.js";

const router = Router();

// ── Public routes (no auth) ───────────────────────────────────────────────────
router.post("/check-pincode", checkPincode);
router.post("/rate",          getRate);

// ── User OR admin: track own order ───────────────────────────────────────────
router.get("/track/:orderId", requireAuth, trackShipment);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.post("/create/:orderId", requireAuth, requireAdmin, createShipment);
router.post("/cancel/:orderId", requireAuth, requireAdmin, cancelShipment);
router.get( "/label/:orderId",  requireAuth, requireAdmin, printLabel);
router.post("/warehouse",       requireAuth, requireAdmin, addWarehouse);
router.get( "/warehouse",       requireAuth, requireAdmin, listWarehouses);

export default router;
