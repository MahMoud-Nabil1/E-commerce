# 🛒 ShopFlow — Enterprise Multi-Vendor E-Commerce Platform

[![Java 21](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6.x-6DB33F?logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%2F%206.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**ShopFlow** is a modern, full-stack, multi-vendor e-commerce web platform engineered for reliability, security, and enterprise performance. It pairs a **Spring Boot 3 (Java 21)** RESTful backend with a responsive **React 19 + TypeScript + Tailwind CSS v4** single-page application.

The platform follows a **Corporate Modern** design system with a 1440px fixed grid, Manrope typography, seamless role-based workflows for Buyers, Merchants, and Administrators, Stripe payments, Cloudinary CDN asset hosting, and automated email verification.

---

## 📸 Preview

![ShopFlow Storefront Preview](assets/screen.png)

---

## 🌟 Key Features

### 🛍️ Customer Experience (Storefront)
* **Product Discovery:** Paginated browsing, keyword search, category filters, and discounted "Deals" section with dynamic pricing computation.
* **Product Detail & Gallery:** High-resolution multi-image galleries hosted on Cloudinary CDN, live stock status, and comprehensive specifications.
* **Interactive Shopping Cart:** Persistent user carts with real-time total updates, stock validations, and instant item quantity modifications.
* **Multi-Address Management:** Manage multiple shipping addresses with complete CRUD capabilities directly from the checkout or profile screen.
* **Streamlined Checkout:** Integrated Stripe checkout via `PaymentIntents` for debit/credit cards, as well as Cash on Delivery (COD) workflows.
* **Reviews & Star Ratings:** Detailed 5-star customer feedback system, per-rating summary histograms, and authenticated user review management (submit, update, delete).
* **Order History & Tracking:** Real-time visibility into order lifecycles (`Accepted`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).

### 💼 Merchant Portal (Seller Dashboard)
* **Inventory Management:** Full lifecycle product creation, editing, category assignment, and stock level controls.
* **Cloudinary Multi-Image Uploads:** Upload multiple high-resolution photos per product directly stored and transformed on Cloudinary CDN.
* **Order Processing:** Track incoming customer orders containing the seller's items, update fulfillment statuses, and verify payment approvals.
* **Performance Overview:** Quick metrics on total products listed, active inventory, and sales orders.

### 🛡️ Platform Governance (Admin Panel)
* **Category Management:** Create, rename, and remove product taxonomy and catalog categories.
* **Catalog Supervision:** Full oversight across all marketplace listings, with ability to moderate or delist products.
* **Global Order Administration:** Platform-wide order inspection, status modifications, and payment reconciliations.
* **Seller Moderation:** Monitor merchant accounts with the ability to **Activate**, **Suspend**, or permanently **Ban** seller privileges.

### 🔐 Security & Identity Architecture
* **Stateless JWT via HttpOnly Cookies:** JWT tokens are stored securely in browser `HttpOnly`, `SameSite`, and `Secure` cookies, eliminating XSS vulnerability vectors associated with local storage.
* **Role-Based Access Control (RBAC):** Granular authorization guards for `ROLE_USER`, `ROLE_SELLER`, and `ROLE_ADMIN` across backend security filter chains and frontend protected routes.
* **Email Verification (OTP):** Automated 6-digit OTP email dispatch upon registration using Spring Mail & Gmail SMTP.
* **Password Recovery:** Self-service "Forgot Password" flow with time-sensitive email verification codes.
* **OAuth2 Social Sign-In:** Configured hooks for Google and GitHub single sign-on authentication.
* **Auto-Seeded Default Accounts:** Automatic initialization of platform roles and admin accounts upon first database boot.

---

## 🏗️ Technology Stack

| Domain | Technology / Library | Description |
| :--- | :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.4.5 | High-performance enterprise REST API |
| **Security** | Spring Security 6, JJWT (0.11.5) | Stateless authentication, HttpOnly cookies, RBAC |
| **Persistence** | Spring Data JPA, Hibernate | ORM data layer with automatic DDL migration |
| **Databases** | PostgreSQL (Neon Cloud) / MySQL / H2 | Relational schema with dialect flexibility |
| **Frontend** | React 19, TypeScript, Vite 8 | Fast, type-safe client-side single page app |
| **Styling** | Tailwind CSS v4, Modern Commerce System | Modern Corporate UI, Manrope font, 1440px grid |
| **Client Routing & API** | React Router 7, Axios | Client routing, request/response interceptors |
| **Payments** | Stripe Java SDK (24.2.0) | Stripe PaymentIntents API |
| **Media & CDN** | Cloudinary HTTP44 SDK (1.36.0) | Scalable cloud image uploads and transformations |
| **Mailing** | Spring Boot Starter Mail | SMTP email verification and OTP dispatch |
| **DevOps & Containers** | Docker (Eclipse Temurin 21), Render PaaS | Multi-stage Docker build, Render blueprint |

---

## 📂 Repository Structure

```text
E-commerce/
├── .gitignore
├── LICENSE                    # MIT License
├── README.md                  # Project documentation
├── render.yaml                # Infrastructure-as-Code for Render deployment
├── assets/                    # Design specs, color palettes, and screenshots
│   ├── DESIGN.md              # Design system tokens and styling specifications
│   └── screen.png             # Storefront UI preview image
│
├── ecommerce/                 # Spring Boot Backend
│   ├── pom.xml                # Maven project definition and dependencies
│   ├── Dockerfile             # Multi-stage production container build
│   ├── mvnw / mvnw.cmd        # Cross-platform Maven wrappers
│   └── src/
│       ├── main/
│       │   ├── java/com/ecommerce/ecommerce/
│       │   │   ├── config/          # App constants, CORS, and Cloudinary configuration
│       │   │   ├── Controllers/     # REST controllers (Auth, Products, Cart, Orders, Reviews, etc.)
│       │   │   ├── exceptions/      # Global exception handling & custom responses
│       │   │   ├── Models/          # JPA Entities (User, Role, Product, Category, Order, Cart, etc.)
│       │   │   ├── Payload/         # DTOs, request payloads, and API response models
│       │   │   ├── Repositories/    # Spring Data JPA repositories
│       │   │   ├── Security/        # JWT filters, entry points, handlers, and OAuth2
│       │   │   ├── Services/        # Business logic & 3rd-party integrations (Stripe, Cloudinary, Mail)
│       │   │   └── util/            # Authentication utilities & user context helpers
│       │   └── resources/
│       │       └── application.properties # Spring configuration & environment overrides
│       └── test/                    # Backend unit and integration tests
│
└── frontend/                  # React + TypeScript + Vite SPA
    ├── package.json           # Dependencies, scripts, and concurrent runner
    ├── vite.config.ts         # Vite build configuration and local API proxy
    ├── index.html             # HTML entry point with Manrope typography
    └── src/
        ├── App.tsx            # Main application router with role guards
        ├── main.tsx           # React DOM root entry
        ├── types.ts           # Shared TypeScript interfaces and domain types
        ├── index.css          # Tailwind CSS directives and custom styling rules
        ├── components/        # Reusable UI widgets (Navbar, ProductCard, Reviews, ProtectedRoute)
        ├── contexts/          # AuthContext for global user state & authentication
        ├── lib/               # Axios client instance, API helper SDK, and image resolvers
        └── pages/             # Route pages (Home, Products, ProductDetail, Cart, Checkout, Dashboards)
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Java Development Kit (JDK) 21** or higher
- **Node.js 18+** & **npm**
- **Git**
- *(Optional)* **Docker** if running in containers

---

### 1. Clone the Repository

```bash
git clone https://github.com/MahMoud-Nabil1/E-commerce.git
cd E-commerce
```

---

### 2. Configure Environment Variables

The backend loads configuration variables via Spring properties or a local `.env` file inside the `ecommerce/` folder.

Create a file named `ecommerce/.env`:

```env
# Server
PORT=8085

# Database (PostgreSQL / Neon or local DB)
DB_URL="jdbc:postgresql://<your-db-host>:5432/<your-db-name>?sslmode=require"
DB_USER=<your-db-username>
DB_PASSWORD=<your-db-password>
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Security & JWT
JWT_SECRET=YourSuperSecretJwtKeyWithSufficientLengthForHMACSHA256Algorithm123456
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_yourStripeSecretKeyHere

# Cloudinary (Media Hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Verification (Gmail SMTP)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-gmail-app-password

# Optional: OAuth2 Social Logins
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
OAUTH2_REDIRECT_URI=http://localhost:5173/oauth2/callback
```

> **Note for production:** When deploying over HTTPS, switch `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=None`.

---

### 3. Run the Applications

#### Option A: Run Both Simultaneously (Recommended)

From the `frontend/` directory, install frontend dependencies and run the concurrent command which boots both Spring Boot and Vite:

```bash
cd frontend
npm install
npm start
```

* Backend will boot at: `http://localhost:8085`
* Frontend will run at: `http://localhost:5173`

---

#### Option B: Run Services Individually

**Terminal 1 — Backend (Spring Boot):**
```bash
cd ecommerce

# On Windows:
.\mvnw.cmd spring-boot:run

# On Linux / macOS:
./mvnw spring-boot:run
```

**Terminal 2 — Frontend (React / Vite):**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. All API requests to `/api/*` are automatically proxied by Vite to the backend running on port `8085`.

---

## 🔑 Default Accounts & Roles

Upon initial startup, the backend automatically seeds the system roles and administrative accounts:

| Username | Email | Password | Assigned Roles | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | `admin@shopflow.com` | `Admin@123` | `ROLE_ADMIN`, `ROLE_USER` | Full Admin Panel (`/admin`) |
| `superadmin` | `superadmin@shopflow.com` | `SuperAdmin@999` | `ROLE_ADMIN`, `ROLE_USER` | Master Governance (`/admin`) |

* **Seller Account:** Sign up via `/register` and choose the seller registration role, or have an admin grant `ROLE_SELLER` privileges to access `/seller`.
* **Buyer Account:** Standard customer registration assigns `ROLE_USER` by default.

---

## 🔌 API Reference Overview

The backend exposes a structured, RESTful contract under the `/api` namespace:

### 🔑 Authentication & Identity (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user and returns HttpOnly JWT cookie |
| `POST` | `/api/auth/signup` | Public | Registers a new buyer or seller account |
| `POST` | `/api/auth/signout` | Authenticated | Clears user JWT cookie server-side |
| `POST` | `/api/auth/verify-email` | Public | Verifies account registration via 6-digit OTP |
| `POST` | `/api/auth/resend-verification` | Public | Resends account verification OTP |
| `POST` | `/api/auth/forgot-password` | Public | Generates a password recovery OTP to user email |
| `POST` | `/api/auth/reset-password` | Public | Sets a new password using verified OTP |
| `GET` | `/api/auth/user` | Authenticated | Fetches current logged-in user summary and roles |
| `GET` | `/api/auth/sellers` | Admin | Lists paginated registered sellers across platform |

### 📦 Catalog & Public Storefront (`/api/public`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/categories` | Public | Paginated list of product categories |
| `GET` | `/api/public/products` | Public | Paginated list of active products (filters & sorting) |
| `GET` | `/api/public/products/{id}` | Public | Retrieves detailed single product view |
| `GET` | `/api/public/categories/{id}/products` | Public | Products belonging to a specific category |
| `GET` | `/api/public/products/keyword/{term}`| Public | Keyword search across product titles and tags |
| `GET` | `/api/public/products/{id}/reviews` | Public | Paginated list of customer reviews for a product |
| `GET` | `/api/public/products/{id}/reviews/summary` | Public | Aggregated star ratings breakdown histogram |

### 🛒 Shopping Cart & Addresses
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/carts/users/cart` | Authenticated | Retrieves current logged-in user's cart |
| `POST` | `/api/carts/products/{id}/quantity/{qty}`| Authenticated | Adds product to cart with specified quantity |
| `PUT` | `/api/cart/products/{id}/quantity/{op}` | Authenticated | Increments or decrements product quantity |
| `DELETE` | `/api/carts/{cartId}/product/{productId}`| Authenticated | Removes an item from the cart |
| `GET` | `/api/users/addresses` | Authenticated | Retrieves user's saved shipping addresses |
| `POST` | `/api/addresses` | Authenticated | Adds a new shipping address |
| `PUT` | `/api/addresses/{id}` | Authenticated | Modifies an existing shipping address |
| `DELETE` | `/api/addresses/{id}` | Authenticated | Deletes an address |

### 💳 Checkout, Orders & Reviews
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders/checkout` | Authenticated | Converts cart into confirmed order (Stripe/COD) |
| `POST` | `/api/order/stripe-client-secret` | Authenticated | Initiates Stripe `PaymentIntent` and returns secret |
| `GET` | `/api/orders/my-orders` | Authenticated | Retrieves purchase history for current user |
| `GET` | `/api/orders/{id}/details` | Authenticated | Full breakdown of specific order items and delivery status |
| `POST` | `/api/products/{id}/reviews` | Authenticated | Submits a star rating and comment for a product |
| `PUT` | `/api/reviews/{reviewId}` | Authenticated | Updates an existing review written by the user |
| `DELETE` | `/api/reviews/{reviewId}` | Authenticated | Removes user's review |

### 🏪 Merchant / Seller APIs (`/api/seller`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/seller/products` | Seller / Admin | Lists all products belonging to the logged-in merchant |
| `POST` | `/api/seller/categories/{id}/product` | Seller / Admin | Creates a new product under category |
| `PUT` | `/api/seller/products/{id}` | Seller / Admin | Updates product pricing, stock, description |
| `DELETE` | `/api/seller/products/{id}` | Seller / Admin | Removes a seller's product from catalog |
| `POST` | `/api/seller/products/{id}/images` | Seller / Admin | Uploads multiple product images to Cloudinary |
| `DELETE` | `/api/seller/products/{id}/images` | Seller / Admin | Deletes an image from Cloudinary & product gallery |
| `GET` | `/api/seller/orders` | Seller / Admin | Orders containing items sold by this seller |
| `PUT` | `/api/seller/orders/{id}/status` | Seller / Admin | Updates order fulfillment progress |
| `PUT` | `/api/seller/orders/{id}/approve-payment`| Seller / Admin | Marks order payment as settled |

### 🛠️ Platform Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/categories` | Admin | Creates a new catalog category |
| `PUT` | `/api/admin/categories/{id}` | Admin | Renames/updates a category |
| `DELETE` | `/api/admin/categories/{id}` | Admin | Deletes a category |
| `GET` | `/api/admin/products` | Admin | Platform-wide product catalog inspection |
| `GET` | `/api/admin/orders` | Admin | Platform-wide orders overview |
| `PUT` | `/api/admin/orders/{id}/status` | Admin | Admin override for order status |
| `PUT` | `/api/admin/sellers/{id}/activate` | Admin | Restores suspended or banned seller account |
| `PUT` | `/api/admin/sellers/{id}/suspend` | Admin | Temporarily suspends seller privileges |
| `PUT` | `/api/admin/sellers/{id}/ban` | Admin | Permanently bans a seller from marketplace |

---

## 🚢 Docker & Production Deployment

### Building with Docker

The backend includes a multi-stage Dockerfile using Eclipse Temurin 21 JRE for minimal footprint and maximum security:

```bash
cd ecommerce

# Build container image
docker build -t shopflow-backend .

# Run container
docker run -p 8085:8080 \
  -e PORT=8080 \
  -e DB_URL="jdbc:postgresql://host.docker.internal:5432/neondb" \
  -e DB_USER=neondb_owner \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_jwt_secret \
  shopflow-backend
```

---

### Deployment on Render

This repository includes a native [`render.yaml`](render.yaml) blueprint configuring both services:

1. **Backend Service (`ecommerce-backend`):**
   * Runtime: Docker
   * Context: `ecommerce/`
   * Health Check & Dynamic PORT binding
2. **Frontend Service (`ecommerce-frontend`):**
   * Runtime: Static Site
   * Build command: `npm install && npm run build`
   * Publish directory: `dist`
   * SPA client-side rewrite rule for React Router: `/*` -> `/index.html`

To deploy:
1. Connect this GitHub repository to your [Render Dashboard](https://dashboard.render.com/).
2. Select **Blueprints** and choose `render.yaml`.
3. Provide your production environment variables (`DB_PASSWORD`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `CLOUDINARY_*`, `SPRING_MAIL_*`).
4. Click **Apply** to trigger zero-downtime deployment.

---

## 🎨 Design System & Architecture

The frontend adheres to the **Modern Commerce Framework** specifications outlined in [`assets/DESIGN.md`](assets/DESIGN.md):

* **Color Palette:**
  * Primary: Deep Navy (`#031636` / `#1A2B4C`) for navigation, authority, and structure.
  * Secondary: Digital Blue (`#264DD9`) for active states, indicators, and primary CTAs.
  * Surfaces: Clean cool-tinted off-white (`#F8F9FF`) with tonal elevation layers instead of harsh drop shadows.
* **Typography:** Pure **Manrope** typography across all scales, balancing high-impact bold headings with high-readability body copy.
* **Layout:** Centered 1440px desktop grid with 32px gutters, 8px linear spacing scale, and mobile-responsive collapsible navigation.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<p align="center">
  Crafted by <a href="https://github.com/MahMoud-Nabil1">Mahmoud Nabil</a>
</p>