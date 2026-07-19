/**
 * ithinkStatusMap.service.js
 *
 * Maps iThink Logistics raw status codes and status strings to the
 * internal Order.status enum values and a human-readable label.
 *
 * iThink codes (non-exhaustive, covers the most common):
 *   UD  – Out For Delivery
 *   DL  – Delivered
 *   CN  – Cancelled by Shipper / iThink
 *   RT  – RTO Initiated / RTO In Transit / RTO Delivered
 *   MF  – Manifested (label created, not yet picked up)
 *   PU  – Picked Up
 *   IT  – In Transit
 *   OP  – Out For Pickup
 *   NDR – Non-Delivery Report (attempted, failed)
 */

/**
 * Internal Order.status enum values (for reference):
 *   "placed" | "manifested" | "shipped" | "delivered" | "cancelled" | "rto"
 */

const CODE_MAP = {
	// ─── Delivery stages ────────────────────────────────────────────────────
	MF:  { internalStatus: "manifested", label: "Manifested"       },
	OP:  { internalStatus: "manifested", label: "Out For Pickup"    },
	PU:  { internalStatus: "shipped",   label: "Picked Up"         },
	IT:  { internalStatus: "shipped",   label: "In Transit"        },
	UD:  { internalStatus: "shipped",   label: "Out For Delivery"  },
	NDR: { internalStatus: "shipped",   label: "Delivery Attempted"},
	DL:  { internalStatus: "delivered", label: "Delivered"         },

	// ─── Cancellation / Return ───────────────────────────────────────────────
	CN:  { internalStatus: "cancelled", label: "Cancelled"          },
	RT:  { internalStatus: "rto",       label: "RTO In Transit"     },
	RD:  { internalStatus: "rto",       label: "RTO Delivered"      },

	// ─── Exception / Hold ────────────────────────────────────────────────────
	EX:  { internalStatus: "shipped",   label: "Exception / Hold"  },
	OA:  { internalStatus: "shipped",   label: "Out For Pickup"    },
};

/**
 * Fallback matching by status string keywords when the code is unknown.
 */
const STRING_MAP = [
	{ keywords: ["deliver"],           internalStatus: "delivered", label: "Delivered"       },
	{ keywords: ["out for delivery"],  internalStatus: "shipped",   label: "Out For Delivery"},
	{ keywords: ["picked", "pickup"],  internalStatus: "shipped",   label: "Picked Up"       },
	{ keywords: ["transit", "transit"],internalStatus: "shipped",   label: "In Transit"      },
	{ keywords: ["manifest"],          internalStatus: "manifested",label: "Manifested"      },
	{ keywords: ["cancel"],            internalStatus: "cancelled", label: "Cancelled"       },
	{ keywords: ["rto"],               internalStatus: "rto",       label: "RTO"             },
];

/**
 * Resolves an iThink status code and/or status string to an internal status.
 *
 * @param {string} [statusCode]   e.g. "UD", "DL", "CN"
 * @param {string} [statusString] e.g. "Out For Delivery", "RTO Delivered"
 * @returns {{ internalStatus: string, label: string }}
 */
export function resolveStatus(statusCode = "", statusString = "") {
	// 1. Try by code (upper-cased, trimmed)
	const code = String(statusCode).trim().toUpperCase();
	if (code && CODE_MAP[code]) {
		return CODE_MAP[code];
	}

	// 2. Try by string keyword matching
	const lower = String(statusString).toLowerCase();
	for (const rule of STRING_MAP) {
		if (rule.keywords.some((kw) => lower.includes(kw))) {
			return { internalStatus: rule.internalStatus, label: rule.label };
		}
	}

	// 3. Default: treat as still in transit if we have any status
	if (lower || code) {
		return { internalStatus: "shipped", label: statusString || statusCode || "In Transit" };
	}

	// 4. No info at all
	return { internalStatus: "placed", label: "Pending" };
}

/**
 * Maps the 5-step timeline step from an internal status.
 * Used by the frontend ShipmentTimeline component.
 *
 * Steps: 0=Manifested, 1=Picked Up, 2=In Transit, 3=Out For Delivery, 4=Delivered
 */
export function timelineStep(internalStatus) {
	const steps = {
		placed:     -1,
		manifested:  0,
		shipped:     2,
		delivered:   4,
		cancelled:  -1,
		rto:        -1,
	};
	return steps[internalStatus] ?? -1;
}

export default { resolveStatus, timelineStep };
