# Quick Reference Card 🚀

## Install & Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Fill in credentials, then start
npm run dev
```

---

## API Endpoints Quick List

### Auth
```
POST   /api/auth/register              → Register user
POST   /api/auth/login                 → Login user
GET    /api/auth/me                    → Get current user
POST   /api/auth/forgot-password       → Request reset
POST   /api/auth/reset-password        → Reset password
POST   /api/auth/verify-email          → Verify email
```

### Products
```
GET    /api/products                   → Get all (with filters)
GET    /api/products/:id               → Get single
POST   /api/products                   → Create (with image)
PATCH  /api/products/:id               → Update (with image)
DELETE /api/products/:id               → Delete
GET    /api/products/:id/reviews       → Get reviews
POST   /api/products/:id/reviews       → Add review
```

### Cart
```
GET    /api/cart                       → Get cart
POST   /api/cart                       → Add to cart
PATCH  /api/cart/:productId            → Update qty
DELETE /api/cart/:productId            → Remove item
DELETE /api/cart                       → Clear cart
```

### Orders
```
GET    /api/orders                     → Get my orders
GET    /api/orders/:id                 → Get order details
POST   /api/orders                     → Create order
PATCH  /api/orders/:id/cancel          → Cancel order
```

### Payments
```
POST   /api/payments/order             → Create order
POST   /api/payments/verify            → Verify payment
GET    /api/payments/order/:id         → Check status
```

### User
```
GET    /api/user/profile               → Get profile
PATCH  /api/user/profile               → Update profile
POST   /api/user/addresses             → Add address
PATCH  /api/user/addresses/:id         → Update address
DELETE /api/user/addresses/:id         → Delete address
GET    /api/user/wishlist              → Get wishlist
POST   /api/user/wishlist              → Add to wishlist
DELETE /api/user/wishlist/:productId   → Remove from wishlist
```

### Categories
```
GET    /api/categories                 → Get categories
POST   /api/categories                 → Create (Admin)
GET    /api/subcategories              → Get subcategories
POST   /api/subcategories              → Create (Admin)
```

### Banners
```
GET    /api/banners                    → Get banners
POST   /api/banners                    → Create (Admin, with image)
PATCH  /api/banners/:id                → Update (with image)
DELETE /api/banners/:id                → Delete
```

### Combos
```
GET    /api/combos                     → Get combos
GET    /api/combos/:id                 → Get combo
POST   /api/combos/curated             → Create curated (Admin, with image)
POST   /api/combos/custom              → Create custom (Admin)
PATCH  /api/combos/:id                 → Update
DELETE /api/combos/:id                 → Delete
```

### Coupons
```
GET    /api/coupons                    → Get coupons
POST   /api/coupons/validate           → Validate
POST   /api/coupons/apply              → Apply to cart
POST   /api/coupons                    → Create (Admin)
PATCH  /api/coupons/:id                → Update
DELETE /api/coupons/:id                → Delete
```

### Admin
```
GET    /api/admin/dashboard            → Dashboard stats
GET    /api/admin/users                → Get users (paginated)
DELETE /api/admin/users/:id            → Delete user
GET    /api/admin/analytics/sales      → Sales analytics
GET    /api/admin/analytics/products   → Product analytics
GET    /api/admin/analytics/orders     → Order analytics
```

---

## Service Usage Pattern

```javascript
import serviceService from "../services/service.service.js";

export async function controllerFunction(req, res) {
  try {
    // Call service
    const result = await serviceService.method(data);
    
    // Send response
    res.json(result);
  } catch (error) {
    // Handle error
    res.status(400).json({ success: false, message: error.message });
  }
}
```

---

## Request/Response Examples

### Register
```javascript
// Request
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePass123"
}

// Response
{
  "success": true,
  "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
  "token": "eyJhbGc..."
}

// Email sent: Welcome + Verification Link
```

### Create Product with Image
```javascript
// Request
POST /api/products
Content-Type: multipart/form-data
{
  "image": [File],
  "title": "Diamond Ring",
  "price": 999,
  "category": "rings"
}

// Response
{
  "success": true,
  "product": {
    "_id": "...",
    "title": "Diamond Ring",
    "price": 999,
    "image": "https://cloudinary.com/...",
    "imagePublicId": "makeusparkle/products/..."
  }
}
```

### Create Payment Order
```javascript
// Request
POST /api/payments/order
Authorization: Bearer token
{
  "amount": 5000,
  "items": [...]
}

// Response
{
  "success": true,
  "orderId": "...",
  "razorpayOrderId": "...",
  "amount": 5000,
  "currency": "INR"
}

// Frontend: Use razorpayOrderId with Razorpay Checkout
```

### Verify Payment
```javascript
// Request
POST /api/payments/verify
{
  "orderId": "...",
  "paymentId": "pay_...",
  "signature": "...",
  "razorpayOrderId": "order_..."
}

// Response
{
  "success": true,
  "message": "Payment verified successfully",
  "order": { ... }
}

// Email sent: Order Confirmation
```

---

## Environment Variables

```env
# Copy from .env.example and fill these:
MONGO_URI=                          # MongoDB connection
JWT_SECRET=                         # Min 32 characters
EMAIL_USER=                         # Gmail
EMAIL_PASSWORD=                     # 16-char app password
CLOUDINARY_CLOUD_NAME=              # From Cloudinary
CLOUDINARY_API_KEY=                 # From Cloudinary
CLOUDINARY_API_SECRET=              # From Cloudinary
RAZORPAY_KEY_ID=                    # From Razorpay
RAZORPAY_KEY_SECRET=                # From Razorpay
FRONTEND_URL=                       # Your frontend URL
PORT=5000                           # Server port
NODE_ENV=development                # Set to production later
```

---

## File Upload Middleware

```javascript
// Single image upload
import { uploadSingleImage } from "../middleware/upload.middleware.js";
router.post("/products", uploadSingleImage, productController.createProduct);

// Multiple images (future)
import { uploadMultipleImages } from "../middleware/upload.middleware.js";
router.post("/gallery", uploadMultipleImages, galleryController.create);

// In controller, access via:
const imageBuffer = req.file.buffer;
```

---

## Email Automation

Emails sent automatically by:

| Trigger | Service | Email | 
|---------|---------|-------|
| Register | authService.register() | Welcome + Verification |
| Forgot Password | authService.requestPasswordReset() | Reset Link |
| Payment Success | paymentService.verifyPayment() | Order Confirmation |
| Shipment | orderService.sendShipmentNotification() | Tracking Info |
| Abandoned Cart | abandonedService.sendRecoveryEmail() | Recovery Link |

---

## Common Error Handling

```javascript
// Input validation error
{ success: false, message: "Invalid email format" }

// Authentication error
{ success: false, message: "Invalid credentials" }

// Not found error
{ success: false, message: "Product not found" }

// Server error
{ success: false, message: "Server error" }
```

---

## Service Methods Cheatsheet

```javascript
// Auth
authService.register(userData)
authService.login(email, password)
authService.requestPasswordReset(email)
authService.resetPassword(token, newPassword)

// Email
emailService.sendWelcomeEmail(email, name, link)
emailService.sendPasswordResetEmail(email, link)
emailService.sendOrderConfirmationEmail(email, orderNo, items, total)

// Image
imageService.uploadImage(buffer, folder)
imageService.deleteImage(publicId)

// Product
productService.getProducts(filters)
productService.getProductById(id)
productService.createProduct(data, imageBuffer)
productService.updateProduct(id, data, imageBuffer)
productService.deleteProduct(id)

// Cart
cartService.getCart(userId)
cartService.addToCart(userId, productId, qty)
cartService.removeFromCart(userId, productId)
cartService.updateCartItem(userId, productId, qty)

// Order
orderService.getOrders(userId)
orderService.createOrder(userId, data)
orderService.cancelOrder(orderId, userId)
orderService.sendShipmentNotification(orderId, tracking, carrier)

// Payment
paymentService.createPaymentOrder(userId, data)
paymentService.verifyPayment(data)

// User
userService.getUserProfile(userId)
userService.updateUserProfile(userId, data)
userService.addToWishlist(userId, productId)
userService.addAddress(userId, addressData)

// Coupon
couponService.validateCoupon(code)
couponService.applyCoupon(code, cartTotal)
```

---

## Testing with Postman

1. **Register**
   - Method: POST
   - URL: http://localhost:5000/api/auth/register
   - Body (JSON): { name, email, password }
   - Check email for verification link

2. **Login**
   - Method: POST
   - URL: http://localhost:5000/api/auth/login
   - Body (JSON): { email, password }
   - Copy token from response

3. **Create Product (with image)**
   - Method: POST
   - URL: http://localhost:5000/api/products
   - Headers: Add Authorization: Bearer {token}
   - Body: form-data
     - image: (select file)
     - title: Diamond Ring
     - price: 999

4. **Get Cart**
   - Method: GET
   - URL: http://localhost:5000/api/cart
   - Headers: Add Authorization: Bearer {token}

---

## Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Update FRONTEND_URL to production domain
- [ ] Use production email credentials
- [ ] Use production Razorpay credentials
- [ ] Update CORS origins in app.js
- [ ] Enable HTTPS
- [ ] Setup database backups
- [ ] Configure environment variables securely
- [ ] Run npm install with --production flag

---

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Install new package
npm install package-name

# Install dev package
npm install --save-dev package-name

# Check node version
node --version

# Check npm version
npm --version
```

---

## Debug Tips

1. **Check logs** - npm run dev shows all errors
2. **Use Thunder Client** - Better than Postman for testing
3. **Check .env** - Most errors are due to missing env vars
4. **Browser DevTools** - For frontend API calls
5. **Email test** - Check spam folder for emails
6. **Image upload** - Check Cloudinary dashboard

---

## Quick Paths

- Services: `src/services/`
- Controllers: `src/controllers/`
- Config: `src/config/`
- Middleware: `src/middleware/`
- Models: `src/models/`
- Routes: `src/routes/`

---

**Save this for quick reference!** 📌
