// Accounts Marketplace catalog (buyer-side browsing). Additive & self-contained:
// does not touch the backend product catalog, checkout, or payment modules.

export const ACCOUNT_CATEGORIES = [
  { id: 'social-media', name: 'Social Media', icon: 'Users', color: 'from-pink-500 to-rose-500', blurb: 'Aged & verified Instagram, TikTok, YouTube, X and more.' },
  { id: 'email', name: 'Email Accounts', icon: 'Mail', color: 'from-red-500 to-orange-500', blurb: 'PVA Gmail, Outlook, ProtonMail and bulk mailboxes.' },
  { id: 'ecommerce', name: 'E-commerce', icon: 'ShoppingBag', color: 'from-orange-500 to-amber-500', blurb: 'Amazon, Shopify, eBay and Etsy stores ready to sell.' },
  { id: 'ads', name: 'Ads Accounts', icon: 'Megaphone', color: 'from-blue-600 to-indigo-600', blurb: 'Ready-to-run Google, Meta, TikTok and Snap ad accounts.' },
  { id: 'ai-software', name: 'AI & Software', icon: 'Bot', color: 'from-cyan-500 to-blue-500', blurb: 'ChatGPT Plus, Midjourney, Adobe and dev tool access.' },
  { id: 'payment-gateway', name: 'Payment Gateway', icon: 'CreditCard', color: 'from-emerald-500 to-teal-500', blurb: 'Verified Stripe, PayPal, Wise and Payoneer accounts.' },
  { id: 'crypto-web3', name: 'Crypto & Web3', icon: 'Bitcoin', color: 'from-amber-500 to-orange-500', blurb: 'KYC-verified exchange accounts and aged wallets.' },
  { id: 'dating', name: 'Dating Accounts', icon: 'Heart', color: 'from-rose-500 to-pink-500', blurb: 'Premium and verified dating accounts.' },
  { id: 'creator', name: 'Creator Accounts', icon: 'Video', color: 'from-fuchsia-500 to-pink-500', blurb: 'Monetized YouTube, Twitch and Patreon creator accounts.' },
  { id: 'groups-channels', name: 'Groups & Channels', icon: 'MessageCircle', color: 'from-indigo-500 to-violet-500', blurb: 'Telegram channels, Discord servers and Reddit accounts.' },
  { id: 'web-assets', name: 'Web & Digital Assets', icon: 'Globe', color: 'from-teal-500 to-cyan-500', blurb: 'Aged domains, turnkey sites and digital properties.' },
  { id: 'gaming', name: 'Gaming Accounts', icon: 'Gamepad2', color: 'from-violet-500 to-purple-500', blurb: 'Ranked, high-level and rare-skin gaming accounts.' },
  { id: 'business', name: 'Business Accounts', icon: 'Building2', color: 'from-sky-500 to-blue-600', blurb: 'Verified business, LinkedIn and agency accounts.' },
  { id: 'streaming', name: 'Streaming Accounts', icon: 'Tv', color: 'from-red-500 to-rose-600', blurb: 'Netflix, Spotify, Disney+ and premium streaming.' },
  { id: 'tools-services', name: 'Tools & Services', icon: 'Wrench', color: 'from-lime-500 to-green-600', blurb: 'SEO tools, VPNs, proxies and productivity services.' },
  { id: 'others', name: 'Others / Custom', icon: 'Sparkles', color: 'from-slate-500 to-zinc-500', blurb: 'Made-to-order and custom account requests.' },
];

// [title, price, priceLabel, rating, reviews, icon, badge, extra?]
const RAW = {
  'social-media': [
    ['Instagram Aged Account — 10K Real Followers', 89, 'per account', 4.9, 421, 'Instagram', 'Bestseller', { platform: 'Instagram', followers: '10K followers', verified: true }],
    ['Instagram Influencer Account — 100K Followers', 499, 'per account', 4.8, 132, 'Instagram', 'Top Rated', { platform: 'Instagram', followers: '100K followers', verified: true }],
    ['TikTok Creator Account — 50K Followers', 199, 'per account', 4.8, 210, 'Music2', null, { platform: 'TikTok', followers: '50K followers', verified: true }],
    ['TikTok Aged Account — 5K Followers', 69, 'per account', 4.6, 148, 'Music2', null, { platform: 'TikTok', followers: '5K followers', verified: false }],
    ['YouTube Monetized Channel — 1.2K Subs', 399, 'per channel', 4.9, 96, 'Youtube', 'Top Rated', { platform: 'YouTube', followers: '1.2K subscribers', verified: true }],
    ['YouTube Gaming Channel — 25K Subs', 299, 'per channel', 4.7, 74, 'Youtube', null, { platform: 'YouTube', followers: '25K subscribers', verified: false }],
    ['Facebook Aged Profile — Friend-Ready', 22, 'per account', 4.6, 264, 'Facebook', null, { platform: 'Facebook', followers: '2K friends', verified: false }],
    ['Facebook Page — 30K Likes', 129, 'per page', 4.7, 118, 'Facebook', null, { platform: 'Facebook', followers: '30K likes', verified: false }],
    ['X / Twitter Aged Account (2015-2019)', 45, 'per account', 4.7, 318, 'Twitter', null, { platform: 'X', followers: '3K followers', verified: false }],
    ['X Verified Blue Account', 79, 'per account', 4.7, 142, 'Twitter', null, { platform: 'X', followers: '8K followers', verified: true }],
    ['LinkedIn Aged Account — 500+ Connections', 69, 'per account', 4.7, 198, 'Linkedin', 'Top Rated', { platform: 'LinkedIn', followers: '500+ connections', verified: true }],
    ['LinkedIn Company Page — Established', 99, 'per page', 4.6, 87, 'Linkedin', null, { platform: 'LinkedIn', followers: '1.2K followers', verified: false }],
    ['Discord Server — 20K Active Members', 199, 'per server', 4.7, 176, 'MessageCircle', null, { platform: 'Discord', followers: '20K members', verified: false }],
    ['Telegram Channel — 50K Real Members', 299, 'per channel', 4.8, 267, 'Send', 'Bestseller', { platform: 'Telegram', followers: '50K members', verified: true }],
    ['Snapchat Aged Account', 39, 'per account', 4.5, 92, 'Ghost', null, { platform: 'Other', followers: '4K friends', verified: false }],
    ['Pinterest Business Account', 49, 'per account', 4.5, 64, 'Image', null, { platform: 'Other', followers: '6K followers', verified: false }],
  ],
  email: [
    ['Aged Gmail Accounts (2018-2020) Bulk Pack', 4.5, 'per account', 4.9, 512, 'Mail', 'Bestseller'],
    ['Outlook / Hotmail Aged Accounts (PVA)', 3.2, 'per account', 4.7, 289, 'Mail'],
    ['ProtonMail Encrypted Accounts', 6.0, 'per account', 4.8, 142, 'ShieldCheck'],
    ['Bulk Email Accounts — Mixed Providers (100x)', 39, 'per pack', 4.6, 176, 'Inbox'],
  ],
  ecommerce: [
    ['Amazon Seller Central — Verified', 299, 'per account', 4.8, 176, 'ShoppingBag', 'Top Rated'],
    ['Shopify Store — Launch Ready + Theme', 149, 'per store', 4.9, 234, 'Store', 'Bestseller'],
    ['eBay Aged Selling Account (High Limits)', 129, 'per account', 4.6, 156, 'ShoppingCart'],
    ['Etsy Shop — Established with Reviews', 99, 'per shop', 4.7, 128, 'Palette'],
  ],
  ads: [
    ['Google Ads Verified Account (Threshold Ready)', 149, 'per account', 4.8, 187, 'BarChart3', 'Top Rated'],
    ['Facebook Business Manager — Verified', 349, 'per BM', 4.8, 156, 'Building2', 'Verified'],
    ['TikTok Ads Agency Account', 199, 'per account', 4.7, 98, 'Music2'],
    ['Snapchat Ads Account (Funded)', 129, 'per account', 4.6, 64, 'Ghost'],
  ],
  'ai-software': [
    ['ChatGPT Plus Account (1 Year)', 79, 'per account', 4.9, 892, 'Bot', 'Bestseller'],
    ['Midjourney Standard Plan Account', 39, 'per account', 4.8, 445, 'Sparkles'],
    ['Adobe Creative Cloud — All Apps', 89, 'per year', 4.7, 312, 'Palette'],
    ['GitHub Copilot + Pro Account', 45, 'per account', 4.8, 189, 'Github'],
  ],
  'payment-gateway': [
    ['Stripe Verified Account (Payouts Enabled)', 249, 'per account', 4.9, 143, 'CreditCard', 'Verified'],
    ['PayPal Business Verified Account', 129, 'per account', 4.7, 402, 'Wallet', 'Bestseller'],
    ['Wise Multi-Currency Verified Account', 99, 'per account', 4.8, 231, 'Landmark'],
    ['Payoneer Verified Account + Card', 119, 'per account', 4.6, 178, 'CreditCard'],
  ],
  'crypto-web3': [
    ['Binance KYC-Verified Account', 119, 'per account', 4.8, 512, 'Bitcoin', 'Bestseller'],
    ['Coinbase Verified Account', 99, 'per account', 4.7, 341, 'Coins'],
    ['Aged MetaMask Wallet (Clean History)', 45, 'per wallet', 4.6, 189, 'Wallet'],
    ['OKX KYC-Verified Account', 89, 'per account', 4.7, 142, 'Bitcoin'],
  ],
  dating: [
    ['Tinder Gold Aged Account', 45, 'per account', 4.6, 289, 'Flame', 'Bestseller'],
    ['Bumble Verified Account', 39, 'per account', 4.5, 176, 'Heart'],
    ['Match.com Premium Account', 49, 'per account', 4.4, 98, 'Heart'],
    ['OKCupid Established Account', 29, 'per account', 4.3, 64, 'Users'],
  ],
  creator: [
    ['YouTube Monetized Channel — 4K Watch Hours', 399, 'per channel', 4.9, 143, 'Youtube', 'Top Rated'],
    ['Twitch Affiliate Account (Aged)', 149, 'per account', 4.7, 176, 'Twitch'],
    ['Patreon Creator Account — Active', 89, 'per account', 4.6, 92, 'Heart'],
    ['Medium Partner Program Account', 59, 'per account', 4.5, 64, 'BookOpen'],
  ],
  'groups-channels': [
    ['Telegram Channel — 50K Real Members', 299, 'per channel', 4.8, 267, 'Send', 'Bestseller'],
    ['Discord Server — 20K Active Members', 199, 'per server', 4.7, 176, 'MessageCircle'],
    ['Reddit Aged Account — High Karma', 39, 'per account', 4.6, 421, 'MessageSquare'],
    ['WhatsApp Group Pack (Targeted)', 49, 'per pack', 4.5, 132, 'MessageCircle'],
  ],
  'web-assets': [
    ['Aged Domain — DA30+ Clean Backlinks', 129, 'per domain', 4.7, 98, 'Globe', 'Top Rated'],
    ['Turnkey Blog Website (Traffic Ready)', 249, 'per site', 4.8, 76, 'FileText'],
    ['SaaS Starter Web App (Deployed)', 499, 'per project', 4.9, 54, 'Code2', 'Verified'],
    ['Premium Web3 / NFT Domain', 89, 'per domain', 4.5, 42, 'Boxes'],
  ],
  gaming: [
    ['Steam Account — Level 30, 50+ Games', 79, 'per account', 4.8, 512, 'Gamepad2', 'Bestseller'],
    ['Valorant Ranked Account (Immortal)', 129, 'per account', 4.7, 289, 'Crosshair'],
    ['Fortnite Account — Rare Skins Vault', 199, 'per account', 4.9, 341, 'Gamepad2', 'Top Rated'],
    ['League of Legends — Diamond, All Champs', 89, 'per account', 4.6, 198, 'Swords'],
  ],
  business: [
    ['Verified Google Business Profile', 129, 'per account', 4.7, 88, 'Building2', 'Top Rated'],
    ['Registered LLC Business Account Pack', 349, 'per account', 4.8, 42, 'Briefcase', 'Verified'],
    ['Aged Agency Account — Ready to Scale', 249, 'per account', 4.6, 57, 'Building2'],
    ['Trustpilot Business Account (Reviews)', 99, 'per account', 4.5, 63, 'Star'],
  ],
  streaming: [
    ['Netflix Premium — 4K UHD Account', 39, 'per account', 4.7, 445, 'Tv', 'Bestseller'],
    ['Spotify Premium Account (1 Year)', 29, 'per account', 4.8, 512, 'Music'],
    ['Disney+ Bundle Account', 35, 'per account', 4.6, 176, 'Clapperboard'],
    ['Prime Video + Prime Account', 32, 'per account', 4.5, 143, 'Film'],
  ],
  'tools-services': [
    ['SEO Tools Group Buy Access (Ahrefs+)', 25, 'per month', 4.7, 231, 'Wrench', 'Bestseller'],
    ['Premium VPN Account (2 Years)', 39, 'per account', 4.6, 298, 'ShieldCheck'],
    ['Residential Proxy Pack (10 IPs)', 49, 'per pack', 4.5, 132, 'Network'],
    ['Canva Pro Team Account (1 Year)', 29, 'per account', 4.7, 187, 'Palette'],
  ],
  others: [
    ['Spotify Premium Account (1 Year)', 29, 'per account', 4.8, 512, 'Music'],
    ['Custom / Made-to-Order Account Request', 0, 'Custom quote', 4.9, 37, 'Sparkles', 'Custom'],
    ['Bulk Mixed Accounts — Custom Spec', 59, 'per pack', 4.6, 76, 'Boxes'],
  ],
};

const SELLERS = ['ShahLance Verified', 'PrimeDigital', 'VaultAccounts', 'TrustedStore', 'EliteVendor'];

function catColor(catId) {
  return (ACCOUNT_CATEGORIES.find((c) => c.id === catId) || {}).color || 'from-slate-500 to-slate-600';
}

export const ACCOUNT_LISTINGS = Object.entries(RAW).flatMap(([catId, items]) =>
  items.map((it, i) => {
    const [title, price, priceLabel, rating, reviews, icon, badge, extra] = it;
    return {
      id: `a-${catId}-${i + 1}`,
      category: catId,
      title,
      price,
      priceLabel,
      rating,
      reviews,
      icon,
      color: catColor(catId),
      badge: badge || null,
      seller: SELLERS[(i + catId.length) % SELLERS.length],
      deliveryDays: price === 0 ? 3 : (i % 2 === 0 ? 1 : 2),
      stock: 3 + ((i * 7 + catId.length) % 20),
      description: `${title}. Full ownership transfer with secure escrow protection and post-delivery support.`,
      ...(extra || {}),
    };
  })
);

// Social platform filters for the dedicated Social Media listing page
export const SOCIAL_PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X', 'LinkedIn', 'Discord', 'Telegram', 'Other'];

export function getSocialListings() {
  return ACCOUNT_LISTINGS.filter((l) => l.category === 'social-media');
}

const CATEGORY_GETS = {
  'social-media': ['Full account ownership transfer', 'Login + recovery details', 'Email changeable after handover', '48-hour replacement warranty'],
  email: ['Login credentials delivered instantly', 'Recovery info included', 'Phone-verified (where applicable)', 'Replacement on non-working accounts'],
  ecommerce: ['Store / seller account access', 'High selling limits (where noted)', 'Theme / setup included (Shopify)', 'Transfer guidance'],
  ads: ['Verified & threshold-ready account', 'Setup guidance included', 'Payment method attach guide', 'Anti-ban usage tips'],
  'ai-software': ['Active subscription access', 'Login credentials', 'Renewal guidance', 'Replacement on lockout'],
  'payment-gateway': ['Fully verified account', 'Payouts / withdrawals enabled', 'Secure ownership transfer', 'Onboarding support'],
  'crypto-web3': ['KYC-verified & clean history', 'Full credentials + 2FA reset', 'Withdrawal enabled', 'Handover support'],
  dating: ['Premium / verified status', 'Login credentials', 'Email changeable', 'Replacement warranty'],
  creator: ['Monetization / partner status', 'Full channel ownership', 'Analytics access', 'Handover walkthrough'],
  'groups-channels': ['Admin ownership transfer', 'Member base included', 'Handover of controls', 'Growth tips'],
  'web-assets': ['Full asset / domain transfer', 'Registrar or hosting access', 'Clean backlink profile', 'Migration help'],
  gaming: ['Full account with email access', 'Original owner details', 'Region-free (where noted)', 'Warranty on hijack claims'],
  business: ['Verified business account', 'Full ownership documents', 'Secure handover', 'Onboarding support'],
  streaming: ['Active premium subscription', 'Login credentials', 'Renewal guidance', 'Replacement on lockout'],
  'tools-services': ['Active access / license', 'Usage instructions', 'Renewal guidance', 'Support included'],
  others: ['Delivered per listing spec', 'Secure escrow handover', 'Post-sale support', 'Custom options on request'],
};

export function getAccountListing(id) {
  return ACCOUNT_LISTINGS.find((l) => l.id === id) || null;
}

export function getAccountCategory(id) {
  return ACCOUNT_CATEGORIES.find((c) => c.id === id) || null;
}

export function getListingFeatures(listing) {
  return CATEGORY_GETS[listing.category] || CATEGORY_GETS.others;
}

// --- Premium / trust helpers (additive, deterministic from listing data) ---
function seedOf(listing) {
  return (listing.reviews || 0) + (listing.title ? listing.title.length : 0) + (listing.stock || 0);
}

export function getSellerMeta(listing) {
  const s = seedOf(listing);
  return {
    name: listing.seller,
    verified: true,
    rating: Math.min(5, 4.6 + ((s % 4) * 0.1)),
    sales: 320 + ((s * 37) % 5200),
    responseHours: 1 + (s % 6),
    memberSince: 2018 + (s % 6),
    topRated: (s % 3 === 0),
  };
}

export function getListingStats(listing) {
  const s = seedOf(listing);
  return {
    sold: 40 + ((s * 13) % 940),
    viewing: 3 + (s % 18),
    lastSoldHrs: 1 + (s % 22),
    lowStock: (listing.stock || 0) > 0 && (listing.stock || 0) <= 6,
  };
}

export const ACCOUNTS_ESCROW_STEPS = [
  { icon: 'Wallet', title: 'You pay into escrow', desc: 'Your money is held securely by ShahLance — the seller cannot access it yet.' },
  { icon: 'Send', title: 'Seller delivers the account', desc: 'You receive the login and full ownership details, privately and securely.' },
  { icon: 'ShieldCheck', title: 'You confirm, funds release', desc: 'Only once you verify the account works is payment released to the seller.' },
];

export const ACCOUNTS_GUARANTEES = [
  { icon: 'RefreshCw', title: 'Replacement warranty', desc: 'Free replacement if the account stops working within the warranty window.' },
  { icon: 'Undo2', title: 'Money-back protection', desc: 'Full refund if the account is never delivered or is not as described.' },
  { icon: 'BadgeCheck', title: 'Identity-checked sellers', desc: 'Every account seller is KYC-verified before they can list.' },
  { icon: 'Lock', title: 'Private, secure handover', desc: 'Credentials are shared through a protected channel — never public.' },
];

export const ACCOUNTS_FAQ = [
  { q: 'How do I receive the account after buying?', a: 'After escrow payment, the seller privately shares the login and recovery details. Most accounts are handed over within the stated delivery time.' },
  { q: 'What if the account does not work?', a: 'Funds stay in escrow until you confirm it works. If there is a problem, you can request a replacement or a refund before releasing payment.' },
  { q: 'Can I change the email and password?', a: 'Yes. For most listings you receive full ownership and can update the email, password and 2FA after handover.' },
  { q: 'Is buying accounts safe here?', a: 'Every seller is identity-verified, payments are escrow-protected, and handovers happen through a secure channel with post-sale support.' },
];

export const ACCOUNTS_MARKETPLACE_STATS = [
  { icon: 'Layers', value: '12,400+', label: 'Accounts delivered' },
  { icon: 'Star', value: '4.9/5', label: 'Average buyer rating' },
  { icon: 'ShieldCheck', value: '100%', label: 'Escrow protected' },
  { icon: 'Zap', value: '1–2 days', label: 'Typical handover' },
];

// --- Payment UI preparation (UI only — no real gateway connected) ---
export const PAYMENT_METHODS = {
  crypto: [
    { id: 'cryptomus', name: 'Cryptomus', note: 'Automatic', icon: 'Zap' },
    { id: 'usdt-trc20', name: 'USDT TRC20', icon: 'Coins' },
    { id: 'usdt-bep20', name: 'USDT BEP20', icon: 'Coins' },
    { id: 'usdt-erc20', name: 'USDT ERC20', icon: 'Coins' },
    { id: 'usdt-ton', name: 'USDT TON', icon: 'Coins' },
    { id: 'usdt-sol', name: 'USDT Solana', icon: 'Coins' },
    { id: 'btc', name: 'Bitcoin (BTC)', icon: 'Bitcoin' },
    { id: 'ltc', name: 'Litecoin (LTC)', icon: 'Coins' },
  ],
  fiat: [
    { id: 'bkash', name: 'bKash', icon: 'Smartphone' },
    { id: 'nagad', name: 'Nagad', icon: 'Smartphone' },
    { id: 'bank', name: 'Bank Transfer', icon: 'Landmark' },
    { id: 'card', name: 'Visa / Card', icon: 'CreditCard' },
    { id: 'alipay', name: 'Alipay', icon: 'Wallet' },
    { id: 'wechat', name: 'WeChat Pay', icon: 'MessageCircle' },
  ],
};

// Demo payment details shown in the manual flow (placeholder only).
export const PAYMENT_DETAILS = {
  'usdt-trc20': { label: 'USDT TRC20 Address', value: 'TJShahLance9x8y7z6a5b4c3d2e1f0g9h8i7j6k' },
  'usdt-bep20': { label: 'USDT BEP20 Address', value: '0xShahLanceB1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6' },
  'usdt-erc20': { label: 'USDT ERC20 Address', value: '0xShahLanceE9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4' },
  'usdt-ton': { label: 'USDT TON Address', value: 'UQShahLanceToN_1a2b3c4d5e6f7g8h9i0j' },
  'usdt-sol': { label: 'USDT Solana Address', value: 'ShahLnceSoL1a2b3c4d5e6f7g8h9i0j1k2l3m' },
  btc: { label: 'BTC Address', value: 'bc1qshahlance0a1b2c3d4e5f6g7h8i9j0k1l2m3' },
  ltc: { label: 'LTC Address', value: 'ltc1qshahlance9z8y7x6w5v4u3t2s1r0q9p8o7' },
  cryptomus: { label: 'Cryptomus Invoice', value: 'Auto-generated at checkout (demo)' },
  bkash: { label: 'bKash (Personal)', value: '+880 1XXX-XXXXXX' },
  nagad: { label: 'Nagad (Personal)', value: '+880 1XXX-XXXXXX' },
  bank: { label: 'Bank Account', value: 'ShahLance Ltd · A/C 000123456789 · Routing 0001' },
  card: { label: 'Card Payment', value: 'Secure card link provided after order (demo)' },
  alipay: { label: 'Alipay ID', value: 'shahlance@pay.demo' },
  wechat: { label: 'WeChat Pay ID', value: 'ShahLance_Pay' },
};
