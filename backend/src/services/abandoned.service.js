import AbandonedCart from "../models/abandonedCart.model.js";
import emailService from "./email.service.js";

class AbandonedCartService {
	async createAbandonedCart(cartData) {
		try {
			const abandoned = await AbandonedCart.create(cartData);
			return { success: true, abandoned };
		} catch (error) {
			console.error("Error creating abandoned cart:", error);
			throw error;
		}
	}

	async getAbandonedCarts(filters = {}) {
		try {
			const query = {};
			if (filters.userId) query.user = filters.userId;
			if (filters.status) query.status = filters.status;

			const abandoned = await AbandonedCart.find(query).populate("user").populate("items.product").sort({ createdAt: -1 });
			return { success: true, abandoned };
		} catch (error) {
			console.error("Error fetching abandoned carts:", error);
			throw error;
		}
	}

	async getAbandonedCartById(cartId) {
		try {
			const abandoned = await AbandonedCart.findById(cartId).populate("user").populate("items.product");
			if (!abandoned) {
				throw new Error("Abandoned cart not found");
			}
			return { success: true, abandoned };
		} catch (error) {
			console.error("Error fetching abandoned cart:", error);
			throw error;
		}
	}

	async sendRecoveryEmail(cartId) {
		try {
			const abandoned = await AbandonedCart.findById(cartId).populate("user").populate("items.product");

			if (!abandoned) {
				throw new Error("Abandoned cart not found");
			}

			const frontendUrl = (process.env.NODE_ENV === "production" && (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes("localhost")))
				? "https://makeyousparkle.in"
				: (process.env.FRONTEND_URL || "https://makeyousparkle.in");
			const recoveryLink = `${frontendUrl}/cart-recovery?cartId=${cartId}`;
			const itemsList = abandoned.items.map((item) => `${item.product.name} x ${item.quantity}`).join(", ");

			const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>We miss you, ${abandoned.user.name}!</h2>
          <p>You left some items in your cart:</p>
          <p><strong>${itemsList}</strong></p>
          <p>Total: ₹${abandoned.cartTotal}</p>
          <a href="${recoveryLink}" style="background-color: #FF69B4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
            Complete Your Purchase
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">This offer is valid for 24 hours.</p>
        </div>
      `;

			await emailService.sendCustomEmail(abandoned.user.email, "Don't forget your MakeUsSparkle items!", htmlContent);

			// Update abandoned cart status
			abandoned.status = "recovery_email_sent";
			await abandoned.save();

			return { success: true, message: "Recovery email sent successfully" };
		} catch (error) {
			console.error("Error sending recovery email:", error);
			throw error;
		}
	}

	async markAsRecovered(cartId) {
		try {
			const abandoned = await AbandonedCart.findByIdAndUpdate(cartId, { status: "recovered" }, { returnDocument: "after" });

			if (!abandoned) {
				throw new Error("Abandoned cart not found");
			}

			return { success: true, message: "Cart marked as recovered", abandoned };
		} catch (error) {
			console.error("Error marking cart as recovered:", error);
			throw error;
		}
	}

	async deleteAbandonedCart(cartId) {
		try {
			await AbandonedCart.findByIdAndDelete(cartId);
			return { success: true, message: "Abandoned cart deleted" };
		} catch (error) {
			console.error("Error deleting abandoned cart:", error);
			throw error;
		}
	}
}

export default new AbandonedCartService();
