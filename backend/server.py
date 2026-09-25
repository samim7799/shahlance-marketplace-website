from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import logging
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import requests
import re
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File, Form
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest,
)

from catalog_seed import build_seed_products, CATEGORIES as SEED_CATEGORIES, CATEGORY_NAME_TO_ID
import email_service
import bonus_protection
import digital_products
import advanced_admin_tools

CATEGORY_COLOR = {c['id']: c['color'] for c in SEED_CATEGORIES}
CATEGORY_ICON = {c['id']: c['icon'] for c in SEED_CATEGORIES}
DEFAULT_FEATURES = [
    'Escrow protected payment',
    'Instant or same-day delivery',
    '30-day support included',
    'Money-back guarantee',
]

# ---------------------------------------------------------------------------
# Config & DB
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = 'HS256'
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@example.com').strip().lower()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY') or 'sk_test_emergent'

# Object storage
STORAGE_BASE = (os.environ.get('INTEGRATION_PROXY_URL') or '').strip() or 'https://integrations.emergentagent.com'
STORAGE_URL = STORAGE_BASE.rstrip('/') + '/objstore/api/v1/storage'
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')
APP_NAME = 'shahlance'
_storage_key = None

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        'sub': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7),
        'type': 'access',
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def sanitize_user(u: dict) -> dict:
    if not u:
        return u
    u = dict(u)
    u.pop('_id', None)
    u.pop('passwordHash', None)
    return u


async def get_optional_user(request: Request) -> Optional[dict]:
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({'id': payload['sub']})
        return sanitize_user(user) if user else None
    except Exception:
        return None


async def get_current_user(request: Request) -> dict:
    user = await get_optional_user(request)
    if not user:
        raise HTTPException(status_code=401, detail='Not authenticated')
    return user


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    return user


# ---- Object storage ----
def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterBody(BaseModel):
    fullName: str
    username: str
    email: EmailStr
    password: str
    phone: str = ''
    country: str = ''
    accountType: str = 'freelancer'
    profilePhoto: str = ''


class LoginBody(BaseModel):
    identifier: str
    password: str


class ForgotBody(BaseModel):
    email: EmailStr


class ChangePasswordBody(BaseModel):
    currentPassword: str
    newPassword: str


class OrderCreate(BaseModel):
    productId: str
    title: str
    sellerName: str
    sellerAvatar: str = ''
    price: float
    priceLabel: str = ''
    category: str = ''
    deliveryDays: int = 3
    note: str = ''


class StatusBody(BaseModel):
    status: str


class PaymentBody(BaseModel):
    paymentStatus: str


class ReviewCreate(BaseModel):
    productId: str
    productTitle: str = ''
    sellerName: str = ''
    orderId: str = ''
    rating: int = 5
    comment: str = ''


class HiddenBody(BaseModel):
    hidden: bool


class ToggleSavedBody(BaseModel):
    productId: str


class ApplicationCreate(BaseModel):
    sellerType: str
    data: dict = {}


class DecideBody(BaseModel):
    action: str
    reason: str = ''


class SellerProductCreate(BaseModel):
    title: str
    category: str
    isCustomCategory: bool = False
    price: float
    description: str
    image: str = ''
    fileId: str = ''
    fileName: str = ''


class WithdrawalCreate(BaseModel):
    amount: float
    method: str = 'Bank transfer'


class CheckoutBody(BaseModel):
    order_id: str
    origin_url: str


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "ShahLance API", "status": "ok"}


@api_router.post("/auth/register")
async def register(body: RegisterBody):
    email = body.email.strip().lower()
    username = body.username.strip().lower()
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail='Password must be at least 8 characters.')
    if await db.users.find_one({'email': email}):
        raise HTTPException(status_code=400, detail='An account with this email already exists.')
    if await db.users.find_one({'username': username}):
        raise HTTPException(status_code=400, detail='This username is already taken.')
    role = 'admin' if email == ADMIN_EMAIL else ('buyer' if body.accountType == 'client' else 'seller')
    user = {
        'id': f"u_{uuid.uuid4().hex[:12]}",
        'fullName': body.fullName.strip(),
        'username': username,
        'email': email,
        'phone': body.phone or '',
        'country': body.country or '',
        'accountType': body.accountType,
        'role': role,
        'profilePhoto': body.profilePhoto or '',
        'skills': [],
        'services': [],
        'company': {'name': '', 'website': '', 'industry': ''},
        'passwordHash': hash_password(body.password),
        'isEmailVerified': True if email == ADMIN_EMAIL else False,
        'isPhoneVerified': False,
        'bonusReceived': False,
        'bonusStatus': 'unclaimed',
        'isSuspicious': False,
        'createdAt': now_iso(),
        'updatedAt': now_iso(),
    }
    await db.users.insert_one(user)
    token = create_access_token(user['id'], email)
    return {'token': token, 'user': sanitize_user(user)}


@api_router.post("/auth/login")
async def login(body: LoginBody):
    ident = body.identifier.strip().lower()
    # Brute-force lockout: 8 failed attempts within 15 min blocks further tries.
    attempt = await db.login_attempts.find_one({'identifier': ident})
    if attempt and attempt.get('count', 0) >= 8:
        last = attempt.get('last')
        if last is not None:
            if last.tzinfo is None:
                last = last.replace(tzinfo=timezone.utc)
            if (datetime.now(timezone.utc) - last) < timedelta(minutes=15):
                raise HTTPException(status_code=429, detail='Too many failed attempts. Please try again in a few minutes.')
    user = await db.users.find_one({'$or': [{'email': ident}, {'username': ident}]})
    if not user or not verify_password(body.password, user.get('passwordHash', '')):
        await db.login_attempts.update_one(
            {'identifier': ident},
            {'$inc': {'count': 1}, '$set': {'last': datetime.now(timezone.utc)}},
            upsert=True)
        detail = 'No account found with that email or username.' if not user else 'Incorrect password. Please try again.'
        raise HTTPException(status_code=400, detail=detail)
    await db.login_attempts.delete_one({'identifier': ident})
    if user.get('blocked'):
        raise HTTPException(status_code=403, detail='Your account has been suspended. Please contact support.')
    token = create_access_token(user['id'], user['email'])
    return {'token': token, 'user': sanitize_user(user)}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.put("/auth/me")
async def update_me(patch: dict, user: dict = Depends(get_current_user)):
    # Allowlist: prevent privilege / flag injection (e.g. role, isSeller).
    allowed = {'fullName', 'username', 'phone', 'country', 'profilePhoto', 'skills', 'services', 'company', 'bio', 'preferences'}
    clean_patch = {k: v for k, v in patch.items() if k in allowed}
    if 'username' in clean_patch:
        uname = str(clean_patch['username']).strip().lower()
        clash = await db.users.find_one({'username': uname, 'id': {'$ne': user['id']}})
        if clash:
            raise HTTPException(status_code=400, detail='This username is already taken.')
        clean_patch['username'] = uname
    clean_patch['updatedAt'] = now_iso()
    await db.users.update_one({'id': user['id']}, {'$set': clean_patch})
    updated = await db.users.find_one({'id': user['id']})
    return sanitize_user(updated)


@api_router.post("/auth/change-password")
async def change_password(body: ChangePasswordBody, user: dict = Depends(get_current_user)):
    if len(body.newPassword) < 8:
        raise HTTPException(status_code=400, detail='New password must be at least 8 characters.')
    record = await db.users.find_one({'id': user['id']})
    if not record or not verify_password(body.currentPassword, record.get('passwordHash', '')):
        raise HTTPException(status_code=400, detail='Your current password is incorrect.')
    if verify_password(body.newPassword, record.get('passwordHash', '')):
        raise HTTPException(status_code=400, detail='New password must be different from the current one.')
    await db.users.update_one(
        {'id': user['id']},
        {'$set': {'passwordHash': hash_password(body.newPassword), 'updatedAt': now_iso()}})
    return {'ok': True}


@api_router.post("/auth/forgot-password")
async def forgot_password(body: ForgotBody):
    email = body.email.strip().lower()
    user = await db.users.find_one({'email': email})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            'token': token, 'userId': user['id'],
            'expiresAt': datetime.now(timezone.utc) + timedelta(hours=1),
            'used': False, 'createdAt': now_iso(),
        })
        logger.info(f"Password reset link for {email}: /reset-password?token={token}")
    return {'ok': True}


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
def clean(doc: dict) -> dict:
    doc = dict(doc)
    doc.pop('_id', None)
    return doc


@api_router.get("/orders")
async def list_orders(request: Request):
    user = await get_optional_user(request)
    if not user:
        return []
    if user.get('role') == 'admin':
        docs = await db.orders.find().sort('createdAt', -1).to_list(2000)
    else:
        docs = await db.orders.find({'$or': [{'buyerId': user['id']}, {'sellerId': user['id']}]}).sort('createdAt', -1).to_list(2000)
    return [clean(d) for d in docs]


@api_router.post("/orders")
async def create_order(body: OrderCreate, user: dict = Depends(get_current_user)):
    # Server-side price: trust a backend seller-product price when available.
    price = float(body.price)
    seller_prod = await db.seller_products.find_one({'id': body.productId})
    if seller_prod:
        price = float(seller_prod.get('price', price))
    order = {
        'id': f"o_{uuid.uuid4().hex[:12]}",
        'productId': body.productId,
        'title': body.title,
        'sellerName': body.sellerName,
        'sellerAvatar': body.sellerAvatar or '',
        'sellerId': seller_prod.get('userId') if seller_prod else '',
        'buyerId': user['id'],
        'buyerName': user.get('fullName') or user.get('username') or 'Buyer',
        'price': price,
        'priceLabel': body.priceLabel or '',
        'category': body.category or '',
        'deliveryDays': body.deliveryDays or 3,
        'status': 'pending',
        'paymentStatus': 'pending',
        'note': body.note or '',
        'fileId': seller_prod.get('fileId', '') if seller_prod else '',
        'fileName': seller_prod.get('fileName', '') if seller_prod else '',
        'createdAt': now_iso(),
        'updatedAt': now_iso(),
    }
    await db.orders.insert_one(order)
    return clean(order)


@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, request: Request):
    user = await get_optional_user(request)
    doc = await db.orders.find_one({'id': order_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Order not found')
    if not user or (user.get('role') != 'admin' and user['id'] not in (doc.get('buyerId'), doc.get('sellerId'))):
        raise HTTPException(status_code=403, detail='Not allowed')
    return clean(doc)


@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, body: StatusBody, user: dict = Depends(get_current_user)):
    doc = await db.orders.find_one({'id': order_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Order not found')
    status = body.status
    if status not in ('pending', 'processing', 'completed', 'cancelled'):
        raise HTTPException(status_code=400, detail='Invalid status')
    role = user.get('role')
    is_buyer = user['id'] == doc.get('buyerId')
    is_seller = user['id'] == doc.get('sellerId')
    if role == 'admin':
        pass  # admin may set any status
    elif is_buyer:
        if status != 'cancelled':
            raise HTTPException(status_code=403, detail='Buyers can only cancel an order')
    elif is_seller:
        if status not in ('processing', 'completed', 'cancelled'):
            raise HTTPException(status_code=403, detail='Not allowed to set this status')
    else:
        raise HTTPException(status_code=403, detail='Not allowed')
    await db.orders.update_one({'id': order_id}, {'$set': {'status': status, 'updatedAt': now_iso()}})
    return clean(await db.orders.find_one({'id': order_id}))


@api_router.patch("/orders/{order_id}/payment")
async def update_order_payment(order_id: str, body: PaymentBody, user: dict = Depends(get_current_user)):
    doc = await db.orders.find_one({'id': order_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Order not found')
    if user.get('role') not in ('admin',) and user['id'] != doc.get('sellerId'):
        raise HTTPException(status_code=403, detail='Not allowed')
    await db.orders.update_one({'id': order_id}, {'$set': {'paymentStatus': body.paymentStatus, 'updatedAt': now_iso()}})
    return clean(await db.orders.find_one({'id': order_id}))


@api_router.get("/orders/{order_id}/download")
async def download_deliverable(order_id: str, user: dict = Depends(get_current_user)):
    doc = await db.orders.find_one({'id': order_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Order not found')
    if user.get('role') != 'admin' and user['id'] != doc.get('buyerId'):
        raise HTTPException(status_code=403, detail='Not allowed')
    if doc.get('paymentStatus') != 'paid':
        raise HTTPException(status_code=403, detail='Payment required before download')
    file_id = doc.get('fileId')
    if not file_id:
        raise HTTPException(status_code=404, detail='No deliverable file for this order')
    record = await db.files.find_one({'id': file_id, 'is_deleted': False})
    if not record:
        raise HTTPException(status_code=404, detail='File not found')
    data, content_type = get_object(record['storage_path'])
    return Response(content=data, media_type=record.get('content_type', content_type),
                    headers={'Content-Disposition': f'attachment; filename="{record.get("original_filename", "download")}"'})


@api_router.get("/orders/{order_id}/receipt")
async def get_order_receipt(order_id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({'id': order_id})
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    if user.get('role') != 'admin' and user['id'] != order.get('buyerId'):
        raise HTTPException(status_code=403, detail='Not allowed')
    rcpt = await db.email_receipts.find_one({'orderId': order_id}, sort=[('sentAt', -1)])
    if not rcpt:
        return {'sent': False}
    return {
        'sent': True,
        'to': rcpt.get('to'),
        'subject': rcpt.get('subject'),
        'downloadUrl': rcpt.get('downloadUrl'),
        'provider': rcpt.get('provider'),
        'status': rcpt.get('status'),
        'sentAt': rcpt.get('sentAt'),
    }


# ---------------------------------------------------------------------------
# Reviews
# ---------------------------------------------------------------------------
@api_router.get("/reviews")
async def list_reviews(request: Request):
    user = await get_optional_user(request)
    if user and user.get('role') == 'admin':
        docs = await db.reviews.find().sort('createdAt', -1).to_list(2000)
    else:
        docs = await db.reviews.find({'hidden': {'$ne': True}}).sort('createdAt', -1).to_list(2000)
    return [clean(d) for d in docs]


@api_router.post("/reviews")
async def create_review(body: ReviewCreate, user: dict = Depends(get_current_user)):
    review = {
        'id': f"r_{uuid.uuid4().hex[:12]}",
        'productId': body.productId,
        'productTitle': body.productTitle,
        'sellerName': body.sellerName,
        'orderId': body.orderId,
        'buyerId': user['id'],
        'buyerName': user.get('fullName') or user.get('username') or 'Buyer',
        'rating': max(1, min(5, int(body.rating))),
        'comment': (body.comment or '').strip(),
        'hidden': False,
        'createdAt': now_iso(),
    }
    await db.reviews.insert_one(review)
    return clean(review)


@api_router.patch("/reviews/{review_id}/hidden")
async def set_review_hidden(review_id: str, body: HiddenBody, user: dict = Depends(require_admin)):
    doc = await db.reviews.find_one({'id': review_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Review not found')
    await db.reviews.update_one({'id': review_id}, {'$set': {'hidden': body.hidden}})
    return clean(await db.reviews.find_one({'id': review_id}))


@api_router.delete("/reviews/{review_id}")
async def remove_review(review_id: str, user: dict = Depends(require_admin)):
    await db.reviews.delete_one({'id': review_id})
    return {'ok': True}


# ---------------------------------------------------------------------------
# Products (public catalog: seeded catalog + approved seller uploads)
# ---------------------------------------------------------------------------
async def _rating_map(product_ids):
    """avg rating + count per productId from visible reviews."""
    if not product_ids:
        return {}
    pipeline = [
        {'$match': {'hidden': {'$ne': True}, 'productId': {'$in': list(product_ids)}}},
        {'$group': {'_id': '$productId', 'avg': {'$avg': '$rating'}, 'count': {'$sum': 1}}},
    ]
    out = {}
    async for row in db.reviews.aggregate(pipeline):
        out[row['_id']] = {'avg': round(row['avg'], 1), 'count': row['count']}
    return out


async def _map_seller_product(sp: dict) -> dict:
    cat_id = CATEGORY_NAME_TO_ID.get((sp.get('category') or '').strip().lower(), 'custom-services')
    seller_user = await db.users.find_one({'id': sp.get('userId')})
    seller_name = (seller_user or {}).get('fullName') or (seller_user or {}).get('username') or 'Seller'
    from urllib.parse import quote
    return {
        'id': sp['id'],
        'title': sp.get('title', ''),
        'description': sp.get('description', ''),
        'category': cat_id,
        'tags': sp.get('tags', []),
        'price': float(sp.get('price', 0)),
        'priceLabel': sp.get('priceLabel') or 'One-time',
        'rating': 0,
        'reviews': 0,
        'icon': CATEGORY_ICON.get(cat_id, 'Package'),
        'color': CATEGORY_COLOR.get(cat_id, 'from-emerald-500 to-teal-500'),
        'badge': 'New',
        'image': sp.get('image', ''),
        'seller': {'name': seller_name, 'rating': 5.0, 'sales': 0,
                   'avatar': f"https://api.dicebear.com/7.x/avataaars/svg?seed={quote(seller_name)}"},
        'deliveryDays': sp.get('deliveryDays', 3),
        'stock': int(sp.get('stock', 100)),
        'inStock': bool(sp.get('inStock', True)),
        'features': DEFAULT_FEATURES,
        'source': 'seller',
    }


async def _all_products() -> List[dict]:
    seed = [clean(d) for d in await db.products.find({'status': 'approved'}).to_list(2000)]
    seller_docs = await db.seller_products.find({'status': 'approved'}).sort('createdAt', -1).to_list(2000)
    mapped = [await _map_seller_product(sp) for sp in seller_docs]
    combined = mapped + seed  # newest seller uploads first
    ratings = await _rating_map([p['id'] for p in combined])
    for p in combined:
        r = ratings.get(p['id'])
        if r:
            p['rating'] = r['avg']
            p['reviews'] = r['count']
    return combined


@api_router.get("/products")
async def list_products():
    return await _all_products()


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    products = await _all_products()
    match = next((p for p in products if p['id'] == product_id), None)
    if not match:
        raise HTTPException(status_code=404, detail='Product not found')
    return match


@api_router.get("/categories")
async def list_categories():
    return SEED_CATEGORIES


# ---------------------------------------------------------------------------
# Saved / Wishlist
# ---------------------------------------------------------------------------
@api_router.get("/saved")
async def list_saved(user: dict = Depends(get_current_user)):
    doc = await db.saved.find_one({'userId': user['id']})
    return doc.get('items', []) if doc else []


@api_router.post("/saved/toggle")
async def toggle_saved(body: ToggleSavedBody, user: dict = Depends(get_current_user)):
    doc = await db.saved.find_one({'userId': user['id']})
    items = doc.get('items', []) if doc else []
    items = [i for i in items if i != body.productId] if body.productId in items else [body.productId] + items
    await db.saved.update_one({'userId': user['id']}, {'$set': {'items': items}}, upsert=True)
    return items


@api_router.delete("/saved/{product_id}")
async def remove_saved(product_id: str, user: dict = Depends(get_current_user)):
    doc = await db.saved.find_one({'userId': user['id']})
    items = [i for i in (doc.get('items', []) if doc else []) if i != product_id]
    await db.saved.update_one({'userId': user['id']}, {'$set': {'items': items}}, upsert=True)
    return items


# ---------------------------------------------------------------------------
# Seller: applications, products, withdrawals
# ---------------------------------------------------------------------------
@api_router.post("/seller/applications")
async def submit_application(body: ApplicationCreate, user: dict = Depends(get_current_user)):
    existing = await db.seller_applications.find_one({'userId': user['id'], 'sellerType': body.sellerType, 'status': {'$ne': 'rejected'}})
    if existing:
        raise HTTPException(status_code=400, detail='You already have a pending or approved application for this seller type.')
    app_doc = {
        'id': f"app_{uuid.uuid4().hex[:12]}",
        'userId': user['id'],
        'sellerType': body.sellerType,
        'status': 'pending',
        'createdAt': now_iso(),
        **(body.data or {}),
    }
    await db.seller_applications.insert_one(app_doc)
    return clean(app_doc)


@api_router.get("/seller/applications")
async def list_applications(request: Request, status: Optional[str] = None):
    await require_admin(request)
    q = {'status': status} if status else {}
    docs = await db.seller_applications.find(q).sort('createdAt', -1).to_list(2000)
    return [clean(d) for d in docs]


@api_router.get("/seller/applications/mine")
async def list_my_applications(user: dict = Depends(get_current_user)):
    docs = await db.seller_applications.find({'userId': user['id']}).sort('createdAt', -1).to_list(2000)
    return [clean(d) for d in docs]


@api_router.post("/seller/applications/{app_id}/decide")
async def decide_application(app_id: str, body: DecideBody, user: dict = Depends(require_admin)):
    doc = await db.seller_applications.find_one({'id': app_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Application not found.')
    new_status = 'approved' if body.action == 'approve' else 'rejected'
    patch = {'status': new_status, 'decidedAt': now_iso()}
    if body.reason:
        patch['reason'] = body.reason
    await db.seller_applications.update_one({'id': app_id}, {'$set': patch})
    if new_status == 'approved':
        await db.users.update_one({'id': doc['userId']}, {'$set': {'isSeller': True}})
    return clean(await db.seller_applications.find_one({'id': app_id}))


@api_router.post("/seller/products")
async def submit_product(body: SellerProductCreate, user: dict = Depends(get_current_user)):
    approved = await db.seller_applications.find_one({'userId': user['id'], 'status': 'approved'})
    if not approved and user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail='You need an approved seller application to upload products.')
    prod = {
        'id': f"sp_{uuid.uuid4().hex[:12]}",
        'userId': user['id'],
        'status': 'pending',
        'title': body.title,
        'category': body.category,
        'isCustomCategory': body.isCustomCategory,
        'price': float(body.price),
        'description': body.description,
        'image': body.image or '',
        'fileId': body.fileId or '',
        'fileName': body.fileName or '',
        'createdAt': now_iso(),
    }
    await db.seller_products.insert_one(prod)
    return clean(prod)


@api_router.get("/seller/products")
async def list_seller_products(request: Request, status: Optional[str] = None, userId: Optional[str] = None):
    user = await get_optional_user(request)
    q = {}
    if status:
        q['status'] = status
    if userId:
        q['userId'] = userId
    else:
        # non-admin without explicit filter only see approved catalog
        if not user or user.get('role') != 'admin':
            q['status'] = q.get('status', 'approved')
    docs = await db.seller_products.find(q).sort('createdAt', -1).to_list(2000)
    return [clean(d) for d in docs]


@api_router.post("/seller/products/{product_id}/decide")
async def decide_product(product_id: str, body: DecideBody, user: dict = Depends(require_admin)):
    doc = await db.seller_products.find_one({'id': product_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Product not found.')
    patch = {'status': 'approved' if body.action == 'approve' else 'rejected', 'decidedAt': now_iso()}
    if body.reason:
        patch['reason'] = body.reason
    await db.seller_products.update_one({'id': product_id}, {'$set': patch})
    return clean(await db.seller_products.find_one({'id': product_id}))


@api_router.patch("/seller/products/{product_id}")
async def update_seller_product(product_id: str, patch: dict, user: dict = Depends(get_current_user)):
    doc = await db.seller_products.find_one({'id': product_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Product not found.')
    if user.get('role') != 'admin' and user['id'] != doc.get('userId'):
        raise HTTPException(status_code=403, detail='Not allowed')
    patch.pop('id', None)
    patch.pop('userId', None)
    patch['updatedAt'] = now_iso()
    await db.seller_products.update_one({'id': product_id}, {'$set': patch})
    return clean(await db.seller_products.find_one({'id': product_id}))


@api_router.post("/seller/withdrawals")
async def request_withdrawal(body: WithdrawalCreate, user: dict = Depends(get_current_user)):
    w = {
        'id': f"wd_{uuid.uuid4().hex[:10]}",
        'userId': user['id'],
        'amount': float(body.amount),
        'method': body.method or 'Bank transfer',
        'status': 'pending',
        'createdAt': now_iso(),
    }
    await db.withdrawals.insert_one(w)
    return clean(w)


@api_router.get("/seller/withdrawals")
async def list_withdrawals(request: Request, status: Optional[str] = None, userId: Optional[str] = None):
    user = await get_optional_user(request)
    q = {}
    if status:
        q['status'] = status
    if userId:
        q['userId'] = userId
    elif not user or user.get('role') != 'admin':
        if user:
            q['userId'] = user['id']
        else:
            return []
    docs = await db.withdrawals.find(q).sort('createdAt', -1).to_list(2000)
    return [clean(d) for d in docs]


@api_router.post("/seller/withdrawals/{wid}/decide")
async def decide_withdrawal(wid: str, body: DecideBody, user: dict = Depends(require_admin)):
    doc = await db.withdrawals.find_one({'id': wid})
    if not doc:
        raise HTTPException(status_code=404, detail='Withdrawal not found.')
    await db.withdrawals.update_one({'id': wid}, {'$set': {'status': 'approved' if body.action == 'approve' else 'rejected', 'decidedAt': now_iso()}})
    return clean(await db.withdrawals.find_one({'id': wid}))


# ===========================================================================
# SELLER MANAGEMENT (Admin only)
# ===========================================================================
@api_router.get("/admin/sellers")
async def admin_list_sellers(user: dict = Depends(require_admin)):
    # Fetch all users that are sellers or have applications
    sellers_map = {}
    
    # 1. Gather all seller applications
    async for app in db.seller_applications.find().sort('createdAt', -1):
        uid = app.get('userId')
        if uid and uid not in sellers_map:
            u = await db.users.find_one({'id': uid})
            sellers_map[uid] = {
                'id': uid,
                'userId': uid,
                'applicationId': app.get('id'),
                'fullName': (u or {}).get('fullName') or app.get('fullName', 'Unknown'),
                'username': (u or {}).get('username') or '',
                'email': (u or {}).get('email') or app.get('email', ''),
                'phone': (u or {}).get('phone', ''),
                'country': (u or {}).get('country') or app.get('country', ''),
                'sellerType': app.get('sellerType', 'digital-marketplace'),
                'category': app.get('category', ''),
                'status': app.get('status', 'pending'),
                'isSuspended': bool((u or {}).get('isSuspended', False) or app.get('isSuspended', False)),
                'suspendReason': (u or {}).get('suspendReason') or app.get('suspendReason', ''),
                'createdAt': app.get('createdAt') or (u or {}).get('createdAt'),
                'decidedAt': app.get('decidedAt'),
            }

    # 2. Gather any other users with role seller
    async for u in db.users.find({'$or': [{'role': 'seller'}, {'isSeller': True}]}):
        uid = u['id']
        if uid not in sellers_map:
            sellers_map[uid] = {
                'id': uid,
                'userId': uid,
                'applicationId': None,
                'fullName': u.get('fullName', 'Unknown'),
                'username': u.get('username', ''),
                'email': u.get('email', ''),
                'phone': u.get('phone', ''),
                'country': u.get('country', ''),
                'sellerType': 'digital-marketplace',
                'category': '',
                'status': 'approved',
                'isSuspended': bool(u.get('isSuspended', False)),
                'suspendReason': u.get('suspendReason', ''),
                'createdAt': u.get('createdAt'),
                'decidedAt': None,
            }

    # 3. Attach sales summary & product metrics to each seller
    seller_list = list(sellers_map.values())
    for s in seller_list:
        uid = s['userId']
        # Orders metrics
        orders = await db.orders.find({'sellerId': uid}).to_list(1000)
        paid_orders = [o for o in orders if o.get('paymentStatus') == 'paid']
        total_sales = sum(float(o.get('price', 0)) for o in paid_orders)
        prods_count = await db.seller_products.count_documents({'userId': uid})
        s['salesSummary'] = {
            'totalSales': round(total_sales, 2),
            'ordersCount': len(orders),
            'completedOrders': len(paid_orders),
            'productsCount': prods_count,
        }

    return seller_list


@api_router.get("/admin/sellers/{seller_id}/summary")
async def admin_seller_summary(seller_id: str, user: dict = Depends(require_admin)):
    u = await db.users.find_one({'id': seller_id})
    app = await db.seller_applications.find_one({'userId': seller_id}, sort=[('createdAt', -1)])
    
    orders = await db.orders.find({'sellerId': seller_id}).sort('createdAt', -1).to_list(500)
    paid_orders = [o for o in orders if o.get('paymentStatus') == 'paid']
    total_sales = sum(float(o.get('price', 0)) for o in paid_orders)
    
    prods = await db.seller_products.find({'userId': seller_id}).sort('createdAt', -1).to_list(200)

    return {
        'seller': {
            'id': seller_id,
            'userId': seller_id,
            'fullName': (u or {}).get('fullName') or (app or {}).get('fullName', 'Unknown'),
            'username': (u or {}).get('username', ''),
            'email': (u or {}).get('email') or (app or {}).get('email', ''),
            'phone': (u or {}).get('phone', ''),
            'country': (u or {}).get('country') or (app or {}).get('country', ''),
            'sellerType': (app or {}).get('sellerType', 'digital-marketplace'),
            'category': (app or {}).get('category', ''),
            'status': (app or {}).get('status', 'approved' if (u or {}).get('isSeller') else 'pending'),
            'isSuspended': bool((u or {}).get('isSuspended', False)),
            'suspendReason': (u or {}).get('suspendReason', ''),
            'walletBalance': float((u or {}).get('walletBalance') or 0.0),
            'createdAt': (u or {}).get('createdAt'),
        },
        'application': clean(app) if app else None,
        'salesSummary': {
            'totalSales': round(total_sales, 2),
            'ordersCount': len(orders),
            'completedOrders': len(paid_orders),
            'productsCount': len(prods),
            'recentOrders': [clean(o) for o in orders[:5]],
        },
        'products': [clean(p) for p in prods],
    }


@api_router.post("/admin/sellers/{seller_id}/suspend")
async def admin_suspend_seller(seller_id: str, body: dict, user: dict = Depends(require_admin)):
    suspended = bool(body.get('suspended', True))
    reason = body.get('reason', '')
    
    # Update user record
    await db.users.update_one(
        {'id': seller_id},
        {'$set': {'isSuspended': suspended, 'suspendReason': reason, 'updatedAt': now_iso()}}
    )
    # Update seller applications
    await db.seller_applications.update_many(
        {'userId': seller_id},
        {'$set': {'isSuspended': suspended, 'suspendReason': reason, 'updatedAt': now_iso()}}
    )
    # When suspended, optionally update active products status
    if suspended:
        await db.seller_products.update_many(
            {'userId': seller_id, 'status': 'approved'},
            {'$set': {'suspendedBySeller': True, 'updatedAt': now_iso()}}
        )
    else:
        await db.seller_products.update_many(
            {'userId': seller_id, 'suspendedBySeller': True},
            {'$unset': {'suspendedBySeller': ''}, '$set': {'updatedAt': now_iso()}}
        )

    return {'ok': True, 'sellerId': seller_id, 'suspended': suspended, 'reason': reason}


# ===========================================================================
# PRODUCT MANAGEMENT (Admin only)
# ===========================================================================
@api_router.get("/admin/products")
async def admin_list_products(
    request: Request,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    user: dict = Depends(require_admin)
):
    q = {}
    if status and status != 'all':
        q['status'] = status
    if category and category != 'all':
        q['category'] = category
    if search:
        s = search.strip()
        q['$or'] = [
            {'title': {'$regex': s, '$options': 'i'}},
            {'description': {'$regex': s, '$options': 'i'}},
            {'category': {'$regex': s, '$options': 'i'}},
        ]

    docs = await db.seller_products.find(q).sort('createdAt', -1).to_list(1000)
    result = []
    for d in docs:
        item = clean(d)
        item['stock'] = int(item.get('stock', 100))
        item['inStock'] = bool(item.get('inStock', True))
        result.append(item)
    return result


@api_router.post("/admin/products")
async def admin_create_product(body: dict, user: dict = Depends(require_admin)):
    title = (body.get('title') or '').strip()
    if not title:
        raise HTTPException(status_code=400, detail='Product title is required.')

    price = float(body.get('price', 0))
    if price < 0:
        raise HTTPException(status_code=400, detail='Price must be non-negative.')

    stock = int(body.get('stock', 100))
    in_stock = bool(body.get('inStock', True))
    
    prod_id = f"sp_{uuid.uuid4().hex[:12]}"
    doc = {
        'id': prod_id,
        'userId': user['id'],
        'title': title,
        'category': body.get('category', 'Software'),
        'price': price,
        'description': body.get('description', ''),
        'image': body.get('image', ''),
        'stock': stock,
        'inStock': in_stock,
        'status': body.get('status', 'approved'),
        'fileId': body.get('fileId', ''),
        'fileName': body.get('fileName', ''),
        'createdAt': now_iso(),
        'updatedAt': now_iso(),
    }
    await db.seller_products.insert_one(doc)
    return clean(doc)


@api_router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, body: dict, user: dict = Depends(require_admin)):
    existing = await db.seller_products.find_one({'id': product_id})
    if not existing:
        # Check if in seed products
        seed_exist = await db.products.find_one({'id': product_id})
        if not seed_exist:
            raise HTTPException(status_code=404, detail='Product not found.')

    upd = {'updatedAt': now_iso()}
    for key in ['title', 'category', 'description', 'image', 'fileId', 'fileName', 'status']:
        if key in body:
            upd[key] = body[key]
    if 'price' in body:
        upd['price'] = float(body['price'])
    if 'stock' in body:
        upd['stock'] = int(body['stock'])
    if 'inStock' in body:
        upd['inStock'] = bool(body['inStock'])

    if existing:
        await db.seller_products.update_one({'id': product_id}, {'$set': upd})
        return clean(await db.seller_products.find_one({'id': product_id}))
    else:
        await db.products.update_one({'id': product_id}, {'$set': upd})
        return clean(await db.products.find_one({'id': product_id}))


@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, user: dict = Depends(require_admin)):
    r1 = await db.seller_products.delete_one({'id': product_id})
    r2 = await db.products.delete_one({'id': product_id})
    if not r1.deleted_count and not r2.deleted_count:
        raise HTTPException(status_code=404, detail='Product not found.')
    return {'ok': True, 'id': product_id}


# ---------------------------------------------------------------------------
# Files
# ---------------------------------------------------------------------------
@api_router.post("/files/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = file.filename.split('.')[-1].lower() if '.' in (file.filename or '') else 'bin'
    path = f"{APP_NAME}/uploads/{user['id']}/{uuid.uuid4().hex}.{ext}"
    data = await file.read()
    if len(data) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail='File too large (max 50MB).')
    result = put_object(path, data, file.content_type or 'application/octet-stream')
    file_id = f"f_{uuid.uuid4().hex[:12]}"
    await db.files.insert_one({
        'id': file_id,
        'storage_path': result['path'],
        'original_filename': file.filename,
        'content_type': file.content_type,
        'size': result.get('size', len(data)),
        'ownerId': user['id'],
        'is_deleted': False,
        'created_at': now_iso(),
    })
    return {'id': file_id, 'filename': file.filename, 'size': result.get('size', len(data))}


@api_router.get("/files/{file_id}/view")
async def view_file_content(file_id: str):
    doc = await db.files.find_one({'id': file_id, 'is_deleted': False})
    if not doc:
        raise HTTPException(status_code=404, detail='File not found')
    content, ctype = get_object(doc['storage_path'])
    return Response(content=content, media_type=ctype or 'application/octet-stream')


# ---------------------------------------------------------------------------
# Payments (Stripe)
# ---------------------------------------------------------------------------
@api_router.post("/payments/checkout")
async def create_checkout(body: CheckoutBody, request: Request, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({'id': body.order_id})
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    if order.get('buyerId') != user['id']:
        raise HTTPException(status_code=403, detail='Not allowed')
    amount = float(order['price'])  # server-side amount
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    success_url = f"{body.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{body.origin_url}/payment/cancel"
    req = CheckoutSessionRequest(
        amount=amount, currency='usd',
        success_url=success_url, cancel_url=cancel_url,
        metadata={'order_id': order['id'], 'user_id': user['id']},
    )
    session = await stripe_checkout.create_checkout_session(req)
    await db.payment_transactions.insert_one({
        'id': f"pt_{uuid.uuid4().hex[:12]}",
        'session_id': session.session_id,
        'order_id': order['id'],
        'user_id': user['id'],
        'amount': amount,
        'currency': 'usd',
        'status': 'initiated',
        'payment_status': 'pending',
        'origin_url': body.origin_url,
        'emailSent': False,
        'created_at': now_iso(),
        'updated_at': now_iso(),
    })
    return {'checkout_url': session.url, 'session_id': session.session_id}


async def _send_order_receipt(tx: dict):
    """Send the order confirmation receipt once (idempotent via emailSent flag)."""
    if tx.get('emailSent'):
        return
    order = await db.orders.find_one({'id': tx['order_id']})
    if not order:
        return
    buyer = await db.users.find_one({'id': order.get('buyerId')})
    to_email = (buyer or {}).get('email')
    if not to_email:
        return
    origin = (tx.get('origin_url') or '').rstrip('/')
    download_url = f"{origin}/dashboard/buyer-orders" if origin else ''
    subject = f"Your ShahLance receipt — {order.get('title', 'order')}"
    html = email_service.build_receipt_html(order, download_url)
    result = email_service.send_email(to_email, subject, html)
    await db.email_receipts.insert_one({
        'id': f"rcpt_{uuid.uuid4().hex[:12]}",
        'orderId': order['id'],
        'buyerId': order.get('buyerId'),
        'to': to_email,
        'subject': subject,
        'downloadUrl': download_url,
        'provider': result.get('provider'),
        'status': result.get('status'),
        'html': html,
        'sentAt': now_iso(),
    })
    await db.payment_transactions.update_one({'session_id': tx['session_id']}, {'$set': {'emailSent': True}})
    await db.orders.update_one({'id': order['id']}, {'$set': {'receiptSent': True}})


async def _mark_paid(session_id: str):
    tx = await db.payment_transactions.find_one({'session_id': session_id})
    if not tx:
        return
    if tx.get('payment_status') != 'paid':
        await db.payment_transactions.update_one(
            {'session_id': session_id, 'payment_status': {'$ne': 'paid'}},
            {'$set': {'status': 'completed', 'payment_status': 'paid', 'updated_at': now_iso()}})
        await db.orders.update_one(
            {'id': tx['order_id']},
            {'$set': {'paymentStatus': 'paid', 'status': 'processing', 'updatedAt': now_iso()}})
        tx = await db.payment_transactions.find_one({'session_id': session_id})
    # Send the confirmation receipt (idempotent).
    await _send_order_receipt(tx)
    # Trigger signup bonus evaluation if first purchase requirement is configured
    try:
        order = await db.orders.find_one({'id': tx['order_id']})
        if order and order.get('buyerId'):
            buyer = await db.users.find_one({'id': order['buyerId']})
            if buyer and not buyer.get('bonusReceived'):
                price = float(order.get('price') or 0.0)
                await bonus_protection.evaluate_fraud_and_bonus(
                    db, buyer, device_id='', ip_address='', purchase_amount=price, is_purchase_trigger=True
                )
    except Exception as e:
        logger.warning(f"bonus check on paid order error: {e}")


@api_router.get("/payments/status/{session_id}")
async def payment_status(session_id: str):
    tx = await db.payment_transactions.find_one({'session_id': session_id})
    if not tx:
        raise HTTPException(status_code=404, detail='Transaction not found')
    if tx.get('payment_status') != 'paid':
        try:
            stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url='https://example.com/api/webhook/stripe')
            status = await stripe_checkout.get_checkout_status(session_id)
            if status.payment_status == 'paid' or status.status == 'complete':
                await _mark_paid(session_id)
                tx = await db.payment_transactions.find_one({'session_id': session_id})
        except Exception as e:
            logger.warning(f"status poll failed: {e}")
    return {'session_id': session_id, 'status': tx['status'], 'payment_status': tx['payment_status'], 'order_id': tx['order_id']}


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get('Stripe-Signature')
    try:
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=str(request.base_url) + 'api/webhook/stripe')
        resp = await stripe_checkout.handle_webhook(body, sig)
        if resp.payment_status == 'paid' and resp.session_id:
            await _mark_paid(resp.session_id)
    except Exception as e:
        logger.warning(f"webhook error: {e}")
    return {'status': 'ok'}


# ---------------------------------------------------------------------------
# Admin overview
# ---------------------------------------------------------------------------
@api_router.get("/admin/overview")
async def admin_overview(user: dict = Depends(require_admin)):
    return {
        'users': await db.users.count_documents({}),
        'orders': await db.orders.count_documents({}),
        'sellerProducts': await db.seller_products.count_documents({}),
        'applications': await db.seller_applications.count_documents({'status': 'pending'}),
        'reviews': await db.reviews.count_documents({}),
    }


# ============ ADMIN CORE UPGRADE (admin-only) ============
SMS_SERVICES = ['Telegram', 'Gmail', 'WhatsApp', 'Facebook', 'Instagram', 'Other']
SMS_COUNTRIES = ['India', 'USA', 'Germany', 'UK', 'Other']


@api_router.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    revenue = 0.0
    async for o in db.orders.find({'paymentStatus': 'paid'}):
        revenue += float(o.get('price') or 0)
    pending_orders = await db.orders.count_documents({'status': 'pending'})
    pending_apps = await db.seller_applications.count_documents({'status': 'pending'})
    recent = []
    async for o in db.orders.find().sort('createdAt', -1).limit(8):
        recent.append({'type': 'order', 'id': o.get('id'), 'label': f"Order · {o.get('title', '')}",
                       'status': o.get('status'), 'at': o.get('createdAt')})
    return {'totalUsers': total_users, 'totalOrders': total_orders, 'totalRevenue': round(revenue, 2),
            'pendingActions': pending_orders + pending_apps, 'recentActivity': recent}


@api_router.get("/admin/users")
async def admin_users(user: dict = Depends(require_admin), search: Optional[str] = None):
    q = {}
    if search:
        rx = {'$regex': re.escape(search), '$options': 'i'}
        q = {'$or': [{'fullName': rx}, {'username': rx}, {'email': rx}]}
    out = []
    async for u in db.users.find(q).sort('createdAt', -1).limit(200):
        out.append({'id': u.get('id'), 'fullName': u.get('fullName', ''), 'username': u.get('username', ''),
                    'email': u.get('email', ''), 'role': u.get('role', 'buyer'),
                    'blocked': bool(u.get('blocked', False)), 'createdAt': u.get('createdAt')})
    return out


@api_router.get("/admin/users/{uid}")
async def admin_user_detail(uid: str, user: dict = Depends(require_admin)):
    u = await db.users.find_one({'id': uid})
    if not u:
        raise HTTPException(status_code=404, detail='User not found')
    txns = []
    async for t in db.wallet_transactions.find({'userId': uid}).sort('createdAt', -1).limit(100):
        txns.append(clean(t))
    orders_count = await db.orders.count_documents({'buyerId': uid})
    return {'user': sanitize_user(u),
            'wallet': {'balance': float(u.get('walletBalance') or 0), 'transactions': txns,
                       'deposits': [t for t in txns if t.get('type') == 'deposit']},
            'ordersCount': orders_count}


@api_router.patch("/admin/users/{uid}/block")
async def admin_block_user(uid: str, body: dict, user: dict = Depends(require_admin)):
    if uid == user['id']:
        raise HTTPException(status_code=400, detail='You cannot block your own admin account.')
    blocked = bool(body.get('blocked', True))
    r = await db.users.update_one({'id': uid}, {'$set': {'blocked': blocked, 'updatedAt': now_iso()}})
    if not r.matched_count:
        raise HTTPException(status_code=404, detail='User not found')
    return {'ok': True, 'blocked': blocked}


# ---- SMS API Management (manual only; no auto routing) ----
@api_router.get("/admin/sms/providers")
async def sms_providers_list(user: dict = Depends(require_admin)):
    return [clean(p) async for p in db.sms_providers.find().sort('createdAt', -1)]


@api_router.post("/admin/sms/providers")
async def sms_provider_create(body: dict, user: dict = Depends(require_admin)):
    name = (body.get('name') or '').strip()
    if not name:
        raise HTTPException(status_code=400, detail='Provider name is required.')
    p = {'id': f"smsp_{uuid.uuid4().hex[:10]}", 'name': name, 'apiUrl': (body.get('apiUrl') or '').strip(),
         'apiKey': (body.get('apiKey') or '').strip(), 'apiSecret': (body.get('apiSecret') or '').strip(),
         'status': bool(body.get('status', True)), 'createdAt': now_iso()}
    await db.sms_providers.insert_one(p)
    return clean(p)


@api_router.put("/admin/sms/providers/{pid}")
async def sms_provider_update(pid: str, body: dict, user: dict = Depends(require_admin)):
    upd = {k: body[k] for k in ['name', 'apiUrl', 'apiKey', 'apiSecret', 'status'] if k in body}
    if 'status' in upd:
        upd['status'] = bool(upd['status'])
    upd['updatedAt'] = now_iso()
    r = await db.sms_providers.update_one({'id': pid}, {'$set': upd})
    if not r.matched_count:
        raise HTTPException(status_code=404, detail='Provider not found')
    return clean(await db.sms_providers.find_one({'id': pid}))


@api_router.delete("/admin/sms/providers/{pid}")
async def sms_provider_delete(pid: str, user: dict = Depends(require_admin)):
    await db.sms_providers.delete_one({'id': pid})
    return {'ok': True}


@api_router.get("/admin/sms/mappings")
async def sms_mappings_list(user: dict = Depends(require_admin)):
    return [clean(m) async for m in db.sms_mappings.find().sort('createdAt', -1)]


@api_router.post("/admin/sms/mappings")
async def sms_mapping_create(body: dict, user: dict = Depends(require_admin)):
    service = body.get('service') or ''
    country = body.get('country') or ''
    if not service or not country:
        raise HTTPException(status_code=400, detail='Service and country are required.')
    cost = float(body.get('cost') or 0)
    price = float(body.get('price') or 0)
    m = {'id': f"smsm_{uuid.uuid4().hex[:10]}", 'service': service, 'country': country,
         'primaryProviderId': body.get('primaryProviderId', ''), 'backupProviderId': body.get('backupProviderId', ''),
         'cost': cost, 'price': price, 'profit': round(price - cost, 2),
         'enabled': bool(body.get('enabled', True)), 'createdAt': now_iso()}
    await db.sms_mappings.insert_one(m)
    return clean(m)


@api_router.put("/admin/sms/mappings/{mid}")
async def sms_mapping_update(mid: str, body: dict, user: dict = Depends(require_admin)):
    upd = {k: body[k] for k in ['primaryProviderId', 'backupProviderId', 'enabled'] if k in body}
    if 'enabled' in upd:
        upd['enabled'] = bool(upd['enabled'])
    if 'cost' in body or 'price' in body:
        cost = float(body.get('cost') or 0)
        price = float(body.get('price') or 0)
        upd.update({'cost': cost, 'price': price, 'profit': round(price - cost, 2)})
    r = await db.sms_mappings.update_one({'id': mid}, {'$set': upd})
    if not r.matched_count:
        raise HTTPException(status_code=404, detail='Mapping not found')
    return clean(await db.sms_mappings.find_one({'id': mid}))


@api_router.delete("/admin/sms/mappings/{mid}")
async def sms_mapping_delete(mid: str, user: dict = Depends(require_admin)):
    await db.sms_mappings.delete_one({'id': mid})
    return {'ok': True}


@api_router.get("/admin/sms/orders")
async def sms_orders_list(user: dict = Depends(require_admin)):
    return [clean(o) async for o in db.sms_orders.find().sort('createdAt', -1).limit(200)]


@api_router.get("/admin/sms/config")
async def sms_config_get(user: dict = Depends(require_admin)):
    cfg = await db.sms_config.find_one({'id': 'default'})
    if not cfg:
        cfg = {'id': 'default', 'services': {s: True for s in SMS_SERVICES},
               'countries': {c: True for c in SMS_COUNTRIES}}
        await db.sms_config.insert_one(dict(cfg))
    return {'services': cfg.get('services', {}), 'countries': cfg.get('countries', {}),
            'allServices': SMS_SERVICES, 'allCountries': SMS_COUNTRIES}


@api_router.put("/admin/sms/config")
async def sms_config_update(body: dict, user: dict = Depends(require_admin)):
    upd = {}
    if 'services' in body:
        upd['services'] = body['services']
    if 'countries' in body:
        upd['countries'] = body['countries']
    await db.sms_config.update_one({'id': 'default'}, {'$set': upd}, upsert=True)
    cfg = await db.sms_config.find_one({'id': 'default'})
    return {'services': cfg.get('services', {}), 'countries': cfg.get('countries', {}),
            'allServices': SMS_SERVICES, 'allCountries': SMS_COUNTRIES}


# ---- Payment Gateway Management (config storage only; no live gateway calls) ----
GATEWAY_PROVIDERS = ['cryptomus', 'nowpayments']


@api_router.get("/admin/payments/gateways")
async def gateways_list(user: dict = Depends(require_admin)):
    return [clean(g) async for g in db.payment_gateways.find().sort('createdAt', -1)]


@api_router.post("/admin/payments/gateways")
async def gateway_create(body: dict, user: dict = Depends(require_admin)):
    provider = str(body.get('provider') or '').strip().lower()
    if provider not in GATEWAY_PROVIDERS:
        raise HTTPException(status_code=400, detail='Provider must be cryptomus or nowpayments')
    doc = {
        'id': f"gw_{uuid.uuid4().hex[:12]}",
        'provider': provider,
        'merchantId': str(body.get('merchantId') or '').strip(),
        'apiKey': str(body.get('apiKey') or '').strip(),
        'secretKey': str(body.get('secretKey') or '').strip(),
        'webhookUrl': str(body.get('webhookUrl') or '').strip(),
        'enabled': bool(body.get('enabled', False)),
        'createdAt': now_iso(), 'updatedAt': now_iso(),
    }
    await db.payment_gateways.insert_one(doc)
    return clean(doc)


@api_router.put("/admin/payments/gateways/{gid}")
async def gateway_update(gid: str, body: dict, user: dict = Depends(require_admin)):
    upd = {}
    for k in ('merchantId', 'apiKey', 'secretKey', 'webhookUrl'):
        if k in body:
            upd[k] = str(body[k] or '').strip()
    if 'enabled' in body:
        upd['enabled'] = bool(body['enabled'])
    if 'provider' in body:
        provider = str(body['provider']).strip().lower()
        if provider not in GATEWAY_PROVIDERS:
            raise HTTPException(status_code=400, detail='Provider must be cryptomus or nowpayments')
        upd['provider'] = provider
    if not upd:
        raise HTTPException(status_code=400, detail='Nothing to update')
    upd['updatedAt'] = now_iso()
    r = await db.payment_gateways.update_one({'id': gid}, {'$set': upd})
    if not r.matched_count:
        raise HTTPException(status_code=404, detail='Gateway not found')
    return clean(await db.payment_gateways.find_one({'id': gid}))


@api_router.delete("/admin/payments/gateways/{gid}")
async def gateway_delete(gid: str, user: dict = Depends(require_admin)):
    r = await db.payment_gateways.delete_one({'id': gid})
    if not r.deleted_count:
        raise HTTPException(status_code=404, detail='Gateway not found')
    return {'ok': True}


# ---- Payment Monitoring (reads existing payment_transactions; manual refund marking) ----
def _monitor_status(tx: dict) -> str:
    if tx.get('status') == 'refunded':
        return 'refunded'
    if tx.get('status') == 'completed' or tx.get('payment_status') == 'paid':
        return 'completed'
    if tx.get('payment_status') in ('failed', 'expired') or tx.get('status') == 'failed':
        return 'failed'
    return 'pending'


@api_router.get("/admin/payments/transactions")
async def payment_transactions_list(user: dict = Depends(require_admin), status: Optional[str] = None):
    txns = []
    async for t in db.payment_transactions.find().sort('created_at', -1).limit(200):
        t = clean(t)
        t['monitorStatus'] = _monitor_status(t)
        order = await db.orders.find_one({'id': t.get('order_id')})
        buyer = await db.users.find_one({'id': t.get('user_id')})
        t['orderTitle'] = (order or {}).get('title') or '—'
        t['userEmail'] = (buyer or {}).get('email') or '—'
        txns.append(t)
    summary = {'pending': 0, 'completed': 0, 'failed': 0, 'refunded': 0}
    async for t in db.payment_transactions.find():
        summary[_monitor_status(t)] += 1
    if status in summary:
        txns = [t for t in txns if t['monitorStatus'] == status]
    return {'transactions': txns, 'summary': summary}


@api_router.patch("/admin/payments/transactions/{tid}/refund")
async def payment_transaction_refund(tid: str, user: dict = Depends(require_admin)):
    tx = await db.payment_transactions.find_one({'id': tid})
    if not tx:
        raise HTTPException(status_code=404, detail='Transaction not found')
    if tx.get('status') != 'refunded':
        await db.payment_transactions.update_one(
            {'id': tid},
            {'$set': {'status': 'refunded', 'refundedAt': now_iso(),
                      'refundedBy': user['id'], 'updated_at': now_iso()}})
    return {'ok': True, 'status': 'refunded'}


# ---- Advanced Wallet (manual adjustment, bonus, notes, reports) ----
WALLET_ADJUST_TYPES = ['credit', 'debit', 'bonus']


@api_router.post("/admin/wallet/adjust")
async def wallet_adjust(body: dict, user: dict = Depends(require_admin)):
    uid = str(body.get('userId') or '')
    kind = str(body.get('type') or '').strip().lower()
    note = str(body.get('note') or '').strip()
    try:
        amount = round(float(body.get('amount')), 2)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail='Amount must be a number')
    if kind not in WALLET_ADJUST_TYPES:
        raise HTTPException(status_code=400, detail='Type must be credit, debit or bonus')
    if amount <= 0:
        raise HTTPException(status_code=400, detail='Amount must be greater than zero')
    if not note:
        raise HTTPException(status_code=400, detail='A transaction note is required')
    target = await db.users.find_one({'id': uid})
    if not target:
        raise HTTPException(status_code=404, detail='User not found')
    delta = -amount if kind == 'debit' else amount
    new_balance = round(float(target.get('walletBalance') or 0) + delta, 2)
    if new_balance < 0:
        raise HTTPException(status_code=400, detail='Debit exceeds the user wallet balance')
    await db.users.update_one({'id': uid}, {'$set': {'walletBalance': new_balance, 'updatedAt': now_iso()}})
    txn = {
        'id': f"wt_{uuid.uuid4().hex[:12]}",
        'userId': uid,
        'type': kind,
        'amount': delta,
        'note': note,
        'adminId': user['id'],
        'balanceAfter': new_balance,
        'createdAt': now_iso(),
    }
    await db.wallet_transactions.insert_one(txn)
    return {'ok': True, 'balance': new_balance, 'transaction': clean(txn)}


@api_router.get("/admin/wallet/report")
async def wallet_report(user: dict = Depends(require_admin)):
    total_balance = 0.0
    async for u in db.users.find():
        total_balance += float(u.get('walletBalance') or 0)
    totals = {'credit': 0.0, 'debit': 0.0, 'bonus': 0.0, 'deposit': 0.0}
    counts = {'credit': 0, 'debit': 0, 'bonus': 0, 'deposit': 0}
    async for t in db.wallet_transactions.find():
        kind = t.get('type')
        if kind in totals:
            totals[kind] += abs(float(t.get('amount') or 0))
            counts[kind] += 1
    recent = []
    async for t in db.wallet_transactions.find().sort('createdAt', -1).limit(20):
        t = clean(t)
        u = await db.users.find_one({'id': t.get('userId')})
        t['userEmail'] = (u or {}).get('email') or '—'
        recent.append(t)
    return {
        'totalBalance': round(total_balance, 2),
        'totals': {k: round(v, 2) for k, v in totals.items()},
        'counts': counts,
        'recent': recent,
    }


# ===========================================================================
# ADVANCED ADMIN TOOLS (CMS Management, Reports Dashboard, Security Tools)
# ===========================================================================

# ----------------- 1. CMS Management -----------------
@api_router.get("/admin/cms/settings")
async def get_cms_settings(user: dict = Depends(require_admin)):
    doc = await db.cms_settings.find_one({'id': 'site_cms_settings'})
    if not doc:
        doc = dict(advanced_admin_tools.DEFAULT_CMS_SETTINGS)
        await db.cms_settings.insert_one(dict(doc))
    return advanced_admin_tools.clean_doc(doc)

@api_router.put("/admin/cms/settings")
async def update_cms_settings(request: Request, body: dict, user: dict = Depends(require_admin)):
    upd = {'updatedAt': advanced_admin_tools.now_iso(), 'updatedBy': user.get('email', 'admin')}
    for k in ['logo', 'banner', 'homepageContent']:
        if k in body:
            upd[k] = body[k]
    await db.cms_settings.update_one({'id': 'site_cms_settings'}, {'$set': upd}, upsert=True)
    # Log admin action
    _, ip = _extract_client_meta(request)
    await db.admin_activity_logs.insert_one({
        'id': f"act_{uuid.uuid4().hex[:8]}",
        'adminEmail': user.get('email', 'admin'),
        'action': 'Updated CMS Settings',
        'details': 'Modified logo, banner, or homepage content',
        'ipAddress': ip or '127.0.0.1',
        'createdAt': advanced_admin_tools.now_iso(),
    })
    return advanced_admin_tools.clean_doc(await db.cms_settings.find_one({'id': 'site_cms_settings'}))

@api_router.get("/admin/cms/pages")
async def list_cms_pages(user: dict = Depends(require_admin)):
    pages = await db.cms_pages.find().sort('createdAt', -1).to_list(100)
    return [advanced_admin_tools.clean_doc(p) for p in pages]

@api_router.post("/admin/cms/pages")
async def create_cms_page(request: Request, body: dict, user: dict = Depends(require_admin)):
    title = (body.get('title') or '').strip()
    if not title:
        raise HTTPException(status_code=400, detail='Page title is required')
    slug = (body.get('slug') or '').strip() or title.lower().replace(' ', '-')
    doc = {
        'id': f"page_{uuid.uuid4().hex[:8]}",
        'title': title,
        'slug': slug,
        'content': (body.get('content') or '').strip(),
        'status': body.get('status', 'published'),
        'createdAt': advanced_admin_tools.now_iso(),
        'updatedAt': advanced_admin_tools.now_iso(),
    }
    await db.cms_pages.insert_one(doc)
    _, ip = _extract_client_meta(request)
    await db.admin_activity_logs.insert_one({
        'id': f"act_{uuid.uuid4().hex[:8]}",
        'adminEmail': user.get('email', 'admin'),
        'action': f"Created CMS Page '{title}'",
        'details': f"Status: {doc['status']}, Slug: {slug}",
        'ipAddress': ip or '127.0.0.1',
        'createdAt': advanced_admin_tools.now_iso(),
    })
    return advanced_admin_tools.clean_doc(doc)

@api_router.put("/admin/cms/pages/{page_id}")
async def update_cms_page(request: Request, page_id: str, body: dict, user: dict = Depends(require_admin)):
    upd = {'updatedAt': advanced_admin_tools.now_iso()}
    for k in ['title', 'slug', 'content', 'status']:
        if k in body:
            upd[k] = body[k]
    res = await db.cms_pages.update_one({'id': page_id}, {'$set': upd})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail='Page not found')
    _, ip = _extract_client_meta(request)
    await db.admin_activity_logs.insert_one({
        'id': f"act_{uuid.uuid4().hex[:8]}",
        'adminEmail': user.get('email', 'admin'),
        'action': f"Updated CMS Page '{page_id}'",
        'details': f"Updated fields: {list(body.keys())}",
        'ipAddress': ip or '127.0.0.1',
        'createdAt': advanced_admin_tools.now_iso(),
    })
    return advanced_admin_tools.clean_doc(await db.cms_pages.find_one({'id': page_id}))

@api_router.delete("/admin/cms/pages/{page_id}")
async def delete_cms_page(request: Request, page_id: str, user: dict = Depends(require_admin)):
    res = await db.cms_pages.delete_one({'id': page_id})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail='Page not found')
    _, ip = _extract_client_meta(request)
    await db.admin_activity_logs.insert_one({
        'id': f"act_{uuid.uuid4().hex[:8]}",
        'adminEmail': user.get('email', 'admin'),
        'action': f"Deleted CMS Page '{page_id}'",
        'details': 'Page deleted from system',
        'ipAddress': ip or '127.0.0.1',
        'createdAt': advanced_admin_tools.now_iso(),
    })
    return {'ok': True, 'id': page_id}


# ----------------- 2. Reports Dashboard -----------------
@api_router.get("/admin/reports/dashboard")
async def get_reports_dashboard(user: dict = Depends(require_admin)):
    # 1. Orders & Sales
    orders = await db.orders.find().to_list(2000)
    paid_orders = [o for o in orders if o.get('paymentStatus') == 'paid']
    total_sales = sum(float(o.get('price', 0)) for o in paid_orders)
    order_count = len(orders)

    # 2. Commission & Profit Report
    cfg = await db.commission_settings.find_one({'id': 'marketplace_commission_settings'})
    comm_pct = cfg.get('percentage', 20.0) if cfg and cfg.get('enabled', True) else 0.0
    platform_profit = round(total_sales * (comm_pct / 100.0), 2)

    # 3. User Growth
    total_users = await db.users.count_documents({})
    # New users in last 30 days
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    new_users = await db.users.count_documents({'createdAt': {'$gte': thirty_days_ago}})
    if new_users == 0:
        new_users = total_users

    # 4. Service Analytics (Usage by Category & Order Statistics)
    category_counts = {}
    for p in await db.seller_products.find().to_list(1000):
        c = p.get('category', 'General')
        category_counts[c] = category_counts.get(c, 0) + 1

    order_stats = {
        'paid': len(paid_orders),
        'pending': len([o for o in orders if o.get('paymentStatus') == 'pending']),
        'other': len([o for o in orders if o.get('paymentStatus') not in ('paid', 'pending')]),
    }

    return {
        'salesReport': {
            'totalSales': round(total_sales, 2),
            'orderCount': order_count,
            'paidOrderCount': len(paid_orders),
            'averageOrderValue': round(total_sales / len(paid_orders), 2) if paid_orders else 0.0,
        },
        'profitReport': {
            'platformProfit': platform_profit,
            'commissionPercentage': comm_pct,
            'commissionSummary': f"{comm_pct}% active commission rate generating ${platform_profit:.2f} platform revenue",
        },
        'userGrowth': {
            'totalUsers': total_users,
            'newUsers': new_users,
            'growthRate': f"+{round((new_users / max(1, total_users)) * 100, 1)}%",
        },
        'serviceAnalytics': {
            'serviceUsageCount': category_counts,
            'orderStatistics': order_stats,
        }
    }


# ----------------- 3. Security Tools -----------------
@api_router.get("/admin/security/activity-logs")
async def get_admin_activity_logs(user: dict = Depends(require_admin)):
    logs = await db.admin_activity_logs.find().sort('createdAt', -1).limit(100).to_list(100)
    return [advanced_admin_tools.clean_doc(l) for l in logs]

@api_router.post("/admin/security/activity-logs")
async def create_admin_activity_log(request: Request, body: dict, user: dict = Depends(require_admin)):
    _, ip = _extract_client_meta(request)
    doc = {
        'id': f"act_{uuid.uuid4().hex[:8]}",
        'adminEmail': user.get('email', 'admin'),
        'action': body.get('action', 'Manual Audit Event'),
        'details': body.get('details', ''),
        'ipAddress': ip or '127.0.0.1',
        'createdAt': advanced_admin_tools.now_iso(),
    }
    await db.admin_activity_logs.insert_one(doc)
    return advanced_admin_tools.clean_doc(doc)

@api_router.get("/admin/security/login-history")
async def get_admin_login_history(user: dict = Depends(require_admin)):
    history = await db.admin_login_history.find().sort('createdAt', -1).limit(100).to_list(100)
    return [advanced_admin_tools.clean_doc(h) for h in history]

@api_router.get("/admin/security/settings")
async def get_security_settings(user: dict = Depends(require_admin)):
    doc = await db.security_settings.find_one({'id': 'admin_security_settings'})
    if not doc:
        doc = dict(advanced_admin_tools.DEFAULT_SECURITY_SETTINGS)
        await db.security_settings.insert_one(dict(doc))
    return advanced_admin_tools.clean_doc(doc)

@api_router.put("/admin/security/settings")
async def update_security_settings(request: Request, body: dict, user: dict = Depends(require_admin)):
    upd = {'updatedAt': advanced_admin_tools.now_iso(), 'updatedBy': user.get('email', 'admin')}
    if 'twoFactorAuthEnabled' in body:
        upd['twoFactorAuthEnabled'] = bool(body['twoFactorAuthEnabled'])
    await db.security_settings.update_one({'id': 'admin_security_settings'}, {'$set': upd}, upsert=True)
    _, ip = _extract_client_meta(request)
    await db.admin_activity_logs.insert_one({
        'id': f"act_{uuid.uuid4().hex[:8]}",
        'adminEmail': user.get('email', 'admin'),
        'action': f"Toggled 2FA Setting: {upd.get('twoFactorAuthEnabled')}",
        'details': 'Updated Admin Two-Factor Authentication policy',
        'ipAddress': ip or '127.0.0.1',
        'createdAt': advanced_admin_tools.now_iso(),
    })
    return advanced_admin_tools.clean_doc(await db.security_settings.find_one({'id': 'admin_security_settings'}))


# ===========================================================================
# DIGITAL PRODUCT MANAGEMENT (Subscriptions & Gift Cards - Admin only)
# ===========================================================================
# --- Subscription Categories ---
@api_router.get("/admin/digital/subscription-categories")
async def list_sub_categories(user: dict = Depends(require_admin)):
    cats = await db.digital_subscription_categories.find().sort('name', 1).to_list(100)
    return [digital_products.clean_doc(c) for c in cats]

@api_router.post("/admin/digital/subscription-categories")
async def create_sub_category(body: dict, user: dict = Depends(require_admin)):
    name = (body.get('name') or '').strip()
    if not name:
        raise HTTPException(status_code=400, detail='Category name is required')
    doc = {
        'id': f"subcat_{uuid.uuid4().hex[:8]}",
        'name': name,
        'description': (body.get('description') or '').strip(),
        'createdAt': digital_products.now_iso(),
        'updatedAt': digital_products.now_iso(),
    }
    await db.digital_subscription_categories.insert_one(doc)
    return digital_products.clean_doc(doc)

@api_router.put("/admin/digital/subscription-categories/{cat_id}")
async def update_sub_category(cat_id: str, body: dict, user: dict = Depends(require_admin)):
    upd = {'updatedAt': digital_products.now_iso()}
    if 'name' in body:
        upd['name'] = (body['name'] or '').strip()
    if 'description' in body:
        upd['description'] = (body['description'] or '').strip()
    res = await db.digital_subscription_categories.update_one({'id': cat_id}, {'$set': upd})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail='Category not found')
    return digital_products.clean_doc(await db.digital_subscription_categories.find_one({'id': cat_id}))

@api_router.delete("/admin/digital/subscription-categories/{cat_id}")
async def delete_sub_category(cat_id: str, user: dict = Depends(require_admin)):
    res = await db.digital_subscription_categories.delete_one({'id': cat_id})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail='Category not found')
    return {'ok': True, 'id': cat_id}

# --- Subscription Products & Plans ---
@api_router.get("/admin/digital/subscription-products")
async def list_sub_products(user: dict = Depends(require_admin)):
    prods = await db.digital_subscription_products.find().sort('createdAt', -1).to_list(200)
    return [digital_products.clean_doc(p) for p in prods]

@api_router.post("/admin/digital/subscription-products")
async def create_sub_product(body: dict, user: dict = Depends(require_admin)):
    title = (body.get('title') or '').strip()
    if not title:
        raise HTTPException(status_code=400, detail='Product title is required')
    plans = body.get('plans') or []
    doc = {
        'id': f"subprod_{uuid.uuid4().hex[:8]}",
        'title': title,
        'description': (body.get('description') or '').strip(),
        'categoryId': body.get('categoryId', ''),
        'categoryName': body.get('categoryName', 'General'),
        'image': body.get('image', ''),
        'plans': plans,
        'createdAt': digital_products.now_iso(),
        'updatedAt': digital_products.now_iso(),
    }
    await db.digital_subscription_products.insert_one(doc)
    return digital_products.clean_doc(doc)

@api_router.put("/admin/digital/subscription-products/{prod_id}")
async def update_sub_product(prod_id: str, body: dict, user: dict = Depends(require_admin)):
    upd = {'updatedAt': digital_products.now_iso()}
    for k in ['title', 'description', 'categoryId', 'categoryName', 'image', 'plans']:
        if k in body:
            upd[k] = body[k]
    res = await db.digital_subscription_products.update_one({'id': prod_id}, {'$set': upd})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail='Product not found')
    return digital_products.clean_doc(await db.digital_subscription_products.find_one({'id': prod_id}))

@api_router.delete("/admin/digital/subscription-products/{prod_id}")
async def delete_sub_product(prod_id: str, user: dict = Depends(require_admin)):
    res = await db.digital_subscription_products.delete_one({'id': prod_id})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail='Product not found')
    return {'ok': True, 'id': prod_id}

# --- Subscription Orders ---
@api_router.get("/admin/digital/subscription-orders")
async def list_sub_orders(user: dict = Depends(require_admin)):
    orders = await db.digital_subscription_orders.find().sort('createdAt', -1).to_list(200)
    return [digital_products.clean_doc(o) for o in orders]

@api_router.post("/admin/digital/subscription-orders")
async def create_sub_order(body: dict, user: dict = Depends(require_admin)):
    doc = {
        'id': f"subord_{uuid.uuid4().hex[:8]}",
        'userEmail': body.get('userEmail', 'buyer@example.com'),
        'userName': body.get('userName', 'Customer'),
        'productTitle': body.get('productTitle', 'Subscription Product'),
        'planName': body.get('planName', 'Monthly'),
        'price': float(body.get('price', 19.99)),
        'orderStatus': body.get('orderStatus', 'completed'),
        'createdAt': digital_products.now_iso(),
    }
    await db.digital_subscription_orders.insert_one(doc)
    return digital_products.clean_doc(doc)

# --- Gift Card Brands ---
@api_router.get("/admin/digital/gift-card-brands")
async def list_gc_brands(user: dict = Depends(require_admin)):
    brands = await db.digital_gift_card_brands.find().sort('name', 1).to_list(100)
    return [digital_products.clean_doc(b) for b in brands]

@api_router.post("/admin/digital/gift-card-brands")
async def create_gc_brand(body: dict, user: dict = Depends(require_admin)):
    name = (body.get('name') or '').strip()
    if not name:
        raise HTTPException(status_code=400, detail='Brand name is required')
    doc = {
        'id': f"gcbrand_{uuid.uuid4().hex[:8]}",
        'name': name,
        'logo': body.get('logo', ''),
        'description': (body.get('description') or '').strip(),
        'createdAt': digital_products.now_iso(),
        'updatedAt': digital_products.now_iso(),
    }
    await db.digital_gift_card_brands.insert_one(doc)
    return digital_products.clean_doc(doc)

@api_router.put("/admin/digital/gift-card-brands/{brand_id}")
async def update_gc_brand(brand_id: str, body: dict, user: dict = Depends(require_admin)):
    upd = {'updatedAt': digital_products.now_iso()}
    for k in ['name', 'logo', 'description']:
        if k in body:
            upd[k] = body[k]
    res = await db.digital_gift_card_brands.update_one({'id': brand_id}, {'$set': upd})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail='Brand not found')
    return digital_products.clean_doc(await db.digital_gift_card_brands.find_one({'id': brand_id}))

@api_router.delete("/admin/digital/gift-card-brands/{brand_id}")
async def delete_gc_brand(brand_id: str, user: dict = Depends(require_admin)):
    res = await db.digital_gift_card_brands.delete_one({'id': brand_id})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail='Brand not found')
    return {'ok': True, 'id': brand_id}

# --- Gift Cards ---
@api_router.get("/admin/digital/gift-cards")
async def list_gift_cards(user: dict = Depends(require_admin)):
    cards = await db.digital_gift_cards.find().sort('createdAt', -1).to_list(200)
    return [digital_products.clean_doc(c) for c in cards]

@api_router.post("/admin/digital/gift-cards")
async def create_gift_card(body: dict, user: dict = Depends(require_admin)):
    doc = {
        'id': f"gc_{uuid.uuid4().hex[:8]}",
        'brandId': body.get('brandId', ''),
        'brandName': body.get('brandName', 'Gift Card'),
        'image': body.get('image', ''),
        'description': body.get('description', ''),
        'stock': int(body.get('stock', 10)),
        'price': float(body.get('price', 25.0)),
        'status': body.get('status', 'ON'),
        'createdAt': digital_products.now_iso(),
        'updatedAt': digital_products.now_iso(),
    }
    await db.digital_gift_cards.insert_one(doc)
    return digital_products.clean_doc(doc)

@api_router.put("/admin/digital/gift-cards/{gc_id}")
async def update_gift_card(gc_id: str, body: dict, user: dict = Depends(require_admin)):
    upd = {'updatedAt': digital_products.now_iso()}
    for k in ['brandId', 'brandName', 'image', 'description', 'status']:
        if k in body:
            upd[k] = body[k]
    if 'stock' in body:
        upd['stock'] = int(body['stock'])
    if 'price' in body:
        upd['price'] = float(body['price'])
    res = await db.digital_gift_cards.update_one({'id': gc_id}, {'$set': upd})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail='Gift card not found')
    return digital_products.clean_doc(await db.digital_gift_cards.find_one({'id': gc_id}))

@api_router.delete("/admin/digital/gift-cards/{gc_id}")
async def delete_gift_card(gc_id: str, user: dict = Depends(require_admin)):
    res = await db.digital_gift_cards.delete_one({'id': gc_id})
    if not res.deleted_count:
        raise HTTPException(status_code=404, detail='Gift card not found')
    return {'ok': True, 'id': gc_id}

# --- Gift Card Orders ---
@api_router.get("/admin/digital/gift-card-orders")
async def list_gc_orders(user: dict = Depends(require_admin)):
    orders = await db.digital_gift_card_orders.find().sort('createdAt', -1).to_list(200)
    return [digital_products.clean_doc(o) for o in orders]

@api_router.post("/admin/digital/gift-card-orders")
async def create_gc_order(body: dict, user: dict = Depends(require_admin)):
    doc = {
        'id': f"gcord_{uuid.uuid4().hex[:8]}",
        'userEmail': body.get('userEmail', 'buyer@example.com'),
        'userName': body.get('userName', 'Customer'),
        'brandName': body.get('brandName', 'Brand'),
        'amount': float(body.get('amount', 25.0)),
        'orderStatus': body.get('orderStatus', 'completed'),
        'deliveryStatus': body.get('deliveryStatus', 'delivered'),
        'createdAt': digital_products.now_iso(),
    }
    await db.digital_gift_card_orders.insert_one(doc)
    return digital_products.clean_doc(doc)


# ===========================================================================
# MARKETPLACE COMMISSION SYSTEM (Admin only)
# ===========================================================================
DEFAULT_COMMISSION_SETTINGS = {
    'id': 'marketplace_commission_settings',
    'enabled': True,
    'percentage': 20.0,
    'updatedAt': datetime.now(timezone.utc).isoformat(),
    'updatedBy': 'system',
}

def compute_pricing_logic(seller_price: float, percentage: float, enabled: bool):
    s_price = round(max(0.0, float(seller_price or 0.0)), 2)
    pct = round(max(0.0, min(100.0, float(percentage or 0.0))), 2)
    if enabled and pct > 0:
        commission_amount = round(s_price * (pct / 100.0), 2)
        buyer_final_price = round(s_price + commission_amount, 2)
    else:
        commission_amount = 0.0
        buyer_final_price = s_price
    seller_payout = s_price
    return {
        'sellerPrice': s_price,
        'commissionPercentage': pct,
        'commissionAmount': commission_amount,
        'platformEarnings': commission_amount,
        'buyerFinalPrice': buyer_final_price,
        'sellerPayout': seller_payout,
    }


@api_router.get("/admin/commission/settings")
async def get_commission_settings(user: dict = Depends(require_admin)):
    doc = await db.commission_settings.find_one({'id': 'marketplace_commission_settings'})
    if not doc:
        doc = dict(DEFAULT_COMMISSION_SETTINGS)
        await db.commission_settings.insert_one(dict(doc))
    return clean(doc)


@api_router.put("/admin/commission/settings")
async def update_commission_settings(body: dict, user: dict = Depends(require_admin)):
    upd = {'updatedAt': now_iso(), 'updatedBy': user.get('email', 'admin')}
    if 'enabled' in body:
        upd['enabled'] = bool(body['enabled'])
    if 'percentage' in body:
        try:
            upd['percentage'] = round(max(0.0, min(100.0, float(body['percentage']))), 2)
        except (ValueError, TypeError):
            pass
    await db.commission_settings.update_one({'id': 'marketplace_commission_settings'}, {'$set': upd}, upsert=True)
    return clean(await db.commission_settings.find_one({'id': 'marketplace_commission_settings'}))


@api_router.post("/admin/commission/calculate")
async def calculate_commission(body: dict, user: dict = Depends(require_admin)):
    cfg = await db.commission_settings.find_one({'id': 'marketplace_commission_settings'})
    enabled = cfg.get('enabled', True) if cfg else True
    pct = cfg.get('percentage', 20.0) if cfg else 20.0
    if 'percentage' in body:
        pct = float(body['percentage'])
    if 'enabled' in body:
        enabled = bool(body['enabled'])
    s_price = float(body.get('sellerPrice', 10.0))
    return compute_pricing_logic(s_price, pct, enabled)


@api_router.get("/admin/commission/overview")
async def get_commission_overview(user: dict = Depends(require_admin)):
    cfg = await db.commission_settings.find_one({'id': 'marketplace_commission_settings'})
    enabled = cfg.get('enabled', True) if cfg else True
    pct = cfg.get('percentage', 20.0) if cfg else 20.0

    products = await db.seller_products.find({'status': {'$ne': 'deleted'}}).limit(50).to_list(50)
    if not products:
        products = await db.products.find().limit(20).to_list(20)

    items = []
    for p in products:
        s_price = float(p.get('price', 10.0))
        calc = compute_pricing_logic(s_price, pct, enabled)
        items.append({
            'id': p.get('id'),
            'title': p.get('title', 'Product'),
            'category': p.get('category', 'General'),
            **calc
        })

    example = compute_pricing_logic(10.0, pct, enabled)
    return {
        'settings': {'enabled': enabled, 'percentage': pct},
        'example': example,
        'items': items,
    }


# ===========================================================================
# SIGNUP BONUS PROTECTION SYSTEM (Admin & User Endpoints)
# ===========================================================================
def _extract_client_meta(request: Request, body_device_id: Optional[str] = None):
    dev_id = (body_device_id or '').strip()
    if not dev_id:
        dev_id = (request.headers.get('x-device-id') or request.headers.get('X-Device-Id') or '').strip()
    forwarded = request.headers.get('x-forwarded-for')
    if forwarded:
        ip = forwarded.split(',')[0].strip()
    else:
        ip = (request.client.host if request.client else '').strip()
    return dev_id, ip


@api_router.get("/bonus/status")
async def get_bonus_status(request: Request):
    settings = await bonus_protection.get_or_create_settings(db)
    user = await get_optional_user(request)
    user_status = None
    if user:
        # fetch fresh user
        u = await db.users.find_one({'id': user['id']})
        record = await db.bonus_records.find_one({'userId': user['id']}, sort=[('createdAt', -1)])
        user_status = {
            'userId': user['id'],
            'email': user.get('email'),
            'isEmailVerified': bool((u or {}).get('isEmailVerified')),
            'isPhoneVerified': bool((u or {}).get('isPhoneVerified')),
            'bonusReceived': bool((u or {}).get('bonusReceived')),
            'bonusStatus': (u or {}).get('bonusStatus', 'unclaimed'),
            'isSuspicious': bool((u or {}).get('isSuspicious')),
            'suspiciousReasons': (u or {}).get('suspiciousReasons', []),
            'walletBalance': float((u or {}).get('walletBalance') or 0.0),
            'latestRecord': bonus_protection.clean_doc(record),
        }
    return {
        'settings': {
            'enabled': settings.get('enabled', True),
            'bonusAmount': settings.get('bonusAmount', 10.0),
            'requireFirstPurchase': settings.get('requireFirstPurchase', False),
            'minPurchaseAmount': settings.get('minPurchaseAmount', 20.0),
            'requireVerifiedEmail': settings.get('requireVerifiedEmail', True),
            'requireVerifiedPhone': settings.get('requireVerifiedPhone', False),
            'oneBonusPerDevice': settings.get('oneBonusPerDevice', True),
            'detectDuplicateAccounts': settings.get('detectDuplicateAccounts', True),
        },
        'userStatus': user_status
    }


@api_router.post("/bonus/evaluate")
async def evaluate_user_bonus(request: Request, body: dict = None, user: dict = Depends(get_current_user)):
    body = body or {}
    dev_id, ip = _extract_client_meta(request, body.get('deviceId'))
    fresh_user = await db.users.find_one({'id': user['id']})
    res = await bonus_protection.evaluate_fraud_and_bonus(db, fresh_user, device_id=dev_id, ip_address=ip)
    return res


@api_router.post("/bonus/verify-email")
async def verify_user_email(request: Request, body: dict = None, user: dict = Depends(get_current_user)):
    # Mark user email as verified
    await db.users.update_one({'id': user['id']}, {'$set': {'isEmailVerified': True, 'updatedAt': now_iso()}})
    fresh_user = await db.users.find_one({'id': user['id']})
    
    # Automatically evaluate bonus upon email verification
    body = body or {}
    dev_id, ip = _extract_client_meta(request, body.get('deviceId'))
    evaluation = await bonus_protection.evaluate_fraud_and_bonus(db, fresh_user, device_id=dev_id, ip_address=ip)
    return {
        'ok': True,
        'message': 'Email successfully verified.',
        'user': sanitize_user(await db.users.find_one({'id': user['id']})),
        'evaluation': evaluation
    }


@api_router.post("/bonus/verify-phone")
async def verify_user_phone(request: Request, body: dict = None, user: dict = Depends(get_current_user)):
    body = body or {}
    phone = (body.get('phone') or user.get('phone') or '').strip()
    upd = {'isPhoneVerified': True, 'updatedAt': now_iso()}
    if phone:
        upd['phone'] = phone
    await db.users.update_one({'id': user['id']}, {'$set': upd})
    fresh_user = await db.users.find_one({'id': user['id']})
    
    dev_id, ip = _extract_client_meta(request, body.get('deviceId'))
    evaluation = await bonus_protection.evaluate_fraud_and_bonus(db, fresh_user, device_id=dev_id, ip_address=ip)
    return {
        'ok': True,
        'message': 'Phone successfully verified.',
        'user': sanitize_user(await db.users.find_one({'id': user['id']})),
        'evaluation': evaluation
    }


# ============ ADMIN BONUS PROTECTION ENDPOINTS ============
@api_router.get("/admin/bonus/settings")
async def admin_get_bonus_settings(user: dict = Depends(require_admin)):
    return await bonus_protection.get_or_create_settings(db)


@api_router.put("/admin/bonus/settings")
async def admin_update_bonus_settings(body: dict, user: dict = Depends(require_admin)):
    return await bonus_protection.update_settings(db, body, user)


@api_router.get("/admin/bonus/history")
async def admin_bonus_history(
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    user: dict = Depends(require_admin)
):
    query = {}
    if status and status != 'all':
        query['status'] = status
    if search:
        s = search.strip()
        query['$or'] = [
            {'userEmail': {'$regex': s, '$options': 'i'}},
            {'username': {'$regex': s, '$options': 'i'}},
            {'fullName': {'$regex': s, '$options': 'i'}},
            {'deviceId': {'$regex': s, '$options': 'i'}},
            {'ipAddress': {'$regex': s, '$options': 'i'}},
        ]
    records = []
    async for r in db.bonus_records.find(query).sort('createdAt', -1).limit(limit):
        records.append(bonus_protection.clean_doc(r))
    return records


@api_router.get("/admin/bonus/user-status")
async def admin_bonus_user_status(
    status: Optional[str] = None,
    search: Optional[str] = None,
    user: dict = Depends(require_admin)
):
    query = {}
    if search:
        s = search.strip()
        query['$or'] = [
            {'email': {'$regex': s, '$options': 'i'}},
            {'username': {'$regex': s, '$options': 'i'}},
            {'fullName': {'$regex': s, '$options': 'i'}},
        ]
    if status and status != 'all':
        if status == 'suspicious':
            query['isSuspicious'] = True
        elif status in ('credited', 'pending_review', 'rejected', 'unclaimed'):
            query['bonusStatus'] = status

    users_list = []
    async for u in db.users.find(query).sort('createdAt', -1).limit(200):
        # find user's latest bonus record
        record = await db.bonus_records.find_one({'userId': u['id']}, sort=[('createdAt', -1)])
        users_list.append({
            'id': u['id'],
            'email': u.get('email'),
            'username': u.get('username'),
            'fullName': u.get('fullName'),
            'phone': u.get('phone', ''),
            'role': u.get('role', 'buyer'),
            'walletBalance': float(u.get('walletBalance') or 0.0),
            'isEmailVerified': bool(u.get('isEmailVerified')),
            'isPhoneVerified': bool(u.get('isPhoneVerified')),
            'bonusReceived': bool(u.get('bonusReceived')),
            'bonusStatus': u.get('bonusStatus', 'unclaimed'),
            'isSuspicious': bool(u.get('isSuspicious')),
            'suspiciousReasons': u.get('suspiciousReasons', []),
            'createdAt': u.get('createdAt'),
            'latestRecord': bonus_protection.clean_doc(record),
        })
    return users_list


@api_router.get("/admin/bonus/suspicious-users")
async def admin_bonus_suspicious_users(user: dict = Depends(require_admin)):
    # Find all users with isSuspicious == True or bonus records pending review
    suspicious_users = []
    seen_ids = set()

    async for u in db.users.find({'isSuspicious': True}).sort('updatedAt', -1):
        seen_ids.add(u['id'])
        record = await db.bonus_records.find_one({'userId': u['id']}, sort=[('createdAt', -1)])
        suspicious_users.append({
            'userId': u['id'],
            'email': u.get('email'),
            'username': u.get('username'),
            'fullName': u.get('fullName'),
            'phone': u.get('phone', ''),
            'walletBalance': float(u.get('walletBalance') or 0.0),
            'isEmailVerified': bool(u.get('isEmailVerified')),
            'isPhoneVerified': bool(u.get('isPhoneVerified')),
            'isSuspicious': True,
            'suspiciousReasons': u.get('suspiciousReasons', []),
            'bonusStatus': u.get('bonusStatus', 'pending_review'),
            'bonusRecord': bonus_protection.clean_doc(record),
            'createdAt': u.get('createdAt'),
            'updatedAt': u.get('updatedAt'),
        })

    # Also catch any bonus records with status == 'pending_review' not already in list
    async for r in db.bonus_records.find({'status': 'pending_review'}).sort('createdAt', -1):
        if r['userId'] not in seen_ids:
            seen_ids.add(r['userId'])
            u = await db.users.find_one({'id': r['userId']})
            suspicious_users.append({
                'userId': r['userId'],
                'email': r.get('userEmail'),
                'username': r.get('username'),
                'fullName': r.get('fullName'),
                'phone': (u or {}).get('phone', ''),
                'walletBalance': float((u or {}).get('walletBalance') or 0.0),
                'isEmailVerified': bool((u or {}).get('isEmailVerified')),
                'isPhoneVerified': bool((u or {}).get('isPhoneVerified')),
                'isSuspicious': True,
                'suspiciousReasons': r.get('suspiciousReasons', []),
                'bonusStatus': 'pending_review',
                'bonusRecord': bonus_protection.clean_doc(r),
                'createdAt': r.get('createdAt'),
                'updatedAt': r.get('updatedAt'),
            })

    return suspicious_users


@api_router.post("/admin/bonus/review")
async def admin_bonus_review_action(body: dict, user: dict = Depends(require_admin)):
    action = body.get('action')
    bonus_id = body.get('bonusId')
    user_id = body.get('userId')
    note = body.get('note', '')

    if action == 'approve':
        if not bonus_id:
            # find by userId
            rec = await db.bonus_records.find_one({'userId': user_id, 'status': 'pending_review'})
            if rec:
                bonus_id = rec['id']
            else:
                raise HTTPException(status_code=400, detail='bonusId required for approval')
        try:
            res = await bonus_protection.admin_approve_bonus(db, bonus_id, user, note)
            return {'ok': True, 'action': 'approved', 'record': res}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    elif action == 'reject':
        if not bonus_id:
            rec = await db.bonus_records.find_one({'userId': user_id, 'status': 'pending_review'})
            if rec:
                bonus_id = rec['id']
            else:
                raise HTTPException(status_code=400, detail='bonusId required for rejection')
        try:
            res = await bonus_protection.admin_reject_bonus(db, bonus_id, user, note)
            return {'ok': True, 'action': 'rejected', 'record': res}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    elif action == 'clear_suspicious':
        if not user_id:
            raise HTTPException(status_code=400, detail='userId required to clear suspicious flag')
        try:
            res = await bonus_protection.admin_clear_suspicious(db, user_id, user)
            return {'ok': True, 'action': 'cleared', 'user': sanitize_user(res)}
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    else:
        raise HTTPException(status_code=400, detail=f"Invalid action: {action}. Must be approve, reject, or clear_suspicious.")



app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Indexes
    try:
        await db.users.create_index('email', unique=True)
        await db.users.create_index('username', unique=True)
        await db.users.create_index('id', unique=True)
        await db.orders.create_index('id', unique=True)
        await db.reviews.create_index('id', unique=True)
        await db.password_reset_tokens.create_index('expiresAt', expireAfterSeconds=0)
        await db.products.create_index('id', unique=True)
    except Exception as e:
        logger.warning(f"index setup: {e}")
    # Seed catalog products (idempotent upsert by id)
    try:
        for p in build_seed_products():
            await db.products.update_one({'id': p['id']}, {'$setOnInsert': p}, upsert=True)
        count = await db.products.count_documents({})
        logger.info(f"Catalog products in DB: {count}")
    except Exception as e:
        logger.error(f"product seed failed: {e}")
    # Seed admin
    try:
        existing = await db.users.find_one({'email': ADMIN_EMAIL})
        if not existing:
            await db.users.insert_one({
                'id': f"u_{uuid.uuid4().hex[:12]}",
                'fullName': 'Admin',
                'username': 'admin',
                'email': ADMIN_EMAIL,
                'phone': '', 'country': '',
                'accountType': 'both', 'role': 'admin',
                'profilePhoto': '', 'skills': [], 'services': [],
                'company': {'name': '', 'website': '', 'industry': ''},
                'passwordHash': hash_password(ADMIN_PASSWORD),
                'createdAt': now_iso(), 'updatedAt': now_iso(),
            })
            logger.info(f"Seeded admin {ADMIN_EMAIL}")
        elif not verify_password(ADMIN_PASSWORD, existing.get('passwordHash', '')):
            await db.users.update_one({'email': ADMIN_EMAIL}, {'$set': {'passwordHash': hash_password(ADMIN_PASSWORD), 'role': 'admin'}})
        elif existing.get('role') != 'admin':
            await db.users.update_one({'email': ADMIN_EMAIL}, {'$set': {'role': 'admin'}})
    except Exception as e:
        logger.error(f"admin seed failed: {e}")
    # Storage
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    # Digital products initial seed
    try:
        await digital_products.ensure_initial_seed(db)
        logger.info("Digital products initial seed verified")
    except Exception as e:
        logger.warning(f"digital products seed warning: {e}")
    # Advanced Admin Tools initial seed
    try:
        await advanced_admin_tools.ensure_initial_seed(db)
        logger.info("Advanced admin tools seed verified")
    except Exception as e:
        logger.warning(f"advanced admin tools seed warning: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
