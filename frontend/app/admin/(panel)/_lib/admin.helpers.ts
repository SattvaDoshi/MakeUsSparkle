import type { AdminOrder } from "./admin.types";

export const formatShortId = (value: string) => value.slice(-8).toUpperCase();

export const formatMoney = (amount?: number) => `INR ${Math.round(amount || 0).toLocaleString()}`;

export const formatDateTime = (value?: string) => {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleString();
};

export const formatAddress = (address?: AdminOrder["address"]) => {
	if (!address) return "-";
	const parts = [address.fullAddress, address.city, address.state, address.pincode].filter(Boolean);
	return parts.length ? parts.join(", ") : "-";
};

export const normalizeOrderStatus = (value?: AdminOrder["status"]) => {
	if (value === "confirmed") return "placed";
	return value || "placed";
};

export const normalizePaymentStatus = (value?: AdminOrder["paymentStatus"]) => {
	if (value === "completed") return "paid";
	return value || "pending";
};

export const getOrderItemLabel = (item: NonNullable<AdminOrder["items"]>[number]) => {
	const product = item.product;
	if (product && typeof product !== "string" && product.title) {
		return product.title;
	}
	if (typeof product === "string" && product.length >= 6) {
		return `Product ${formatShortId(product)}`;
	}
	const charmCount = item.selectedCharms?.length || 0;
	if (charmCount > 0) {
		return `Custom Charm Jewellery (${charmCount} charm${charmCount === 1 ? "" : "s"})`;
	}
	if (item.customNote) {
		return "Custom Item";
	}
	return "Custom Item";
};