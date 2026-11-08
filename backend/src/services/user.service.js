import User from "../models/user.model.js";

class UserService {
	async getUserProfile(userId) {
		try {
			const user = await User.findById(userId).select("-password");
			if (!user) {
				throw new Error("User not found");
			}
			return { success: true, user };
		} catch (error) {
			console.error("Error fetching user profile:", error);
			throw error;
		}
	}

	async updateUserProfile(userId, updateData) {
		try {
			// Whitelist: a profile edit can never touch role, rewardPoints, password, email verification, etc.
			const allowed = {};
			for (const key of ["name", "phone", "dob", "gender"]) {
				if (typeof updateData?.[key] === "string") allowed[key] = updateData[key].trim();
			}

			const user = await User.findByIdAndUpdate(userId, { $set: allowed }, { returnDocument: "after", runValidators: true }).select("-password");

			if (!user) {
				throw new Error("User not found");
			}

			return { success: true, user };
		} catch (error) {
			console.error("Error updating user profile:", error);
			throw error;
		}
	}

	async addToWishlist(userId, productId) {
		try {
			const user = await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } }, { returnDocument: "after" });

			if (!user) {
				throw new Error("User not found");
			}

			return { success: true, wishlist: user.wishlist };
		} catch (error) {
			console.error("Error adding to wishlist:", error);
			throw error;
		}
	}

	async removeFromWishlist(userId, productId) {
		try {
			const user = await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } }, { returnDocument: "after" });

			if (!user) {
				throw new Error("User not found");
			}

			return { success: true, wishlist: user.wishlist };
		} catch (error) {
			console.error("Error removing from wishlist:", error);
			throw error;
		}
	}

	async getWishlist(userId) {
		try {
			const user = await User.findById(userId).populate("wishlist");

			if (!user) {
				throw new Error("User not found");
			}

			return { success: true, wishlist: user.wishlist };
		} catch (error) {
			console.error("Error fetching wishlist:", error);
			throw error;
		}
	}

	async addAddress(userId, addressData) {
		try {
			const user = await User.findByIdAndUpdate(userId, { $push: { addresses: addressData } }, { returnDocument: "after" });

			if (!user) {
				throw new Error("User not found");
			}

			return { success: true, addresses: user.addresses };
		} catch (error) {
			console.error("Error adding address:", error);
			throw error;
		}
	}

	async updateAddress(userId, addressId, updateData) {
		try {
			const user = await User.findByIdAndUpdate(userId, { $set: { "addresses.$[addr]": updateData } }, 
				{ arrayFilters: [{ "addr._id": addressId }], returnDocument: "after" }
			);

			if (!user) {
				throw new Error("User not found");
			}

			return { success: true, addresses: user.addresses };
		} catch (error) {
			console.error("Error updating address:", error);
			throw error;
		}
	}

	async deleteAddress(userId, addressId) {
		try {
			const user = await User.findByIdAndUpdate(userId, { $pull: { addresses: { _id: addressId } } }, { returnDocument: "after" });

			if (!user) {
				throw new Error("User not found");
			}

			return { success: true, addresses: user.addresses };
		} catch (error) {
			console.error("Error deleting address:", error);
			throw error;
		}
	}
}

export default new UserService();
