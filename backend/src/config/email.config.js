import nodemailer from "nodemailer";

// Create transporter for sending emails
export const createEmailTransporter = () => {
	return nodemailer.createTransport({
		service: process.env.EMAIL_SERVICE || "gmail",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
};

// Email templates
export const emailTemplates = {
	welcomeEmail: (userName, verificationLink) => ({
		subject: "Welcome to MakeUsSparkle! Verify Your Email",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to MakeUsSparkle, ${userName}!</h2>
        <p>Thank you for joining us. Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" style="background-color: #FF69B4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
      </div>
    `,
	}),

	resetPasswordEmail: (resetLink) => ({
		subject: "Reset Your MakeUsSparkle Password",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}" style="background-color: #FF69B4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
	}),

	orderConfirmationEmail: (orderNumber, items, total) => ({
		subject: `Order Confirmation #${orderNumber}`,
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase. Your order number is: <strong>#${orderNumber}</strong></p>
        <h3>Order Items:</h3>
        <ul>
          ${items.map((item) => `<li>${item.name} x ${item.quantity} - ₹${item.price}</li>`).join("")}
        </ul>
        <h3>Total: ₹${total}</h3>
        <p style="color: #999; font-size: 12px;">We'll send you tracking information soon!</p>
      </div>
    `,
	}),

	shipmentNotificationEmail: (trackingNumber, carrier) => ({
		subject: "Your Order Has Shipped!",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Order is On Its Way!</h2>
        <p>Your shipment has been dispatched.</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p><strong>Carrier:</strong> ${carrier}</p>
      </div>
    `,
	}),
};
