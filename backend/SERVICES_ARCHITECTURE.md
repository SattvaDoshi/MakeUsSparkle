# MakeUsSparkle Backend - Services Architecture

## Overview
The backend is structured with a clean services layer architecture that separates concerns and makes the codebase maintainable and scalable. This document outlines the structure and how to use the services.

## Architecture Layers

### 1. **Controllers** (`/src/controllers`)
- Handle HTTP requests and responses
- Validate request data
- Call appropriate service methods
- Format and return responses

### 2. **Services** (`/src/services`)
- Contain business logic
- Perform data operations
- Handle integrations (Email, Payment, Image Upload)
- Independent and reusable

### 3. **Models** (`/src/models`)
- Define MongoDB schemas
- Handle database validations

### 4. **Routes** (`/src/routes`)
- Define API endpoints
- Map to controllers

### 5. **Config** (`/src/config`)
- Configuration files for external services
- Email, Cloudinary, Razorpay setup

### 6. **Middleware** (`/src/middleware`)
- Authentication, file upload, rate limiting
- Request/response interceptors

---

## Services Overview

### 1. **Auth Service** (`auth.service.js`)
Handles user authentication and email verification.

**Methods:**
- `register(userData)` - Register new user with email verification
- `login(email, password)` - User login
- `logout()` - Logout (stateless)
- `requestPasswordReset(email)` - Request password reset link
- `resetPassword(token, newPassword)` - Reset password
- `verifyEmail(token)` - Verify email address

**Features:**
- Password hashing with bcryptjs
- JWT token generation
- Email notifications with nodemailer

### 2. **Product Service** (`product.service.js`)
Manages product catalog and reviews.

**Methods:**
- `getProducts(queryParams)` - Get products with filtering/sorting
- `getProductById(productId)` - Get single product
- `searchProducts(searchQuery)` - Search products by title
- `filterProducts(filterParams)` - Advanced filtering
- `createProduct(productData, imageBuffer)` - Create with image upload
- `updateProduct(productId, updateData, newImageBuffer)` - Update product
- `deleteProduct(productId)` - Delete product
- `addProductReview(productId, userId, reviewData)` - Add review
- `getProductReviews(productId)` - Get product reviews

**Features:**
- Cloudinary image upload/delete
- Dynamic filtering by category, style, gender, price
- Product reviews system

### 3. **Image Service** (`image.service.js`)
Handles all image uploads to Cloudinary.

**Methods:**
- `uploadImage(fileBuffer, folder)` - Upload single image
- `uploadMultipleImages(fileBuffers, folder)` - Upload multiple images
- `deleteImage(publicId)` - Delete image from Cloudinary
- `deleteMultipleImages(publicIds)` - Delete multiple images

**Features:**
- Automatic image optimization
- Organized folder structure in Cloudinary
- Error handling and logging

### 4. **Email Service** (`email.service.js`)
Handles all email communications.

**Methods:**
- `sendWelcomeEmail(userEmail, userName, verificationLink)`
- `sendPasswordResetEmail(userEmail, resetLink)`
- `sendOrderConfirmationEmail(userEmail, orderNumber, items, total)`
- `sendShipmentNotificationEmail(userEmail, trackingNumber, carrier)`
- `sendCustomEmail(userEmail, subject, htmlContent)`

**Features:**
- Beautiful HTML email templates
- Nodemailer integration
- Gmail/SMTP support

### 5. **Payment Service** (`payment.service.js`)
Manages payment processing and orders.

**Methods:**
- `createPaymentOrder(userId, orderData)` - Create Razorpay order
- `verifyPayment(paymentData)` - Verify payment signature
- `getOrderStatus(orderId)` - Check order status
- `refundPayment(orderId, reason)` - Process refund

**Features:**
- Razorpay integration
- Payment signature verification
- Automatic order confirmation email

### 6. **Cart Service** (`cart.service.js`)
Manages shopping cart operations.

**Methods:**
- `getCart(userId)` - Get user's cart
- `addToCart(userId, productId, quantity)` - Add item to cart
- `removeFromCart(userId, productId)` - Remove item from cart
- `updateCartItem(userId, productId, quantity)` - Update quantity
- `clearCart(userId)` - Clear entire cart

**Features:**
- Automatic cart creation
- Duplicate item handling
- Cart population with product details

### 7. **Order Service** (`order.service.js`)
Handles order management.

**Methods:**
- `getOrders(userId)` - Get user's orders
- `getOrderById(orderId, userId)` - Get single order
- `createOrder(userId, orderData)` - Create new order
- `updateOrder(orderId, updateData, userId)` - Update order
- `cancelOrder(orderId, userId)` - Cancel order
- `updateOrderStatus(orderId, status)` - Admin: Update status
- `sendShipmentNotification(orderId, trackingNumber, carrier)` - Admin: Send shipment email

**Features:**
- Order tracking
- Status management
- Shipment notifications

### 8. **User Service** (`user.service.js`)
Manages user profiles and preferences.

**Methods:**
- `getUserProfile(userId)` - Get user details
- `updateUserProfile(userId, updateData)` - Update profile
- `addToWishlist(userId, productId)` - Add to wishlist
- `removeFromWishlist(userId, productId)` - Remove from wishlist
- `getWishlist(userId)` - Get wishlist items
- `addAddress(userId, addressData)` - Add shipping address
- `updateAddress(userId, addressId, updateData)` - Update address
- `deleteAddress(userId, addressId)` - Delete address

**Features:**
- Multiple address management
- Wishlist functionality
- Profile management

### 9. **Category Service** (`category.service.js`)
Manages product categories and subcategories.

**Methods:**
- `getCategories()` - Get all categories
- `getCategoryById(categoryId)` - Get single category
- `createCategory(categoryData)` - Create category
- `updateCategory(categoryId, updateData)` - Update category
- `deleteCategory(categoryId)` - Delete category
- `getSubCategories(categoryId)` - Get subcategories
- `createSubCategory(subCategoryData)` - Create subcategory
- `updateSubCategory(subCategoryId, updateData)` - Update subcategory
- `deleteSubCategory(subCategoryId)` - Delete subcategory

### 10. **Banner Service** (`banner.service.js`)
Manages promotional banners.

**Methods:**
- `getBanners()` - Get all banners
- `createBanner(bannerData, imageBuffer)` - Create with image
- `updateBanner(bannerId, updateData, newImageBuffer)` - Update banner
- `deleteBanner(bannerId)` - Delete banner

**Features:**
- Image upload to Cloudinary
- Automatic image deletion

### 11. **Coupon Service** (`coupon.service.js`)
Manages discount coupons.

**Methods:**
- `getCoupons()` - Get all coupons
- `validateCoupon(couponCode)` - Validate coupon
- `createCoupon(couponData)` - Create coupon
- `updateCoupon(couponId, updateData)` - Update coupon
- `deleteCoupon(couponId)` - Delete coupon
- `applyCoupon(couponCode, cartTotal)` - Calculate discount

**Features:**
- Percentage and fixed discounts
- Expiry date validation
- Max discount limits

### 12. **Combo Service** (`combo.service.js`)
Manages product bundles/combos.

**Methods:**
- `getCombos(type)` - Get combos (curated/custom)
- `getComboById(comboId)` - Get single combo
- `createCuratedCombo(comboData, imageBuffer)` - Create curated combo
- `createCustomCombo(comboData)` - Create custom combo
- `updateCombo(comboId, updateData, newImageBuffer)` - Update combo
- `deleteCombo(comboId)` - Delete combo

**Features:**
- Two types of combos: curated and custom
- Image management for curated combos

### 13. **Abandoned Cart Service** (`abandoned.service.js`)
Manages abandoned cart recovery.

**Methods:**
- `createAbandonedCart(cartData)` - Log abandoned cart
- `getAbandonedCarts(filters)` - Get abandoned carts
- `getAbandonedCartById(cartId)` - Get single cart
- `sendRecoveryEmail(cartId)` - Send recovery email
- `markAsRecovered(cartId)` - Mark cart as recovered
- `deleteAbandonedCart(cartId)` - Delete abandoned cart

**Features:**
- Cart recovery email campaigns
- Status tracking

### 14. **Admin Service** (`admin.service.js`)
Analytics and dashboard data for admins.

**Methods:**
- `getDashboardStats()` - Get key metrics
- `getUsers(page, limit)` - Get paginated users
- `deleteUser(userId)` - Delete user
- `getSalesAnalytics(startDate, endDate)` - Sales data
- `getProductAnalytics()` - Product performance
- `getOrderAnalytics(status)` - Order statistics

---

## Configuration Files

### Email Config (`config/email.config.js`)
```javascript
import emailService from "../services/email.service.js";
await emailService.sendWelcomeEmail(email, name, link);
```

### Upload Config (`config/upload.config.js`)
```javascript
import { uploadToCloudinary } from "../config/upload.config.js";
const result = await uploadToCloudinary(fileBuffer, "products");
```

### Payment Config (`config/payment.config.js`)
```javascript
import { createRazorpayOrder, verifyRazorpaySignature } from "../config/payment.config.js";
```

---

## Environment Variables Required

```env
# Database
MONGO_URI=mongodb://localhost:27017/makeusparkle

# JWT
JWT_SECRET=your-secret-key

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Razorpay
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

---

## Usage Examples

### Using Auth Service
```javascript
import authService from "../services/auth.service.js";

const result = await authService.register({
  name: "John Doe",
  email: "john@example.com",
  password: "password123"
});
```

### Using Product Service with Image Upload
```javascript
import productService from "../services/product.service.js";

const result = await productService.createProduct(
  {
    title: "Diamond Ring",
    price: 999,
    category: "rings"
  },
  imageBuffer // from multer
);
```

### Using Payment Service
```javascript
import paymentService from "../services/payment.service.js";

const order = await paymentService.createPaymentOrder(userId, {
  amount: 5000,
  items: [...cart.items]
});

// After payment
const verified = await paymentService.verifyPayment({
  orderId: order._id,
  paymentId: razorpayPaymentId,
  signature: signature,
  razorpayOrderId: razorpayOrderId
});
```

### Using Email Service
```javascript
import emailService from "../services/email.service.js";

await emailService.sendOrderConfirmationEmail(
  "customer@email.com",
  "ORD-12345",
  [{ name: "Ring", quantity: 1, price: 999 }],
  999
);
```

---

## Middleware Usage

### Upload Single Image
```javascript
import { uploadSingleImage } from "../middleware/upload.middleware.js";

router.post("/products", uploadSingleImage, productController.createProduct);
```

### Upload Multiple Images
```javascript
import { uploadMultipleImages } from "../middleware/upload.middleware.js";

router.post("/banners", uploadMultipleImages, bannerController.createBanner);
```

---

## Best Practices

1. **Error Handling**: All services throw errors that controllers catch and format
2. **Logging**: Services log important operations and errors
3. **Validation**: Controllers validate input before calling services
4. **Single Responsibility**: Each service handles one domain
5. **Reusability**: Services can be used in multiple controllers
6. **Testing**: Services are easy to unit test (isolated business logic)
7. **Configuration**: All external service configs in `/config` folder

---

## Dependencies

```json
{
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "nodemailer": "Email sending",
  "multer": "File upload middleware",
  "cloudinary": "Cloud storage for images",
  "razorpay": "Payment gateway",
  "mongoose": "MongoDB ODM",
  "express": "Web framework"
}
```

---

## File Structure Summary

```
backend/
├── src/
│   ├── config/
│   │   ├── email.config.js
│   │   ├── upload.config.js
│   │   └── payment.config.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   └── ... (12 more controllers)
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── email.service.js
│   │   ├── image.service.js
│   │   ├── payment.service.js
│   │   ├── cart.service.js
│   │   └── ... (8 more services)
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── models/
│   ├── routes/
│   └── app.js
├── .env.example
├── package.json
└── index.js
```

---

## Next Steps

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in your credentials
3. Start the server: `npm run dev`
4. Import API routes in your Express app
5. Use services in controllers as shown in examples

---

**Created with ❤️ for MakeUsSparkle**
