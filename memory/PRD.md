# Product Requirements Document (PRD)

## 1. Overview & Vision
ShahLance is a full-stack digital services & freelance marketplace. In addition to client-freelancer matching, seller management, commissions, and digital product licensing, it features an isolated, mobile-first **SMS Verification Marketplace UI Prototype** accessible at `/sms-marketplace`.

## 2. Completed Modules
- **Signup Bonus Protection System**: Admin configuration, fraud scoring, IP/device restrictions, claim logs. (Status: Complete)
- **Seller & Product Management**: KYC tiers, seller commissions, digital product CRUD. (Status: Complete)
- **Marketplace Commission System**: Tiered commission calculation. (Status: Complete)
- **Digital Product Management**: Subscriptions, license keys, and gift cards module. (Status: Complete)
- **Advanced Admin Tools**: CMS content manager, revenue reports, security audit logs, 2FA management. (Status: Complete)
- **SMS Verification Marketplace UI Prototype**: Mobile-first fintech/crypto UI prototype at `/sms-marketplace`. (Status: Fully Polished & Verified)

## 3. SMS Verification Marketplace Final Polished Specs
- **Architecture**:
  - Pure UI prototype strictly using mocked demo data; zero modifications to existing database schemas, payment systems, authentication, or external APIs.
  - Centered mobile-first container (`max-w-md mx-auto`) displaying natively on both mobile (390px) and desktop (1920px) screens.
- **Header**:
  - Sticky header with Brand logo, Notification icon with Alert modal, Three-line menu drawer. Profile icon removed as specified.
- **Home Tab**:
  - USDT Wallet Balance card with quick reload indicators and average delivery speed stats.
  - "Add Funds" button opening an interactive USDT deposit modal (TRC20, Polygon, BEP20) with preset amounts and instant escrow notes.
  - Quick Action cards: "Buy Number", "Saved Services", "Rent Numbers", "My Orders".
  - Spotlight carrier pools and limited promotional banner ("SHAHSMS20" +15% extra USDT deposit bonus) with copy button.
- **Services Tab**:
  - Real-time service search bar & modal country picker with flag emojis (supports ESC key).
  - Service cards displaying carrier logo, service name, lowest price, country, delivery rate, and "Select" action.
  - Interactive "Number Type" selection modal featuring:
    - *One Time OTP*
    - *Multiple OTP*
    - *Premium One Time OTP*
    - *Premium Multiple OTP*
- **Orders Tab**:
  - Status switcher filter tabs: **Active**, **Completed**, **Cancelled** with dynamic count badges.
  - Order cards with service logo, assigned phone number with copy button, received OTP verification code box, price paid in USDT, and live countdown timer.
- **Rent Tab**:
  - Dedicated long-term private number rental cards (4 Hours, 24 Hours, 7 Days, 30 Days).
  - Clean carrier SIM indicators, multi-code allowance, and instant lease button.

## 4. Verification & QA Status
- Frontend tests passed (100% success rate in `iteration_11.json`).
- All tabs (Home, Services, Orders, Rent) tested in mobile (390x844) and desktop (1920x800).
- Zero horizontal scroll overflow.
- Existing pages (`/`, `/marketplace`, `/login`, etc.) remain 100% intact and functional.
