# Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your actual credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

```env
# Database
MONGO_URI=mongodb://localhost:27017/makeusparkle

# JWT
JWT_SECRET=your-very-secure-secret-key-min-32-chars

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-char app password from Google

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay (Payment)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxx

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

### 3. Get Your Credentials

#### Gmail (Email Service)
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password
4. Paste in `EMAIL_PASSWORD`

#### Cloudinary (Image Upload)
1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy `Cloud Name`, `API Key`, and `API Secret`

#### Razorpay (Payments)
1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Copy `Key ID` and `Key Secret`

### 4. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PATCH /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/:id/reviews` - Get reviews
- `POST /api/products/:id/reviews` - Add review

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PATCH /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/cancel` - Cancel order

### Payments
- `POST /api/payments/order` - Create payment order
- `POST /api/payments/verify` - Verify payment

### User Profile
- `GET /api/user/profile` - Get profile
- `PATCH /api/user/profile` - Update profile
- `POST /api/user/addresses` - Add address
- `PATCH /api/user/addresses/:id` - Update address
- `DELETE /api/user/addresses/:id` - Delete address
- `GET /api/user/wishlist` - Get wishlist
- `POST /api/user/wishlist` - Add to wishlist
- `DELETE /api/user/wishlist/:productId` - Remove from wishlist

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create (Admin)
- `GET /api/subcategories` - Get subcategories
- `POST /api/subcategories` - Create (Admin)

### Banners & Combos
- `GET /api/banners` - Get banners
- `POST /api/banners` - Create (Admin, with image)
- `GET /api/combos` - Get combos
- `POST /api/combos/curated` - Create curated (Admin, with image)
- `POST /api/combos/custom` - Create custom (Admin)

### Coupons
- `GET /api/coupons` - Get coupons
- `POST /api/coupons/validate` - Validate coupon
- `POST /api/coupons/apply` - Apply coupon
- `POST /api/coupons` - Create (Admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics/sales` - Sales analytics
- `GET /api/admin/analytics/products` - Product analytics
- `GET /api/admin/analytics/orders` - Order analytics

---

## Services Architecture

The backend uses a **three-layer architecture**:

```
Requests
   ↓
Controllers (src/controllers/) → Handle HTTP, format responses
   ↓
Services (src/services/) → Business logic, integrations
   ↓
Models (src/models/) → Database operations
   ↓
Database (MongoDB)
```

### Services Included
- **Auth Service** - Login, register, password reset, email verification
- **Email Service** - All email communications (nodemailer)
- **Image Service** - Upload/delete from Cloudinary
- **Product Service** - Product CRUD with image handling
- **Cart Service** - Shopping cart operations
- **Order Service** - Order management
- **Payment Service** - Razorpay integration
- **User Service** - Profile, addresses, wishlist
- **Category Service** - Categories & subcategories
- **Banner Service** - Promotional banners with images
- **Coupon Service** - Discount codes
- **Combo Service** - Product bundles
- **Admin Service** - Analytics & dashboard
- **Abandoned Cart Service** - Cart recovery emails

---

## Key Features

✅ **Email Integration (Nodemailer)**
- Welcome email on registration
- Password reset links
- Order confirmations
- Shipment notifications
- Abandoned cart recovery

✅ **Image Upload (Multer + Cloudinary)**
- Automatic image optimization
- Organized folder structure
- Easy deletion
- CDN delivery

✅ **Payment Processing (Razorpay)**
- Secure payment orders
- Signature verification
- Refund handling
- Order confirmation emails

✅ **Error Handling**
- Comprehensive try-catch blocks
- Meaningful error messages
- Proper HTTP status codes

✅ **Validation**
- Input validation in controllers
- Password strength checking
- Email verification
- Coupon expiry validation

---

## Development Tips

### Adding a New Feature

1. **Create Service** (`src/services/feature.service.js`)
   ```javascript
   class FeatureService {
     async getFeatures() { ... }
     async createFeature(data) { ... }
   }
   export default new FeatureService();
   ```

2. **Create Controller** (`src/controllers/feature.controller.js`)
   ```javascript
   import featureService from "../services/feature.service.js";
   
   export async function getFeatures(req, res) {
     try {
       const result = await featureService.getFeatures();
       res.json(result);
     } catch (error) {
       res.status(400).json({ success: false, message: error.message });
     }
   }
   ```

3. **Add Routes** (`src/routes/feature.routes.js`)
   ```javascript
   import { getFeatures } from "../controllers/feature.controller.js";
   router.get("/features", getFeatures);
   ```

4. **Import in App** (`src/app.js`)
   ```javascript
   import featureRoutes from "./routes/feature.routes.js";
   app.use("/api/features", featureRoutes);
   ```

---

## Testing Locally

### Test Email Service
```javascript
import emailService from "./src/services/email.service.js";
await emailService.sendWelcomeEmail("test@example.com", "John", "http://verify-link");
```

### Test Image Upload
```javascript
import imageService from "./src/services/image.service.js";
const result = await imageService.uploadImage(buffer, "products");
console.log(result.url);
```

### Test Payment
```javascript
import { createRazorpayOrder } from "./src/config/payment.config.js";
const order = await createRazorpayOrder(5000);
console.log(order);
```

---

## Troubleshooting

### Email Not Sending
- Verify Gmail app password (not regular password)
- Enable "Less secure app access" if using regular Gmail password
- Check EMAIL_USER and EMAIL_PASSWORD in .env

### Image Upload Failing
- Verify Cloudinary credentials
- Check file size (max 5MB by default)
- Verify file format (JPEG, PNG, WebP only)

### Payment Issues
- Verify Razorpay credentials are correct
- Check that amount is in INR and correct
- Verify signature verification logic

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

---

## Production Deployment

Before deploying:

1. Set `NODE_ENV=production` in .env
2. Use strong `JWT_SECRET` (min 32 characters)
3. Use production email service credentials
4. Set `FRONTEND_URL` to production domain
5. Use production Razorpay credentials
6. Update CORS origins

---

## Further Reading

- See [SERVICES_ARCHITECTURE.md](./SERVICES_ARCHITECTURE.md) for detailed service documentation
- See individual service files for implementation details
- Check controller files for API request/response formats

---

**Happy Coding! 🚀**
