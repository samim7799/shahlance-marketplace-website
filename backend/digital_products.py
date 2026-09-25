"""Digital Product Management module (Subscriptions & Gift Cards) for Admin.
Provides minimal CRUD for:
1. Subscription Management:
   - Categories (Add, Edit, Delete)
   - Products (Add, Edit, Delete, Image, Description, Category)
   - Plans (Plan name, Duration, Price, Status ON/OFF)
   - Orders list (User, Product, Plan, Price, Order status)
2. Gift Card Management:
   - Brands (Add, Edit, Delete)
   - Gift Cards (Image, Description, Stock quantity, Pricing, Status ON/OFF)
   - Orders list (User, Brand, Amount, Order status, Delivery status)
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_doc(doc: Optional[dict]) -> Optional[dict]:
    if not doc:
        return None
    d = dict(doc)
    d.pop('_id', None)
    return d


# ---------------------------------------------------------------------------
# Seed initial sample data if empty
# ---------------------------------------------------------------------------
async def ensure_initial_seed(db):
    # Subscriptions Categories
    if await db.digital_subscription_categories.count_documents({}) == 0:
        await db.digital_subscription_categories.insert_many([
            {'id': 'subcat_ai', 'name': 'AI & Productivity', 'description': 'AI tools and premium software', 'createdAt': now_iso()},
            {'id': 'subcat_stream', 'name': 'Streaming & Media', 'description': 'Entertainment and music streaming', 'createdAt': now_iso()},
            {'id': 'subcat_dev', 'name': 'Developer & Cloud', 'description': 'Cloud servers and dev licenses', 'createdAt': now_iso()},
        ])

    # Subscriptions Products & Plans
    if await db.digital_subscription_products.count_documents({}) == 0:
        await db.digital_subscription_products.insert_one({
            'id': 'subprod_001',
            'title': 'AI Content Suite Pro',
            'description': 'Unlimited AI copy, image generation, and workflow automation suite.',
            'categoryId': 'subcat_ai',
            'categoryName': 'AI & Productivity',
            'image': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
            'plans': [
                {'id': 'plan_1m', 'name': 'Monthly Pass', 'duration': '1 Month', 'price': 19.99, 'status': 'ON'},
                {'id': 'plan_1y', 'name': 'Annual License', 'duration': '1 Year', 'price': 179.99, 'status': 'ON'},
            ],
            'createdAt': now_iso(),
            'updatedAt': now_iso(),
        })

    # Subscriptions Orders
    if await db.digital_subscription_orders.count_documents({}) == 0:
        await db.digital_subscription_orders.insert_one({
            'id': f"subord_{uuid.uuid4().hex[:8]}",
            'userEmail': 'qabuyer@example.com',
            'userName': 'QA Buyer',
            'productTitle': 'AI Content Suite Pro',
            'planName': 'Monthly Pass',
            'price': 19.99,
            'orderStatus': 'completed',
            'createdAt': now_iso(),
        })

    # Gift Card Brands
    if await db.digital_gift_card_brands.count_documents({}) == 0:
        await db.digital_gift_card_brands.insert_many([
            {'id': 'brand_apple', 'name': 'Apple Store & iTunes', 'logo': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300', 'description': 'Apple digital gift card for apps and hardware', 'createdAt': now_iso()},
            {'id': 'brand_amazon', 'name': 'Amazon Shopping', 'logo': 'https://images.unsplash.com/photo-1523474255658-4af61b168344?w=300', 'description': 'Amazon gift voucher code', 'createdAt': now_iso()},
            {'id': 'brand_steam', 'name': 'Steam Wallet', 'logo': 'https://images.unsplash.com/photo-1612287233207-6b3a27c7f3b8?w=300', 'description': 'Steam games and in-game wallet card', 'createdAt': now_iso()},
        ])

    # Gift Cards
    if await db.digital_gift_cards.count_documents({}) == 0:
        await db.digital_gift_cards.insert_one({
            'id': 'gc_001',
            'brandId': 'brand_apple',
            'brandName': 'Apple Store & iTunes',
            'image': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600',
            'description': '$50 Digital Apple code with instant code delivery.',
            'stock': 45,
            'price': 50.00,
            'status': 'ON',
            'createdAt': now_iso(),
            'updatedAt': now_iso(),
        })

    # Gift Card Orders
    if await db.digital_gift_card_orders.count_documents({}) == 0:
        await db.digital_gift_card_orders.insert_one({
            'id': f"gcord_{uuid.uuid4().hex[:8]}",
            'userEmail': 'qabuyer@example.com',
            'userName': 'QA Buyer',
            'brandName': 'Apple Store & iTunes',
            'amount': 50.00,
            'orderStatus': 'completed',
            'deliveryStatus': 'delivered',
            'createdAt': now_iso(),
        })
