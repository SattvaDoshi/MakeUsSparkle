import userService from "../services/user.service.js";

export async function getUserProfile(req, res) {
	try {
		const result = await userService.getUserProfile(req.user._id);
		res.json(result);
	} catch (error) {
		console.error("Get user profile error:", error);
		res.status(404).json({ success: false, message: error.message });
	}
}

export async function updateUserProfile(req, res) {
	try {
		const result = await userService.updateUserProfile(req.user._id, req.body);
		res.json(result);
	} catch (error) {
		console.error("Update user profile error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function addToWishlist(req, res) {
	try {
		const { productId } = req.body;
		const result = await userService.addToWishlist(req.user._id, productId);
		res.json(result);
	} catch (error) {
		console.error("Add to wishlist error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function removeFromWishlist(req, res) {
	try {
		const result = await userService.removeFromWishlist(req.user._id, req.params.productId);
		res.json(result);
	} catch (error) {
		console.error("Remove from wishlist error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function getWishlist(req, res) {
	try {
		const result = await userService.getWishlist(req.user._id);
		res.json(result);
	} catch (error) {
		console.error("Get wishlist error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function addAddress(req, res) {
	try {
		const result = await userService.addAddress(req.user._id, req.body);
		res.status(201).json(result);
	} catch (error) {
		console.error("Add address error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function updateAddress(req, res) {
	try {
		const result = await userService.updateAddress(req.user._id, req.params.addressId, req.body);
		res.json(result);
	} catch (error) {
		console.error("Update address error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}

export async function deleteAddress(req, res) {
	try {
		const result = await userService.deleteAddress(req.user._id, req.params.addressId);
		res.json(result);
	} catch (error) {
		console.error("Delete address error:", error);
		res.status(400).json({ success: false, message: error.message });
	}
}