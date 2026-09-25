"""Advanced Admin Tools module for ShahLance.
Provides:
1. CMS Management:
   - Logo (upload/replace URL, enable/disable)
   - Banner (upload/replace URL, heading, enable/disable)
   - Homepage Content (hero title, subtitle, CTA text)
   - Pages CRUD (Create, Edit, Delete, Publish/Unpublish)
2. Reports Dashboard:
   - Sales Report (Total sales, Order count)
   - Profit Report (Platform profit, Commission summary)
   - User Growth (Total users, New users)
   - Service Analytics (Service usage count, Order statistics)
3. Security Tools:
   - Admin Activity Logs (Action history)
   - Login History & IP Tracking (Admin login records with IP)
   - Two Factor Authentication (Enable/Disable admin 2FA setting)
"""
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_doc(doc: Optional[dict]) -> Optional[dict]:
    if not doc:
        return None
    d = dict(doc)
    d.pop('_id', None)
    return d


DEFAULT_CMS_SETTINGS = {
    'id': 'site_cms_settings',
    'logo': {
        'url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        'enabled': True,
    },
    'banner': {
        'url': 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
        'enabled': True,
        'heading': 'Welcome to ShahLance Marketplace',
        'subheading': 'Verified Digital Products, Developer Toolkits & Secure Services',
    },
    'homepageContent': {
        'heroTitle': 'The Next-Gen Digital Commerce Platform',
        'heroSubtitle': 'Buy, sell, and deploy verified digital assets, accounts, software licenses, and cloud tools with built-in fraud protection.',
        'featuredBadge': 'Verified 2026 Release',
        'ctaText': 'Explore Catalog',
    },
    'updatedAt': now_iso(),
    'updatedBy': 'system',
}

DEFAULT_SECURITY_SETTINGS = {
    'id': 'admin_security_settings',
    'twoFactorAuthEnabled': False,
    'ipWhitelist': [],
    'updatedAt': now_iso(),
    'updatedBy': 'system',
}


async def ensure_initial_seed(db):
    # 1. CMS Settings
    if not await db.cms_settings.find_one({'id': 'site_cms_settings'}):
        await db.cms_settings.insert_one(dict(DEFAULT_CMS_SETTINGS))

    # 2. CMS Pages
    if await db.cms_pages.count_documents({}) == 0:
        await db.cms_pages.insert_many([
            {
                'id': 'page_terms',
                'slug': 'terms-of-service',
                'title': 'Terms of Service',
                'content': 'Welcome to ShahLance. By using our platform, you agree to comply with our verified digital marketplace standards, buyer protection policies, and fraud security measures.',
                'status': 'published',
                'createdAt': now_iso(),
                'updatedAt': now_iso(),
            },
            {
                'id': 'page_privacy',
                'slug': 'privacy-policy',
                'title': 'Privacy & Security Policy',
                'content': 'We prioritize customer privacy. All transactions, tokens, and communications are safeguarded using enterprise-grade encryption and device fraud isolation.',
                'status': 'published',
                'createdAt': now_iso(),
                'updatedAt': now_iso(),
            },
            {
                'id': 'page_faq',
                'slug': 'faq-buyer-protection',
                'title': 'Buyer Protection FAQ',
                'content': 'Learn about our escrow-grade order verification, instant download delivery, and 24/7 resolution support.',
                'status': 'draft',
                'createdAt': now_iso(),
                'updatedAt': now_iso(),
            },
        ])

    # 3. Security Settings
    if not await db.security_settings.find_one({'id': 'admin_security_settings'}):
        await db.security_settings.insert_one(dict(DEFAULT_SECURITY_SETTINGS))

    # 4. Activity Logs & Login History initial entries
    if await db.admin_activity_logs.count_documents({}) == 0:
        await db.admin_activity_logs.insert_many([
            {
                'id': f"act_{uuid.uuid4().hex[:8]}",
                'adminEmail': 'rajavai247@gmail.com',
                'action': 'System Initialization',
                'details': 'Loaded ShahLance platform and verified core configurations',
                'ipAddress': '127.0.0.1',
                'createdAt': now_iso(),
            },
            {
                'id': f"act_{uuid.uuid4().hex[:8]}",
                'adminEmail': 'rajavai247@gmail.com',
                'action': 'Configured Commission System',
                'details': 'Verified 20% platform commission rate and product breakdown',
                'ipAddress': '192.168.1.104',
                'createdAt': now_iso(),
            },
        ])

    if await db.admin_login_history.count_documents({}) == 0:
        await db.admin_login_history.insert_many([
            {
                'id': f"log_{uuid.uuid4().hex[:8]}",
                'adminEmail': 'rajavai247@gmail.com',
                'ipAddress': '127.0.0.1',
                'userAgent': 'Mozilla/5.0 Chrome/128.0 (Playwright)',
                'status': 'success',
                'createdAt': now_iso(),
            },
            {
                'id': f"log_{uuid.uuid4().hex[:8]}",
                'adminEmail': 'rajavai247@gmail.com',
                'ipAddress': '10.79.165.11',
                'userAgent': 'Mozilla/5.0 AppleWebKit (Admin Console)',
                'status': 'success',
                'createdAt': now_iso(),
            },
        ])
