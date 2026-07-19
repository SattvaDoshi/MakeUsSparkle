/**
 * ithinkLogistics.service.js
 *
 * All calls to the iThink Logistics API v3.
 * Every request is a POST with the payload wrapped inside a top-level "data"
 * object containing access_token and secret_key.
 *
 * Switching staging ↔ production is a single env-var change:
 *   ITL_BASE_URL=https://my.ithinklogistics.com/api_v3   (production)
 *   ITL_BASE_URL=https://pre-alpha.ithinklogistics.com/api_v3  (staging / pre-alpha)
 */

import axios from "axios";

// ─── Config ─────────────────────────────────────────────────────────────────

const ITL_BASE_URL = (
	process.env.ITL_BASE_URL || "https://pre-alpha.ithinklogistics.com/api_v3"
).replace(/\/+$/, "");

const ACCESS_TOKEN = process.env.ITL_ACCESS_TOKEN || "";
const SECRET_KEY   = process.env.ITL_SECRET_KEY   || "";

// Dimension / weight fallbacks (used when a product has no dims set)
const DEFAULT_WEIGHT_KG = parseFloat(process.env.ITL_DEFAULT_WEIGHT_KG || "0.5");
const DEFAULT_LENGTH_CM = parseFloat(process.env.ITL_DEFAULT_LENGTH_CM || "10");
const DEFAULT_WIDTH_CM  = parseFloat(process.env.ITL_DEFAULT_WIDTH_CM  || "10");
const DEFAULT_HEIGHT_CM = parseFloat(process.env.ITL_DEFAULT_HEIGHT_CM || "5");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Wraps the given payload in the required { data: { access_token, secret_key, ...payload } }
 * envelope and POSTs to the given endpoint.
 * Throws a normalised { status, message, raw } object on any failure so that
 * raw axios / iThink error shapes never leak to controllers.
 */
async function itlPost(endpoint, payload = {}) {
	const url = `${ITL_BASE_URL}/${endpoint}`;
	const body = {
		data: {
			access_token: ACCESS_TOKEN,
			secret_key:   SECRET_KEY,
			...payload,
		},
	};

	let response;
	try {
		response = await axios.post(url, body, {
			headers: { "Content-Type": "application/json" },
			timeout: 30_000,
		});
	} catch (axiosError) {
		// Network / timeout errors
		const msg = axiosError.response?.data?.data?.message
			|| axiosError.response?.data?.message
			|| axiosError.message
			|| "iThink API network error";
		throw { status: 502, message: msg };
	}

	const data = response.data;

	// If iThink returns an HTML redirect (like a logout page for invalid endpoints)
	if (typeof data === "string" && data.includes("<META")) {
		throw { status: 404, message: "iThink API endpoint not found or unauthorized (HTML redirect received)" };
	}

	// iThink returns HTTP 200 but signals failure via status === "failed" / "error"
	const itlStatus = (data?.data?.status || data?.status || "").toLowerCase();
	if (itlStatus === "failed" || itlStatus === "error") {
		const msg = data?.data?.["1"]?.remark 
			|| data?.data?.message 
			|| data?.message 
			|| data?.html_message 
			|| "iThink API returned an error";
		throw { status: 422, message: msg };
	}

	return data;
}

/**
 * Chunks an array into sub-arrays of at most `size` elements.
 */
function chunk(arr, size) {
	const chunks = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
}

/**
 * Normalises an awbNumbers argument (string, comma-string, or array) to an array.
 */
function toAwbArray(awbNumbers) {
	if (Array.isArray(awbNumbers)) return awbNumbers.map(String).filter(Boolean);
	return String(awbNumbers).split(",").map((s) => s.trim()).filter(Boolean);
}

// ─── Service functions ───────────────────────────────────────────────────────

/**
 * Checks whether a given pincode is serviceable.
 * @param {string} pincode  6-digit Indian postal code
 */
export async function checkPincode(pincode) {
	return itlPost("pincode/check.json", { pincode: String(pincode) });
}

/**
 * Gets a shipping rate estimate between two pincodes.
 */
export async function getRate({
	fromPincode,
	toPincode,
	lengthCm,
	widthCm,
	heightCm,
	weightKg,
	paymentMethod = "prepaid",
	productMrp,
	orderType = "forward",
}) {
	return itlPost("rate/get.json", {
		from_pincode:   String(fromPincode),
		to_pincode:     String(toPincode),
		weight:         String(weightKg  ?? DEFAULT_WEIGHT_KG),
		length:         String(lengthCm  ?? DEFAULT_LENGTH_CM),
		breadth:        String(widthCm   ?? DEFAULT_WIDTH_CM),
		height:         String(heightCm  ?? DEFAULT_HEIGHT_CM),
		payment_method: paymentMethod,
		product_mrp:    String(productMrp || 0),
		order_type:     orderType,
	});
}

/**
 * Creates a shipment in iThink from an internal Order document.
 *
 * @param {object} opts
 * @param {object} opts.order           Mongoose Order document (populated)
 * @param {string} opts.pickupAddressId iThink pickup address ID
 * @param {number} [opts.weightKg]      Override weight
 * @param {number} [opts.lengthCm]      Override length
 * @param {number} [opts.widthCm]       Override width
 * @param {number} [opts.heightCm]      Override height
 */
export async function createOrder({
	order,
	pickupAddressId,
	weightKg,
	lengthCm,
	widthCm,
	heightCm,
}) {
	const addr = order.shippingAddress || order.address || {};
	const phone = addr.phone || "";

	// Determine COD amount
	const isCod = ["COD", "PARTIAL_COD"].includes(order.paymentMode);
	const codAmount = isCod ? (order.balanceAmount ?? order.totalAmount ?? 0) : 0;

	// Resolve per-product dimensions
	let totalWeight = 0;
	let maxLength   = 0;
	let maxWidth    = 0;
	let maxHeight   = 0;

	for (const item of order.items || []) {
		const prod = item.product && typeof item.product === "object" ? item.product : {};
		const qty  = item.quantity || 1;
		totalWeight += (prod.weightKg ?? DEFAULT_WEIGHT_KG) * qty;
		maxLength    = Math.max(maxLength,  prod.lengthCm ?? DEFAULT_LENGTH_CM);
		maxWidth     = Math.max(maxWidth,   prod.widthCm  ?? DEFAULT_WIDTH_CM);
		maxHeight    = Math.max(maxHeight,  prod.heightCm ?? DEFAULT_HEIGHT_CM);
	}

	const finalWeight = (weightKg ?? totalWeight) || DEFAULT_WEIGHT_KG;
	const finalLength = (lengthCm ?? maxLength)   || DEFAULT_LENGTH_CM;
	const finalWidth  = (widthCm  ?? maxWidth)    || DEFAULT_WIDTH_CM;
	const finalHeight = (heightCm ?? maxHeight)   || DEFAULT_HEIGHT_CM;

	const shipment = {
		order:            String(order._id),
		order_date:       order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
		return_address_id: String(pickupAddressId),
		name:             addr.name || (order.user?.name) || "Customer",
		add:              [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ") || "No Address",
		add2:             "",
		city:             addr.city || "",
		state:            addr.state || "",
		pin:              addr.pincode || "",
		country:          "India",
		phone:            String(phone).replace(/\D/g, "").slice(-10),
		alt_phone:        "",
		email:            order.user?.email || "customer@example.com",
		is_billing_same_as_shipping: "yes",
		billing_name:     addr.name || (order.user?.name) || "Customer",
		billing_add:      [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ") || "No Address",
		billing_pin:      addr.pincode || "",
		billing_phone:    String(phone).replace(/\D/g, "").slice(-10),
		total_amount:     String(order.totalAmount || 0),
		cod_amount:       String(codAmount),
		payment_mode:     isCod ? "cod" : "prepaid",
		weight:           String(finalWeight),
		shipment_length:  String(finalLength),
		shipment_width:   String(finalWidth),
		shipment_height:  String(finalHeight),
		collectable_amount: String(codAmount),
		comments:         "",
		seller_tin:       "",
		seller_name:      process.env.ITL_SELLER_NAME || "MakeUsSparkle",
		seller_address:   process.env.ITL_SELLER_ADDRESS || "",
		seller_city:      process.env.ITL_SELLER_CITY || "",
		seller_state:     process.env.ITL_SELLER_STATE || "",
		seller_pincode:   process.env.ITL_SELLER_PINCODE || "",
		seller_phone:     process.env.ITL_SELLER_PHONE || "",
		order_type:       "forward",
		gst_number:       "",
		eway_bill_number: "",
		reseller_name:    "",
		first_attemp_discount: "",
		total_discount:   "",
		shipping_charges: "",
		sub_total:        "",
		sku:              "",
		sub_order:        "",
		transaction_charges: "",
		giftwrap_charges: "",
		products:         (order.items || []).map((i) => ({
			product_name: i.name || "Item",
			product_quantity: String(i.quantity || 1),
			product_price: String(i.price || 0),
			hsn_code: "",
			product_sku: ""
		}))
	};

	return itlPost("order/add.json", {
		pickup_address_id: String(pickupAddressId),
		logistics: "",
		s_type: "",
		shipments: [shipment]
	});
}

/**
 * Tracks up to 10 AWB numbers per call; auto-chunks if more are provided.
 * @param {string|string[]} awbNumbers
 */
export async function trackOrder(awbNumbers) {
	const awbs = toAwbArray(awbNumbers);
	const batches = chunk(awbs, 10);
	const results = await Promise.all(
		batches.map((batch) =>
			itlPost("order/track.json", { awb_numbers: batch.join(",") })
		)
	);

	// Merge all batch results into a single response
	if (results.length === 1) return results[0];
	return { data: results.flatMap((r) => (Array.isArray(r?.data) ? r.data : [r?.data])) };
}

/**
 * Cancels up to 100 AWB numbers per call; auto-chunks if more are provided.
 * @param {string|string[]} awbNumbers
 */
export async function cancelOrder(awbNumbers) {
	const awbs = toAwbArray(awbNumbers);
	const batches = chunk(awbs, 100);
	const results = await Promise.all(
		batches.map((batch) =>
			itlPost("order/cancel.json", { awb_numbers: batch.join(",") })
		)
	);
	if (results.length === 1) return results[0];
	return { data: results.flatMap((r) => (Array.isArray(r?.data) ? r.data : [r?.data])) };
}

/**
 * Returns the PDF label URL for one or more AWB numbers.
 * @param {string|string[]} awbNumbers
 * @param {"A4"|"4x6"|"thermal"} pageSize
 */
export async function printLabel(awbNumbers, pageSize = "A4") {
	const awbs = toAwbArray(awbNumbers);
	return itlPost("order/label.json", {
		awb_numbers:   awbs.join(","),
		page_size: pageSize,
	});
}

/**
 * Registers a new pickup warehouse / address.
 * @param {object} warehousePayload  Fields as required by iThink addWarehouse API
 */
export async function addWarehouse(warehousePayload) {
	return itlPost("warehouse/add.json", warehousePayload);
}

/**
 * Returns all registered warehouses / pickup addresses.
 */
export async function getWarehouse() {
	return itlPost("warehouse/get.json");
}

export default {
	checkPincode,
	getRate,
	createOrder,
	trackOrder,
	cancelOrder,
	printLabel,
	addWarehouse,
	getWarehouse,
	DEFAULT_WEIGHT_KG,
	DEFAULT_LENGTH_CM,
	DEFAULT_WIDTH_CM,
	DEFAULT_HEIGHT_CM,
};
