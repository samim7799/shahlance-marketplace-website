# ShahLance – Product Requirements & Status

## Original problem statement
Build a polished digital marketplace website recreating the design/UX of the ShahLance reference site, then progressively add: Premium Fiverr-like homepage, authentication UI, role-based dashboards (Buyer / Seller / Admin), Seller Application & Approval workflow, notifications, advanced account management, and (latest addition) a full Buyer Marketplace + Service Ordering System with a review system. The entire application is a **frontend mockup** using `localStorage` + React Contexts and must be additive-only — existing files/components/routes/theme must not be modified.

## Product principles (user-locked)
- **Additive only** — do not delete, rewrite, refactor or replace existing code.
- Do **not** modify existing homepage, dashboards, authentication, seller system, or current components.
- Preserve the premium dark ShahLance theme, responsive layout, and role-separated dashboards (Buyer / Seller / Admin).
- Frontend-only implementation with localStorage persistence, backend-ready seams.

## What's implemented

### ShahLance clone base (previous session)
- `Home.jsx`, `Search.jsx`, `ProductDetail.jsx`, `Marketplace.jsx`, freelancer/job features, auth UI (`Login`, `Signup`, `AuthContext`, `ProtectedRoute`), notifications (`NotificationsContext`), Become Seller / Seller Upload / Admin Panel, My Account hub (`MyAccount`, `Messages`, `Settings`, `AccountMenu`).

### Feb 2026 — Buyer Marketplace + Ordering System (this session, additive)
**Services**
- `services/orderService.js` – localStorage CRUD for orders (pending/processing/completed/cancelled) + payment status + `computeSellerAnalytics` helper.
- `services/reviewService.js` – reviews CRUD + `summarize` helper.
- `services/savedService.js` – per-user wishlist.

**State**
- `contexts/OrdersContext.jsx` – exposes orders/reviews + `createOrder`, `updateOrderStatus`, `updatePayment`, `submitReview`, `setReviewHidden`, `removeReview`. Wraps app inside `App.js`.

**Reusable components**
- `MarketplaceServiceCard.jsx` (image placeholder, title, seller, rating, price, category, View Details)
- `MarketplaceFilters.jsx` (search, category, min/max price, min rating chips)
- `StarRating.jsx`, `OrderStatusBadge.jsx` (+ `PaymentBadge`), `ReviewForm.jsx`, `ReviewList.jsx`

**Pages (new routes appended in App.js — no existing routes removed)**
- `/services` → `ServicesMarketplace.jsx` — filters + popular + recommended + grid + sort.
- `/services/:id` → `ServiceDetails.jsx` — description, features, tags, reviews, seller preview. **No phone / WhatsApp / Telegram / direct contact.** Only Buy / Save / Share buttons.
- `/orders/checkout/:id` → `Checkout.jsx` — mock payment flow, order note.
- `/orders/success/:id` → `OrderSuccess.jsx` — confirmation with order details.
- `/dashboard/buyer-orders` → `BuyerOrders.jsx` — tabs: My Orders, Active, Completed, Cancelled, Saved, Reviews, Payments. Cancel + Leave review actions.
- `/dashboard/seller-orders` → `SellerOrders.jsx` — tabs: New, Accepted, Completed, Cancelled, Reviews, Analytics (with revenue-by-month bars). Accept / Mark as delivered / Decline actions.
- `/admin/orders` → `AdminOrders.jsx` — tabs: Order Management, Payment Monitoring, Review Management, Service Approval. Status overrides, mark-paid/refund, hide/unhide/remove reviews, approve/reject seller applications (uses existing `sellerService`).

**AccountMenu (additively extended)**
- Preserved existing items (Profile, Dashboard, Messages, Notifications, Settings, Logout).
- Appended: Marketplace, Buyer Orders, Seller Orders, Admin Orders.

### Testing
- `testing_agent` iteration_1: **100% frontend pass** across marketplace browsing, filters/sort, guest-buy → login redirect, checkout & order creation, buyer cancel, seller accept/complete, review flow, admin controls, and localStorage persistence.
- No critical issues; only cosmetic notes (widget overlap on some viewports; category-name mentions in Footer look like "Telegram Services" but are safe — not contact fields).

## Privacy rules enforced
On `/services/:id` and `/orders/checkout/:id`, direct seller contact is disabled: no phone number, no WhatsApp, no Telegram, no messaging CTA. Communication is intended to happen inside the order (future feature) — a Lock notice is displayed explaining this.

## Backlog / Roadmap (unchanged)

### P0 — Backend integration
- Convert `authService`, `sellerService`, `orderService`, `reviewService`, `savedService` from localStorage to FastAPI + MongoDB.
- Auth endpoints (`/api/auth/register`, `/api/auth/login`) with JWT — use `integration_playbook_expert_v2`.
- Mongo schemas: Users, Products/Services, Orders, Reviews, Applications, Notifications, SavedServices.

### P1
- Real-time WebSockets for post-order buyer↔seller chat (still no direct phone/WhatsApp/Telegram exchange).
- Real file uploads (portfolio, service images) via Emergent Object Storage.
- Refactor sprawling mock data files after backend goes live.

### P2 / Future
- Seller analytics extended (customer segments, top services).
- Buyer payment methods (Stripe or Razorpay per user country).
- Admin fraud detection widgets.

## Key files touched this session
- Modified: `frontend/src/App.js` (imports + routes appended, `OrdersProvider` wrapped), `frontend/src/components/AccountMenu.jsx` (new links appended).
- Created (all new files): `services/orderService.js`, `services/reviewService.js`, `services/savedService.js`, `contexts/OrdersContext.jsx`, `components/{MarketplaceServiceCard, MarketplaceFilters, StarRating, OrderStatusBadge, ReviewForm, ReviewList}.jsx`, `pages/{ServicesMarketplace, ServiceDetails, Checkout, OrderSuccess, BuyerOrders, SellerOrders, AdminOrders}.jsx`.

## Credentials / testing
- No fixed seeded users — anyone can sign up at `/signup`; all data is localStorage-backed.
- Test users created during automated run: `tb<timestamp>@example.com / Password123!`.
