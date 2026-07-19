/**
 * shipping.controller.js
 *
 * Thin controller layer for /api/shipping routes.
 * Follows the same try/catch + { success, message } pattern used across
 * the rest of the application (see order.controller.js for reference).
 */

import Order from "../models/order.model.js";
import itl from "../services/ithinkLogistics.service.js";
import { resolveStatus } from "../services/ithinkStatusMap.service.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalises a caught error (plain object from itlPost, or an Error instance)
 * into { httpStatus, message } for the response.
 */
function normaliseError(err) {
	if (err && typeof err === "object" && "status" in err && "message" in err) {
		// Thrown by itlPost — already normalised
		return { httpStatus: err.status, message: err.message };
	}
	const message = err instanceof Error ? err.message : String(err || "Unknown error");
	return { httpStatus: 500, message };
}

// ─── Public endpoints (no auth required) ─────────────────────────────────────

/**
 * POST /api/shipping/check-pincode
 * Body: { pincode }
 */
export async function checkPincode(req, res) {
	try {
		const { pincode } = req.body;
		if (!pincode || !/^\d{6}$/.test(String(pincode))) {
			return res.status(400).json({ success: false, message: "Provide a valid 6-digit pincode." });
		}
		const result = await itl.checkPincode(pincode);
		return res.json({ success: true, data: result?.data ?? result });
	} catch (err) {
		const { httpStatus, message } = normaliseError(err);
		return res.status(httpStatus).json({ success: false, message });
	}
}

/**
 * POST /api/shipping/rate
 * Body: { fromPincode, toPincode, lengthCm, widthCm, heightCm, weightKg,
 *         paymentMethod, productMrp, orderType }
 */
export async function getRate(req, res) {
	try {
		const { fromPincode, toPincode, paymentMethod, productMrp, orderType, ...dims } = req.body;
		if (!fromPincode || !toPincode) {
			return res.status(400).json({ success: false, message: "fromPincode and toPincode are required." });
		}
		const result = await itl.getRate({ fromPincode, toPincode, paymentMethod, productMrp, orderType, ...dims });
		return res.json({ success: true, data: result?.data ?? result });
	} catch (err) {
		const { httpStatus, message } = normaliseError(err);
		return res.status(httpStatus).json({ success: false, message });
	}
}

// ─── Admin endpoints ──────────────────────────────────────────────────────────

/**
 * POST /api/shipping/create/:orderId
 * Body (optional): { pickupAddressId, weightKg, lengthCm, widthCm, heightCm }
 *
 * Calls iThink createOrder, then persists the AWB + shipping info back onto
 * the Order document.
 */
export async function createShipment(req, res) {
	try {
		const order = await Order.findById(req.params.orderId)
			.populate("items.product", "title weightKg lengthCm widthCm heightCm")
			.populate("user", "name email");

		if (!order) {
			return res.status(404).json({ success: false, message: "Order not found." });
		}
		if (order.shipping?.awbNumber) {
			return res.status(400).json({
				success: false,
				message: `Shipment already created. AWB: ${order.shipping.awbNumber}`,
			});
		}

		// Pickup address: body override → env default
		const pickupAddressId =
			req.body.pickupAddressId ||
			process.env.ITL_PICKUP_ADDRESS_ID ||
			"";

		if (!pickupAddressId) {
			return res.status(400).json({ success: false, message: "pickupAddressId is required." });
		}

		const itlResponse = await itl.createOrder({
			order,
			pickupAddressId,
			weightKg: req.body.weightKg ? parseFloat(req.body.weightKg) : undefined,
			lengthCm: req.body.lengthCm ? parseFloat(req.body.lengthCm) : undefined,
			widthCm:  req.body.widthCm  ? parseFloat(req.body.widthCm)  : undefined,
			heightCm: req.body.heightCm ? parseFloat(req.body.heightCm) : undefined,
		});

		// Extract AWB from iThink response
		const shipmentData = itlResponse?.data?.["1"]
			|| itlResponse?.data?.shipment_list?.[0]
			|| itlResponse?.data?.[0]
			|| itlResponse?.data
			|| {};

		const awbNumber   = shipmentData.waybill || shipmentData.awb_number || "";
		const logisticName = shipmentData.courier || shipmentData.logistic_name || "";
		const trackingUrl  = awbNumber
			? `https://www.ithinklogistics.com/tracking/?awb=${awbNumber}`
			: "";

		// Persist back onto the Order
		order.shipping = {
			awbNumber,
			logisticName,
			trackingUrl,
			currentStatus:     "Manifested",
			currentStatusCode: "MF",
			pickupAddressId:   String(pickupAddressId),
			lastSyncedAt:      new Date(),
			cancelStatus:      null,
		};
		order.status = "manifested";
		await order.save();

		return res.json({
			success: true,
			message: "Shipment created successfully.",
			awbNumber,
			trackingUrl,
			order,
		});
	} catch (err) {
		const { httpStatus, message } = normaliseError(err);
		return res.status(httpStatus).json({ success: false, message });
	}
}

/**
 * GET /api/shipping/track/:orderId
 *
 * Looks up the order's AWB, calls iThink trackOrder, refreshes the Order's
 * shipping fields as a side-effect, and returns the current status.
 * Accessible by both authenticated users (own order) and admins (any order).
 */
export async function trackShipment(req, res) {
	try {
		const isAdmin = req.user?.role === "admin";
		const query = isAdmin
			? { _id: req.params.orderId }
			: { _id: req.params.orderId, user: req.user._id };

		const order = await Order.findOne(query);
		if (!order) {
			return res.status(404).json({ success: false, message: "Order not found." });
		}
		if (!order.shipping?.awbNumber) {
			return res.status(400).json({ success: false, message: "No shipment has been created for this order yet." });
		}

		const itlResponse = await itl.trackOrder(order.shipping.awbNumber);
		const trackData = itlResponse?.data?.[order.shipping.awbNumber] || {};

		const statusCode   = trackData?.status_code || trackData?.StatusCode || "";
		const statusString = trackData?.current_status || trackData?.status || trackData?.Status || "";
		const { internalStatus, label } = resolveStatus(statusCode, statusString);

		// Side-effect: update Order.shipping fields
		order.shipping.currentStatus     = label;
		order.shipping.currentStatusCode = statusCode;
		order.shipping.expectedDeliveryDate = trackData?.expected_date || trackData?.ExpectedDeliveryDate || null;
		order.shipping.lastSyncedAt      = new Date();
		if (internalStatus !== order.status) {
			order.status = internalStatus;
		}
		await order.save();

		return res.json({
			success: true,
			shipping: order.shipping,
			status:   order.status,
			raw:      trackData,
		});
	} catch (err) {
		const { httpStatus, message } = normaliseError(err);
		return res.status(httpStatus).json({ success: false, message });
	}
}

/**
 * POST /api/shipping/cancel/:orderId
 * Admin only. Cancels the AWB and marks the Order as cancelled.
 */
export async function cancelShipment(req, res) {
	try {
		const order = await Order.findById(req.params.orderId);
		if (!order) {
			return res.status(404).json({ success: false, message: "Order not found." });
		}
		if (!order.shipping?.awbNumber) {
			return res.status(400).json({ success: false, message: "No shipment found for this order." });
		}

		const itlResponse = await itl.cancelOrder(order.shipping.awbNumber);
		const cancelData  = itlResponse?.data?.[0] || itlResponse?.data || {};
		const cancelStatus = cancelData?.status || cancelData?.Status || "Cancelled";

		order.shipping.cancelStatus = cancelStatus;
		order.shipping.lastSyncedAt = new Date();
		order.status = "cancelled";
		await order.save();

		return res.json({
			success: true,
			message: "Shipment cancelled.",
			cancelStatus,
			order,
		});
	} catch (err) {
		const { httpStatus, message } = normaliseError(err);
		return res.status(httpStatus).json({ success: false, message });
	}
}

/**
 * GET /api/shipping/label/:orderId
 * Admin only. Returns the PDF label URL.
 */
export async function printLabel(req, res) {
	try {
		const order = await Order.findById(req.params.orderId).select("shipping");
		if (!order) {
			return res.status(404).json({ success: false, message: "Order not found." });
		}
		if (!order.shipping?.awbNumber) {
			return res.status(400).json({ success: false, message: "No shipment found for this order." });
		}

		const pageSize = req.query.pageSize || "A4";
		const itlResponse = await itl.printLabel(order.shipping.awbNumber, pageSize);

		const labelUrl = itlResponse?.data?.label_url
			|| itlResponse?.data?.url
			|| itlResponse?.data?.pdf_link
			|| "";

		return res.json({ success: true, labelUrl, data: itlResponse?.data ?? itlResponse });
	} catch (err) {
		const { httpStatus, message } = normaliseError(err);
		return res.status(httpStatus).json({ success: false, message });
	}
}

/**
 * POST /api/shipping/warehouse
 * Admin only. Registers a new pickup warehouse.
 */
export async function addWarehouse(req, res) {
	try {
		const result = await itl.addWarehouse(req.body);
		return res.json({ success: true, data: result?.data ?? result });
	} catch (err) {
		const { httpStatus, message } = normaliseError(err);
		return res.status(httpStatus).json({ success: false, message });
	}
}

/**
 * GET /api/shipping/warehouse
 * Admin only. Lists all registered pickup warehouses.
 */
export async function listWarehouses(req, res) {
	try {
		const result = await itl.getWarehouse();
		return res.json({ success: true, data: result?.data ?? result });
	} catch (err) {
		const { httpStatus, message } = normaliseError(err);
		return res.status(httpStatus).json({ success: false, message });
	}
}
