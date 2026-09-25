# ShahLance – Digital Marketplace: PRD & Status

## Original problem statement
Continue development of an existing GitHub project (samim7788/shahlance-web-dev) — a multi-vendor Digital Marketplace for digital products (ebooks, templates, courses, software downloads). Users: Buyers + Sellers + Admin. Requirements: product listing, search, cart/checkout, user authentication (email/password), seller dashboard, Stripe payments, real file upload + secure download after payment. Keep existing UI/design, improve where needed, do not delete working features. Focus on security, clean code, scalable backend, and proper frontend↔backend connection.

## Architecture
- Frontend: React (CRA + craco), Tailwind, shadcn/ui, react-router. Dark navy + emerald theme (~27 pages).
- Backend: FastAPI + MongoDB (motor). JWT auth (bcrypt). Stripe checkout (emergentintegrations, TEST mode). Emergent Object Storage for files.
- Frontend talks to backend only via `services/apiClient.js` (axios, bearer token in localStorage `shahlance_token`). Service layer (auth/order/review/saved/seller) rewritten to call the API with unchanged signatures, so existing pages/contexts work untouched.

## User personas
- Buyer: browses catalog, buys digital products, pays via Stripe, downloads deliverables, leaves reviews, manages saved list.
- Seller: applies to sell, uploads products (with deliverable file) after admin approval, manages orders/analytics, requests withdrawals.
- Admin (seeded: rajavai247@gmail.com): approves seller applications/products, moderates reviews, monitors orders/payments.

## Implemented (Sep 2026 — backend wiring iteration)
- Real JWT email/password auth: register/login/me/update-profile/forgot-password. Admin seeded on startup (idempotent). Role derivation: client→buyer, freelancer/both→seller, seeded email→admin.
- Orders API with role-scoped listing (buyer=own, seller=sales, admin=all; guest=empty), create, status update (role-scoped transitions), payment update.
- Stripe checkout (TEST): create session → redirect to checkout.stripe.com → `/payment/success` polls status → order marked paid+processing. Webhook at /api/webhook/stripe.
- Reviews API (public non-hidden; admin sees all + hide/remove). Saved/wishlist API. Seller applications/products/withdrawals API with admin approval gating.
- File upload (Emergent Object Storage) + secure download at /api/orders/{id}/download gated by ownership + paymentStatus=paid.
- Security hardening: server-side password length, profile-update field allowlist (no role/flag injection), order-status authorization, login brute-force lockout (8/15min), admin-only endpoints (403 for non-admin), CORS.
- Frontend wired: AuthContext async hydration; Checkout→Stripe redirect + PaymentReturn page; SellerUpload deliverable upload; BuyerOrders secure download button; saved-service consumers made async.
- Verified: testing_agent iteration_2 → backend 20/20 pytest PASS, frontend targeted flows 100% PASS. Extra security curl checks all pass.

## Implemented (Sep 2026 — Live Product Catalog)
- Canonical catalog (33 products) + categories moved to `backend/catalog_seed.py`, seeded into MongoDB `products` (approved) on startup. Public `GET /api/products`, `GET /api/products/{id}`, `GET /api/categories`.
- `_all_products()` merges seeded catalog + APPROVED seller uploads into one shape and overlays live ratings/counts computed from reviews. Newly approved seller products appear in the public marketplace automatically.
- Frontend `ProductsContext`/`useProducts` fetches `/api/products` once at boot; Home/Search/Marketplace/ServicesMarketplace/ProductDetail/ServiceDetails/Checkout/BuyerOrders now read the live catalog (browse/search/filter/sort/detail). Loading spinners guard detail pages. CATEGORIES/*_IDS remain static config.
- Verified: testing_agent iteration_3 → backend 24/24 pytest PASS, all frontend catalog + regression flows PASS (auth, Stripe checkout, seller upload→approve→appears live, buyer orders/saved).

## Known scope notes
- The BROWSING catalog (Home/Search/Marketplace/ProductDetail/ServiceDetails) still reads static seed data from `frontend/src/mock/data.js`. All DYNAMIC data (users, orders, reviews, saved, seller apps/products, withdrawals, payments, files) is fully MongoDB-backed; no localStorage persistence remains for these.
- Stripe uses the shared TEST sandbox (sk_test_emergent). A claimable sandbox is unavailable for account country BD; going live requires a Stripe-supported account.

## Implemented (Sep 2026 — Admin Console: Core, SMS, Payments & Wallet)
- Admin Console `/admin/console` (admin-only, role-gated): Overview (stats + recent activity), Users (search, detail + wallet view, block/unblock with login rejection), SMS API management (providers CRUD, service+country→primary/backup mappings with cost/price/profit, enable/disable services & countries, order tracking).
- Payment Gateway Management (config storage ONLY per user choice — no live gateway calls): CRUD `/api/admin/payments/gateways` for Cryptomus & NOWPayments (Merchant ID, API Key, Secret Key, Webhook URL, enable/disable), provider validated.
- Payment Monitoring: `GET /api/admin/payments/transactions` reads Stripe `payment_transactions`, normalizes to pending/completed/failed/refunded with summary counts + status filter; manual refund marking via `PATCH .../{id}/refund` (DB record only, no Stripe refund call — user choice).
- Advanced Wallet: `POST /api/admin/wallet/adjust` (credit/debit/bonus, amount>0, mandatory note, overdraft guard, logs `wallet_transactions` with note/adminId/balanceAfter, updates `users.walletBalance`); `GET /api/admin/wallet/report` (total balances, totals/counts by type, recent txns).
- Verified: testing_agent iteration_5 → backend 20/20 PASS (1 skip: no completed txns exist to refund), frontend all flows PASS incl. regression of Overview/Users/SMS tabs. QA buyer wallet now $63 (test adjustments).

## Implemented (Sep 2026 — Signup Bonus Protection System)
- Added dedicated Signup Bonus Protection System module (`/app/backend/bonus_protection.py` and `/app/frontend/src/components/admin/BonusProtectionSection.jsx`).
- Admin Bonus Settings: Enable/Disable Signup Bonus switch, Bonus Amount configuration, Require First Purchase (ON/OFF), Minimum Purchase Amount threshold.
- Bonus Fraud Protection Engine:
  * Hardware & browser device fingerprint ledger: one device can receive bonus only once; reuse flags account as suspicious.
  * Verified email requirement: bonuses withheld until user email verification passes.
  * Duplicate account detection across existing user data: detects shared phone numbers, duplicate IP/subnets, disposable/temporary email domains (@tempmail, etc.), plus-addressing aliases, and identical full-name clusters.
  * Automatic flagging: suspicious accounts are flagged (`isSuspicious: true`) and bonuses held in `pending_review` without breaking normal buyer/seller marketplace navigation.
- Admin Controls & Triage Panel:
  * Bonus History table with search, status filtering, and device/IP audit logs.
  * User Bonus Status directory with live wallet balances, verification pills, and bonus statuses.
  * Suspicious User List triage console with real-time fraud trigger breakdown and quick action buttons: Approve Bonus (credits wallet + logs wallet transaction), Reject Bonus, and Clear Suspicion Flag.
  * Live status endpoint `GET /api/bonus/status`, `POST /api/bonus/evaluate`, `POST /api/bonus/verify-email`, `POST /api/bonus/verify-phone`.
- Verified: backend test suite (8/8 PASS in `test_bonus_protection.py`), full regression passed (20/20 in `test_wallet_payments.py`), frontend verified end-to-end via automated testing and desktop/mobile verification.

## Backlog / next
- P1: Wire live Cryptomus/NOWPayments payment creation + webhooks using the stored gateway configs (needs real merchant API keys from user); connect Accounts payment UI to a real gateway.
- P1: Bring seller-uploaded (approved) products into the public marketplace listing (replace/augment mock catalog with GET /api/seller/products?status=approved) so the whole catalog is DB-backed and searchable.
- P1: Post-order buyer↔seller chat; email receipts (Resend/SendGrid).
- P2: Seller payouts/withdrawals real processing; real Stripe refunds from monitoring UI; admin fraud widgets; split server.py into routers/* (now ~1390 lines).
