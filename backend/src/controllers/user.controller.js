import User from "../models/user.model.js";
import mongoose from "mongoose";

export async function getProfile(req, res) {
	const user = await User.findById(req.user.id);
	res.json({ success: true, user });
}

export async function updateProfile(req, res) {
	const update = { ...req.body };
	if (update.password) {
		return res.status(400).json({ success: false, message: "Use auth reset flow to change password" });
	}
	const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });
	res.json({ success: true, user });
}

export async function deleteAccount(req, res) {
	await User.findByIdAndDelete(req.user.id);
	res.json({ success: true, message: "Account deleted" });
}

export async function addAddress(req, res) {
	const user = await User.findById(req.user.id);
	user.addresses.push(req.body);
	await user.save();
	res.status(201).json({ success: true, addresses: user.addresses });
}

export async function updateAddress(req, res) {
	const user = await User.findById(req.user.id);
	const address = user.addresses.id(new mongoose.Types.ObjectId(req.params.id));
	if (!address) {
		return res.status(404).json({ success: false, message: "Address not found" });
	}
	Object.assign(address, req.body);
	await user.save();
	res.json({ success: true, addresses: user.addresses });
}

export async function deleteAddress(req, res) {
	const user = await User.findById(req.user.id);
	user.addresses.pull(req.params.id);
	await user.save();
	res.json({ success: true, addresses: user.addresses });
}

export async function getWishlist(req, res) {
	const user = await User.findById(req.user.id).populate("wishlist");
	res.json({ success: true, wishlist: user.wishlist });
}

export async function addWishlistItem(req, res) {
	const user = await User.findById(req.user.id);
	if (!user.wishlist.some((item) => String(item) === req.params.productId)) {
		user.wishlist.push(req.params.productId);
		await user.save();
	}
	res.json({ success: true, wishlist: user.wishlist });
}

export async function deleteWishlistItem(req, res) {
	const user = await User.findById(req.user.id);
	user.wishlist = user.wishlist.filter((item) => String(item) !== req.params.productId);
	await user.save();
	res.json({ success: true, wishlist: user.wishlist });
}