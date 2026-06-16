import { createEmailTransporter, emailTemplates } from "../config/email.config.js";

class EmailService {
	constructor() {
		this.transporter = null;
	}

	getTransporter() {
		if (!this.transporter) {
			this.transporter = createEmailTransporter();
		}

		return this.transporter;
	}

	async sendWelcomeEmail(userEmail, userName, verificationLink, couponCode, discountValue = 10) {
		try {
			const template = emailTemplates.welcomeEmail(userName, verificationLink, couponCode, discountValue);
			await this.getTransporter().sendMail({
				from: process.env.EMAIL_USER,
				to: userEmail,
				...template,
			});
			console.log(`Welcome email sent to ${userEmail}`);
			return { success: true, message: "Welcome email sent" };
		} catch (error) {
			console.error("Error sending welcome email:", error);
			throw error;
		}
	}

	async sendPasswordResetEmail(userEmail, resetLink) {
		try {
			const template = emailTemplates.resetPasswordEmail(resetLink);
			await this.getTransporter().sendMail({
				from: process.env.EMAIL_USER,
				to: userEmail,
				...template,
			});
			console.log(`Password reset email sent to ${userEmail}`);
			return { success: true, message: "Password reset email sent" };
		} catch (error) {
			console.error("Error sending password reset email:", error);
			throw error;
		}
	}

	async sendPasswordResetOtpEmail(userEmail, otp) {
		try {
			const template = emailTemplates.resetPasswordOtpEmail(otp);
			await this.getTransporter().sendMail({
				from: process.env.EMAIL_USER,
				to: userEmail,
				...template,
			});
			console.log(`Password reset OTP email sent to ${userEmail}`);
			return { success: true, message: "Password reset OTP email sent" };
		} catch (error) {
			console.error("Error sending password reset OTP email:", error);
			throw error;
		}
	}

	async sendOrderConfirmationEmail(userEmail, orderNumber, items, total) {
		try {
			const template = emailTemplates.orderConfirmationEmail(orderNumber, items, total);
			await this.getTransporter().sendMail({
				from: process.env.EMAIL_USER,
				to: userEmail,
				...template,
			});
			console.log(`Order confirmation email sent to ${userEmail}`);
			return { success: true, message: "Order confirmation email sent" };
		} catch (error) {
			console.error("Error sending order confirmation email:", error);
			throw error;
		}
	}

	async sendShipmentNotificationEmail(userEmail, trackingNumber, carrier) {
		try {
			const template = emailTemplates.shipmentNotificationEmail(trackingNumber, carrier);
			await this.getTransporter().sendMail({
				from: process.env.EMAIL_USER,
				to: userEmail,
				...template,
			});
			console.log(`Shipment notification email sent to ${userEmail}`);
			return { success: true, message: "Shipment notification email sent" };
		} catch (error) {
			console.error("Error sending shipment notification email:", error);
			throw error;
		}
	}

	async sendCustomEmail(userEmail, subject, htmlContent) {
		try {
			await this.getTransporter().sendMail({
				from: process.env.EMAIL_USER,
				to: userEmail,
				subject,
				html: htmlContent,
			});
			console.log(`Custom email sent to ${userEmail}`);
			return { success: true, message: "Email sent successfully" };
		} catch (error) {
			console.error("Error sending custom email:", error);
			throw error;
		}
	}
}

export default new EmailService();
