import nodemailer from "nodemailer";

// Create transporter for sending emails
export const createEmailTransporter = () => {
	return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT || 465),
    secure: String(process.env.EMAIL_SECURE || "true") === "true",
		auth: {
      user: (process.env.EMAIL_USER || "").trim(),
      pass: (process.env.EMAIL_PASSWORD || "").replace(/\s+/g, "").trim(),
		},
	});
};

// Email templates
export const emailTemplates = {
	welcomeEmail: (userName, verificationLink, couponCode, discountValue = 10) => ({
		subject: "Welcome to MakeUsSparkle! Your 10% coupon is here",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to MakeUsSparkle, ${userName}!</h2>
        <p>Thank you for joining us. Your welcome offer has been created and is valid for a single use on your first order.</p>
        <div style="margin: 24px 0; padding: 18px; border: 1px solid #eee; border-radius: 12px; background: #faf7ef; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #6b6b55;">Your 1st order coupon</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.08em; color: #2f3a25;">${couponCode}</p>
          <p style="margin: 8px 0 0; color: #4f5a44;">${discountValue}% off your first order</p>
        </div>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" style="background-color: #FF69B4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
        <p style="color: #999; font-size: 12px;">Coupon is for one-time use only and may expire soon, so please use it on your first order.</p>
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

	resetPasswordOtpEmail: (otp) => ({
		subject: "Reset Your MakeUsSparkle Password",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Here is your One-Time Password (OTP):</p>
        <div style="margin: 24px 0; padding: 18px; border: 1px solid #eee; border-radius: 12px; background: #faf7ef; text-align: center;">
          <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 0.2em; color: #2f3a25;">${otp}</p>
        </div>
        <p style="color: #999; font-size: 12px;">This OTP will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
	}),

	orderConfirmationEmail: (orderNumber, items, total) => {
		const shortId = orderNumber.toString().slice(-8).toUpperCase();
		return {
		subject: `Order Confirmation #${shortId}`,
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf7ef; padding: 30px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2f3a25; font-size: 28px; margin-bottom: 10px;">Order Confirmed! 🎉</h2>
          <p style="color: #4f5a44; font-size: 16px;">Thank you for your purchase! We're getting your order ready to be shipped.</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #fff; border-radius: 6px; border: 1px dashed #d9d0bd;">
            <p style="margin: 0; color: #6b6b55; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #2f3a25;">#${shortId}</p>
          </div>
        </div>

        <h3 style="color: #2f3a25; border-bottom: 2px solid #e1dbcb; padding-bottom: 10px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          ${items.map((item) => {
			const itemName = item.product?.title || "Custom Charm Jewellery";
            return `
            <tr>
              <td style="padding: 15px 0; border-bottom: 1px solid #e1dbcb; color: #4f5a44;">
                <strong>${itemName}</strong><br />
                <span style="font-size: 13px; color: #888;">Qty: ${item.quantity}</span>
              </td>
              <td style="padding: 15px 0; border-bottom: 1px solid #e1dbcb; text-align: right; color: #2f3a25; font-weight: bold;">
                ₹${item.price}
              </td>
            </tr>
          `}).join("")}
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <h3 style="color: #2f3a25; font-size: 20px;">Total: ₹${total}</h3>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 13px; color: #8b8b7a;">
          <p>We'll send you an email with tracking information as soon as your order ships.</p>
          <p>Make Us Sparkle Team</p>
        </div>
      </div>
    `,
	}},

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
