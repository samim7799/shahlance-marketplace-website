// Accounts Marketplace catalog (buyer-side browsing). Additive & self-contained:
// does not touch the backend product catalog, checkout, or payment modules.

export const ACCOUNT_CATEGORIES = [
  { id: 'social-media', name: 'Social Media Accounts', icon: 'Users', color: 'from-pink-500 to-rose-500', blurb: 'Aged & verified Instagram, TikTok, X and Facebook profiles.' },
  { id: 'email', name: 'Email Accounts', icon: 'Mail', color: 'from-red-500 to-orange-500', blurb: 'PVA Gmail, Outlook, ProtonMail and bulk mailboxes.' },
  { id: 'advertising', name: 'Advertising Accounts', icon: 'Megaphone', color: 'from-blue-600 to-indigo-600', blurb: 'Ready-to-run Google, Meta, TikTok and Snap ad accounts.' },
  { id: 'payment-finance', name: 'Payment & Finance Accounts', icon: 'CreditCard', color: 'from-emerald-500 to-teal-500', blurb: 'Verified Stripe, PayPal, Wise and Payoneer accounts.' },
  { id: 'crypto-web3', name: 'Crypto & Web3', icon: 'Bitcoin', color: 'from-amber-500 to-orange-500', blurb: 'KYC-verified exchange accounts and aged wallets.' },
  { id: 'ecommerce', name: 'E-commerce Accounts', icon: 'ShoppingBag', color: 'from-orange-500 to-amber-500', blurb: 'Amazon, Shopify, eBay and Etsy stores ready to sell.' },
  { id: 'gaming', name: 'Gaming Accounts', icon: 'Gamepad2', color: 'from-violet-500 to-purple-500', blurb: 'Ranked, high-level and rare-skin gaming accounts.' },
  { id: 'creator', name: 'Creator Accounts', icon: 'Video', color: 'from-fuchsia-500 to-pink-500', blurb: 'Monetized YouTube, Twitch and Patreon creator accounts.' },
  { id: 'ai-software', name: 'AI & Software Accounts', icon: 'Bot', color: 'from-cyan-500 to-blue-500', blurb: 'ChatGPT Plus, Midjourney, Adobe and dev tool access.' },
  { id: 'website-assets', name: 'Website & Digital Assets', icon: 'Globe', color: 'from-teal-500 to-cyan-500', blurb: 'Aged domains, turnkey sites and digital properties.' },
  { id: 'community', name: 'Community Accounts', icon: 'MessageCircle', color: 'from-indigo-500 to-violet-500', blurb: 'Telegram channels, Discord servers and Reddit accounts.' },
  { id: 'dating-lifestyle', name: 'Dating & Lifestyle', icon: 'Heart', color: 'from-rose-500 to-pink-500', blurb: 'Premium and verified dating & lifestyle accounts.' },
  { id: 'others', name: 'Others / Custom Accounts', icon: 'Sparkles', color: 'from-slate-500 to-zinc-500', blurb: 'LinkedIn, streaming and made-to-order custom accounts.' },
];

// Compact tuples expanded into full listing objects below.
// [title, price, priceLabel, rating, reviews, icon, badge]
const RAW = {
  'social-media': [
    ['Instagram Aged Account — 10K Real Followers', 89, 'per account', 4.9, 421, 'Camera', 'Bestseller'],
    ['TikTok Verified Creator Account (Aged)', 129, 'per account', 4.8, 210, 'Music2', 'Top Rated'],
    ['X / Twitter Aged Account (2015-2019)', 45, 'per account', 4.7, 318, 'Twitter'],
    ['Facebook Aged Profile — Friend-Ready', 22, 'per account', 4.6, 264, 'Facebook'],
  ],
  email: [
    ['Aged Gmail Accounts (2018-2020) Bulk Pack', 4.5, 'per account', 4.9, 512, 'Mail', 'Bestseller'],
    ['Outlook / Hotmail Aged Accounts (PVA)', 3.2, 'per account', 4.7, 289, 'Mail'],
    ['ProtonMail Encrypted Accounts', 6.0, 'per account', 4.8, 142, 'ShieldCheck'],
    ['Bulk Email Accounts — Mixed Providers (100x)', 39, 'per pack', 4.6, 176, 'Inbox'],
  ],
  advertising: [
    ['Google Ads Verified Account (Threshold Ready)', 149, 'per account', 4.8, 187, 'BarChart3', 'Top Rated'],
    ['Facebook Business Manager — Verified', 349, 'per BM', 4.8, 156, 'Building2', 'Verified'],
    ['TikTok Ads Agency Account', 199, 'per account', 4.7, 98, 'Music2'],
    ['Snapchat Ads Account (Funded)', 129, 'per account', 4.6, 64, 'Ghost'],
  ],
  'payment-finance': [
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
  ecommerce: [
    ['Amazon Seller Central — Verified', 299, 'per account', 4.8, 176, 'ShoppingBag', 'Top Rated'],
    ['Shopify Store — Launch Ready + Theme', 149, 'per store', 4.9, 234, 'Store', 'Bestseller'],
    ['eBay Aged Selling Account (High Limits)', 129, 'per account', 4.6, 156, 'ShoppingCart'],
    ['Etsy Shop — Established with Reviews', 99, 'per shop', 4.7, 128, 'Palette'],
  ],
  gaming: [
    ['Steam Account — Level 30, 50+ Games', 79, 'per account', 4.8, 512, 'Gamepad2', 'Bestseller'],
    ['Valorant Ranked Account (Immortal)', 129, 'per account', 4.7, 289, 'Crosshair'],
    ['Fortnite Account — Rare Skins Vault', 199, 'per account', 4.9, 341, 'Gamepad2', 'Top Rated'],
    ['League of Legends — Diamond, All Champs', 89, 'per account', 4.6, 198, 'Swords'],
  ],
  creator: [
    ['YouTube Monetized Channel — 4K Watch Hours', 399, 'per channel', 4.9, 143, 'Youtube', 'Top Rated'],
    ['Twitch Affiliate Account (Aged)', 149, 'per account', 4.7, 176, 'Twitch'],
    ['Patreon Creator Account — Active', 89, 'per account', 4.6, 92, 'Heart'],
    ['Medium Partner Program Account', 59, 'per account', 4.5, 64, 'BookOpen'],
  ],
  'ai-software': [
    ['ChatGPT Plus Account (1 Year)', 79, 'per account', 4.9, 892, 'Bot', 'Bestseller'],
    ['Midjourney Standard Plan Account', 39, 'per account', 4.8, 445, 'Sparkles'],
    ['Adobe Creative Cloud — All Apps', 89, 'per year', 4.7, 312, 'Palette'],
    ['GitHub Copilot + Pro Account', 45, 'per account', 4.8, 189, 'Github'],
  ],
  'website-assets': [
    ['Aged Domain — DA30+ Clean Backlinks', 129, 'per domain', 4.7, 98, 'Globe', 'Top Rated'],
    ['Turnkey Blog Website (Traffic Ready)', 249, 'per site', 4.8, 76, 'FileText'],
    ['SaaS Starter Web App (Deployed)', 499, 'per project', 4.9, 54, 'Code2', 'Verified'],
    ['Premium Web3 / NFT Domain', 89, 'per domain', 4.5, 42, 'Boxes'],
  ],
  community: [
    ['Telegram Channel — 50K Real Members', 299, 'per channel', 4.8, 267, 'Send', 'Bestseller'],
    ['Discord Server — 20K Active Members', 199, 'per server', 4.7, 176, 'MessageCircle'],
    ['Reddit Aged Account — High Karma', 39, 'per account', 4.6, 421, 'MessageSquare'],
    ['WhatsApp Group Pack (Targeted)', 49, 'per pack', 4.5, 132, 'MessageCircle'],
  ],
  'dating-lifestyle': [
    ['Tinder Gold Aged Account', 45, 'per account', 4.6, 289, 'Flame', 'Bestseller'],
    ['Bumble Verified Account', 39, 'per account', 4.5, 176, 'Heart'],
    ['Match.com Premium Account', 49, 'per account', 4.4, 98, 'Heart'],
    ['OKCupid Established Account', 29, 'per account', 4.3, 64, 'Users'],
  ],
  others: [
    ['LinkedIn Aged Account — 500+ Connections', 69, 'per account', 4.7, 198, 'Linkedin', 'Top Rated'],
    ['Spotify Premium Account (1 Year)', 29, 'per account', 4.8, 512, 'Music'],
    ['Netflix Premium — 4K UHD Account', 39, 'per account', 4.7, 445, 'Tv'],
    ['Custom / Made-to-Order Account Request', 0, 'Custom quote', 4.9, 37, 'Sparkles', 'Custom'],
  ],
};

const SELLERS = ['ShahLance Verified', 'PrimeDigital', 'VaultAccounts', 'TrustedStore', 'EliteVendor'];

function catColor(catId) {
  return (ACCOUNT_CATEGORIES.find((c) => c.id === catId) || {}).color || 'from-slate-500 to-slate-600';
}

export const ACCOUNT_LISTINGS = Object.entries(RAW).flatMap(([catId, items]) =>
  items.map((it, i) => {
    const [title, price, priceLabel, rating, reviews, icon, badge] = it;
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
    };
  })
);

const CATEGORY_GETS = {
  'social-media': ['Full account ownership transfer', 'Login + recovery details', 'Email changeable after handover', '48-hour replacement warranty'],
  email: ['Login credentials delivered instantly', 'Recovery info included', 'Phone-verified (where applicable)', 'Replacement on non-working accounts'],
  advertising: ['Verified & threshold-ready account', 'Setup guidance included', 'Payment method attach guide', 'Anti-ban usage tips'],
  'payment-finance': ['Fully verified account', 'Payouts / withdrawals enabled', 'Secure ownership transfer', 'Onboarding support'],
  'crypto-web3': ['KYC-verified & clean history', 'Full credentials + 2FA reset', 'Withdrawal enabled', 'Handover support'],
  ecommerce: ['Store / seller account access', 'High selling limits (where noted)', 'Theme / setup included (Shopify)', 'Transfer guidance'],
  gaming: ['Full account with email access', 'Original owner details', 'Region-free (where noted)', 'Warranty on hijack claims'],
  creator: ['Monetization / partner status', 'Full channel ownership', 'Analytics access', 'Handover walkthrough'],
  'ai-software': ['Active subscription access', 'Login credentials', 'Renewal guidance', 'Replacement on lockout'],
  'website-assets': ['Full asset / domain transfer', 'Registrar or hosting access', 'Clean backlink profile', 'Migration help'],
  community: ['Admin ownership transfer', 'Member base included', 'Handover of controls', 'Growth tips'],
  'dating-lifestyle': ['Premium / verified status', 'Login credentials', 'Email changeable', 'Replacement warranty'],
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
