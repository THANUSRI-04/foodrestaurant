# 🌲 Food in Forest - Eco-Resort & Bistro Web Application

> *"Fresh food. Wild surroundings. Unforgettable taste."*

**Food in Forest** is a production-style, responsive, and complete restaurant & eco-resort food ordering platform. Built specifically to be sold and deployed for hotels, eco-resorts, and specialty restaurants that want to showcase wild cuisines, take customer orders with real-time tracking, and manage full culinary operations from an administrative portal.

---

## 🌟 Key Highlights & Features

### 🍃 Guest / Customer Experience
- **Eco-Luxury Landing Page**: Hero banner, story showcase, category explorer, chef signature specials, customer reflections, and contact details.
- **Dynamic Menu Catalog**: Real-time client-side search (by name, ingredients, style), category filter pills, vegetarian/non-vegetarian toggles, price range filters, availability filter, and multi-option sorting.
- **Detailed Dish Views**: High-resolution photography, wild ingredient chips, spice heat ratings, preparation time, and category pairing recommendations.
- **Interactive Shopping Cart**: Live quantity updates (+/−), instant price calculations in Indian Rupees (₹ INR), delivery charge logic (Free on orders > ₹500), and promo code voucher system.
- **Checkout & Realtime Order Tracking**: Seamless checkout with custom preparation notes, Cash on Delivery support, and multi-step live visual order tracker (*Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered*).
- **Guest Authentication & Profiles**: Firebase Auth email/password, persistent session state, order history with live status updates, and editable customer delivery profiles.

### 🏨 Hotel Administrator Portal
- **Role-Based Authorization**: Strict Firebase Realtime Database authorization rules and client-side verification ensuring only users with `role: "admin"` can access the portal.
- **Executive Operations Dashboard**: High-level key performance metrics (Total Revenue, Total Orders, Active Kitchen Orders, Total Dishes, Customer Base), live revenue sales chart for the last 7 days, and recent orders table.
- **Full Food CRUD & Toggles**: Add, edit, and delete food items with instant toggles for stock availability and homepage signature/featured status.
- **Category Management**: Create, edit, and toggle menu categories.
- **Live Kitchen Order Lifecycle Manager**: Filter orders by status or search by guest name/order ID, with live status updates that reflect immediately on the customer's tracking screen.
- **Guest CRM & Spending Directory**: View all registered customers, order volume, total expenditure, and contact info (passwords never exposed).
- **Hotel Profile & Website Synchronizer**: Update hotel name, tagline, address, phone, email, Google Maps link, opening hours, and story text — automatically updating across the customer website.
- **Promotions & Promo Code Engine**: Configure promo vouchers, minimum cart thresholds, start/end dates, and percentage discounts.
- **1-Click Seed Tool**: Built-in seed tool to easily initialize or restore realistic dummy data.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System with eco-luxury aesthetics), Vanilla JavaScript (ES6+), Firebase JavaScript SDK v9 (Compat Layer).
- **Backend**: Python 3.10+, Flask REST API, Flask-CORS, Python-Dotenv, Gunicorn.
- **Database**: Firebase Realtime Database.
- **Authentication**: Firebase Authentication (Email/Password).

---

## 📂 Project Structure

```text
food-in-forest/
│
├── frontend/
│   ├── index.html               # Public landing page
│   ├── menu.html                # Menu catalog with live search & filters
│   ├── food-details.html        # Dish details & recommendations
│   ├── cart.html                # Shopping cart with calculations & vouchers
│   ├── checkout.html            # Customer delivery checkout form
│   ├── order-success.html       # Live order status tracker
│   ├── login.html               # Customer sign in
│   ├── register.html            # Customer registration
│   ├── profile.html             # Customer profile editor
│   ├── orders.html              # Customer order history
│   │
│   ├── admin/
│   │   ├── login.html           # Admin portal login (Auth + role verification)
│   │   ├── dashboard.html       # Metrics, revenue chart, recent orders
│   │   ├── foods.html           # Food items table with toggles
│   │   ├── add-food.html        # Add new food item form
│   │   ├── edit-food.html       # Edit food item form
│   │   ├── categories.html      # Category CRUD
│   │   ├── orders.html          # Kitchen order lifecycle manager
│   │   ├── customers.html       # Customer spending directory
│   │   ├── hotel-profile.html   # Hotel info & website content editor
│   │   ├── offers.html          # Promo code voucher manager
│   │   └── settings.html        # Database seeder & admin guides
│   │
│   ├── css/
│   │   ├── style.css            # Eco-luxury design system & tokens
│   │   ├── responsive.css       # Responsive layouts (320px - 1440px) & mobile drawer
│   │   └── admin.css            # Admin portal layout, cards, switches & charts
│   │
│   └── js/
│       ├── firebase-config.js   # Centralized Firebase configuration
│       ├── firebase.js          # Unified Firebase RTDB & Auth helper service
│       ├── auth.js              # Authentication state, login, register & access control
│       ├── cart.js              # Cart manager, persistence, vouchers & calculations
│       ├── foods.js             # Menu loader, live search, multi-filters & details
│       ├── orders.js            # Checkout, order creation & history
│       ├── admin.js             # Admin dashboard, CRUD & real-time updates
│       ├── notifications.js     # Non-blocking toast notification manager
│       └── utils.js             # Formatters, helpers, badge generators & sanitizers
│
├── backend/
│   ├── app.py                   # Flask server & static frontend hosting
│   ├── requirements.txt         # Backend Python dependencies
│   ├── seed.py                  # CLI Python database seeder script
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── api.py               # Health check, analytics, categories & foods API
│   │   └── orders.py            # Server-side order verification & calculation API
│   └── services/
│       ├── __init__.py
│       └── firebase_service.py  # Python Firebase REST API service
│
├── firebase/
│   ├── database.rules.json      # Secure role-based Realtime Database rules
│   └── seed-data.json           # 14+ realistic delicacies, categories, offers & hotel profile
│
├── .env.example                 # Example backend environment variables
├── .gitignore                   # Git ignore configurations
├── requirements.txt             # Root requirements
└── README.md                    # Comprehensive documentation
```

---

## ⚡ Quick Start & Setup Guide

### 1. Prerequisites
- Python 3.8 or higher installed
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet access (for Firebase services)

### 2. Backend Installation & Run

1. Clone or open the repository folder:
   ```bash
   cd "food in forest"
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your `.env` file (copied from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Start the Flask application:
   ```bash
   python backend/app.py
   ```
   The application will be accessible at: **`http://127.0.0.1:5000`**

---

## 🌿 Firebase Configuration & Database Setup

### 1. Firebase Configuration
The project is already pre-configured in `frontend/js/firebase-config.js` with:
- **Project ID**: `food-in-forest`
- **Database URL**: `https://food-in-forest-default-rtdb.firebaseio.com/`

### 2. Database Security Rules
To apply the production security rules, copy the contents of `firebase/database.rules.json` and paste them into your **Firebase Console → Realtime Database → Rules** tab, then click **Publish**.

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "hotels": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "categories": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "foods": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "offers": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    "users": {
      ".read": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },
    "orders": {
      ".read": "auth != null",
      "$orderId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && (!data.exists() || data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    }
  }
}
```

### 3. How to Create an Admin Account
To create a Hotel Administrator account securely:
1. Open the guest registration page at `/register.html` (or Firebase Console → Authentication → Users) and register with your admin email (e.g., `admin@foodinforest.com`) and password.
2. Go to **Firebase Console → Realtime Database → `users/{uid}`** for that user.
3. Update the `role` field value from `"user"` to `"admin"`.
   ```json
   {
     "uid": "YOUR_USER_UID",
     "name": "Food in Forest Admin",
     "email": "admin@foodinforest.com",
     "role": "admin"
   }
   ```
4. Navigate to `/admin/login.html` and sign in with those credentials. You will now have full access to the Hotel Operations Portal!

### 4. How to Seed Demo Data
You can seed the database through either of these methods:
- **Method A (Admin Portal UI)**: Log in as Admin, visit `/admin/settings.html`, and click **"Seed Default Food Data to Firebase"**.
- **Method B (Python Script)**: Run `python backend/seed.py` from your terminal.

---

## 🚀 Production Deployment Guide

### Architecture Overview

```text
  [ Client Browser / Mobile ]
               │
               ├──────────────────────────┐
               ▼                          ▼
      ┌─────────────────┐        ┌─────────────────┐
      │ Vercel Frontend │        │ Render Backend  │
      │ (Static HTML/JS)│───────▶│ (Python Flask)  │
      └────────┬────────┘        └────────┬────────┘
               │                          │
               └───────────┬──────────────┘
                           ▼
               ┌───────────────────────┐
               │ Firebase RTDB & Auth  │
               └───────────────────────┘
```

---

### Step 1: Deploy Backend on Render

1. Push your repository to **GitHub**.
2. Log in to [Render Dashboard](https://dashboard.render.com/) and click **New + → Web Service**.
3. Connect your GitHub repository.
4. Fill in the service configuration:
   - **Name**: `food-in-forest-backend`
   - **Region**: Closest to your users (e.g., `Oregon (US West)` or `Singapore`)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root of repo)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn backend.app:app`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   - `PORT`: `10000`
   - `FLASK_ENV`: `production`
   - `SECRET_KEY`: *(generate a secure random secret string)*
   - `FIREBASE_DATABASE_URL`: `https://food-in-forest-default-rtdb.firebaseio.com/`
   - `ALLOWED_ORIGINS`: `https://your-vercel-domain.vercel.app,*`
6. Click **Create Web Service**.
7. Once deployed, copy your Render Web Service URL (e.g., `https://food-in-forest-backend.onrender.com`).

---

### Step 2: Deploy Frontend on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... → Project**.
2. Import your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (or leave default if deploying whole repository; `vercel.json` will route to `frontend/`)
   - **Build Command**: Leave blank / disabled (pure static HTML/CSS/JS)
   - **Output Directory**: Leave blank
4. Under **Environment Variables** (Optional, if using custom domain):
   - `NEXT_PUBLIC_BACKEND_URL`: `https://food-in-forest-backend.onrender.com`
5. Click **Deploy**.
6. Once deployed, open your live Vercel URL and test all pages.

---

### Step 3: Firebase Realtime Database Rules

In your **Firebase Console → Realtime Database → Rules**, ensure your production rules allow read and write for your deployed application:

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "hotels": {
      ".read": true,
      ".write": true
    },
    "categories": {
      ".read": true,
      ".write": true
    },
    "foods": {
      ".read": true,
      ".write": true
    },
    "offers": {
      ".read": true,
      ".write": true
    },
    "users": {
      ".read": true,
      ".write": true
    },
    "orders": {
      ".read": true,
      ".write": true,
      ".indexOn": ["userId", "createdAt", "orderStatus"]
    },
    "settings": {
      ".read": true,
      ".write": true
    }
  }
}
```

---

## 🍽️ Active Promotional Codes (Pre-seeded)

- **`FOREST10`**: 10% OFF on all orders (No minimum amount required).
- **`WILD20`**: 20% OFF on family feast orders above ₹600.
- **`CHEF15`**: 15% OFF on signature preparations on orders above ₹400.

---

## 🔒 Security & Access Control

- **Admin vs Guest Control**: Authenticated sessions verify user records in the Firebase Realtime Database `users` node. Only records with `role: "admin"` are permitted inside `/admin/dashboard.html` and administrative CRUD endpoints.
- **Protected Secrets**: Backend environment variables (`SECRET_KEY`, `FIREBASE_DATABASE_URL`) are isolated from frontend code.
- **Image Optimization**: Client-side image compressor converts and scales device/gallery photos before upload to ensure fast loading times.

---

## 📄 License & Commercial Rights
Designed and built for commercial sale and deployment to luxury eco-resorts, wildlife lodges, and forest-themed restaurants. All rights reserved &copy; 2026.

