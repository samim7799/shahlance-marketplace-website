# Product Requirements Document (PRD)

## 1. Overview & Vision
ShahLance is a full-stack digital services & freelance marketplace. In addition to client-freelancer matching, seller management, commissions, and digital product licensing, it now includes a dedicated **SMS Verification Marketplace UI Prototype**.

## 2. Core Modules & Status
- **Signup Bonus Protection System**: Admin configuration, fraud risk scoring, IP/device restrictions, claim logs. (Status: Complete)
- **Seller & Product Management**: KYC tiers, seller commissions, digital product CRUD. (Status: Complete)
- **Marketplace Commission System**: Tiered commission engine with real-time fee calculation. (Status: Complete)
- **Digital Product Management**: Subscriptions, license keys, and gift cards module. (Status: Complete)
- **Advanced Admin Tools**: CMS content manager, revenue reports, security logs, 2FA management. (Status: Complete)
- **SMS Verification Marketplace UI Prototype**: Mobile-first fintech/crypto styled prototype accessible at `/sms-marketplace`. (Status: Complete)

## 3. SMS Verification Marketplace Specifications (Delivered)
- **Navigation**:
  - Sticky header with Brand logo, Notification alert bell with modal, and Three-line menu drawer. (Profile button removed as specified).
  - Bottom navigation bar with 4 tabs: **Home**, **Services**, **Orders**, **Rent**.
- **Home Tab**:
  - USDT Wallet Balance card with quick reload indicators and average delivery speed stats.
  - "Add Funds" button opening an interactive USDT deposit modal (TRC20, Polygon, BEP20) with preset amounts and instant escrow notes.
  - Quick Action cards: "Buy Number", "Saved Services", "Rent Numbers", "My Orders".
  - Spotlight carrier pools and limited promotional banner ("SHAHSMS20" +15% extra USDT deposit bonus) with copy button.
- **Services Tab**:
  - Real-time service search bar & modal country picker with flag emojis.
  - Service cards displaying carrier logo, service name, lowest price, country, delivery rate, and "Select" action.
  - Interactive "Number Type" selection modal featuring:
    - *One Time OTP*
    - *Multiple OTP*
    - *Premium One Time OTP*
    - *Premium Multiple OTP*
    - Dynamic price computation and simulated carrier line provisioning.
- **Orders Tab**:
  - Status switcher filter tabs: **Active**, **Completed**, **Cancelled** with dynamic count badges.
  - Order cards with service logo, assigned phone number with copy button, received OTP verification code box, price paid in USDT, and live countdown timer.
- **Rent Tab**:
  - Dedicated long-term private number rental cards (4 Hours, 24 Hours, 7 Days, 30 Days).
  - Clean carrier SIM indicators, multi-code allowance, and instant lease button.
- **Styling**:
  - Dark fintech aesthetic (`#070b14` / `#090d18` / `#0c1322`), emerald & cyan crypto accents, responsive centered layout (`max-w-md mx-auto`) simulating native mobile app behavior on both mobile (390px) and desktop (1920px).

## 4. Prioritized Backlog
- **P0**: SMS Provider Real API Webhook Integration (Twilio/5sim/SMS-Activate) if backend execution is requested by user.
- **P1**: Cryptocurrency Web3 / TRON USDT Wallet Connect for automated deposits.
- **P2**: SMS Auto-forwarding via Telegram Bot or Discord Webhook.
