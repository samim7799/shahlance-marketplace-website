"""Signup Bonus Protection System module for ShahLance.
Provides:
- Bonus Settings (Admin only)
- Fraud Protection checks:
  * One device can receive bonus only once
  * Require verified email before bonus
  * Require verified phone before bonus (if phone system exists or configured)
  * Detect duplicate accounts using existing user data (duplicate IP, phone, full name, disposable/plus emails)
  * Mark suspicious accounts and withhold bonus for admin review
- Admin Controls:
  * Bonus history
  * User bonus status
  * Suspicious user list with triage actions (Approve, Reject, Dismiss flag)
"""
import re
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

DEFAULT_BONUS_SETTINGS = {
    "id": "signup_bonus_settings",
    "enabled": True,
    "bonusAmount": 10.0,
    "requireFirstPurchase": False,
    "minPurchaseAmount": 20.0,
    "requireVerifiedEmail": True,
    "requireVerifiedPhone": False,
    "oneBonusPerDevice": True,
    "detectDuplicateAccounts": True,
    "updatedAt": datetime.now(timezone.utc).isoformat(),
    "updatedBy": "system",
}

DISPOSABLE_EMAIL_DOMAINS = {
    "tempmail.com", "10minutemail.com", "guerrillamail.com", "mailinator.com",
    "throwawaymail.com", "trashmail.com", "sharklasers.com", "yopmail.com",
    "dispostable.com", "getairmail.com", "fakemailgenerator.com"
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_doc(doc: Optional[dict]) -> Optional[dict]:
    if not doc:
        return None
    doc = dict(doc)
    doc.pop('_id', None)
    return doc


async def get_or_create_settings(db) -> dict:
    settings = await db.bonus_settings.find_one({'id': 'signup_bonus_settings'})
    if not settings:
        settings = dict(DEFAULT_BONUS_SETTINGS)
        await db.bonus_settings.insert_one(settings)
    return clean_doc(settings)


async def update_settings(db, patch: dict, admin_user: dict) -> dict:
    current = await get_or_create_settings(db)
    upd = {}
    if 'enabled' in patch:
        upd['enabled'] = bool(patch['enabled'])
    if 'bonusAmount' in patch:
        try:
            val = round(float(patch['bonusAmount']), 2)
            if val < 0:
                raise ValueError
            upd['bonusAmount'] = val
        except (TypeError, ValueError):
            pass
    if 'requireFirstPurchase' in patch:
        upd['requireFirstPurchase'] = bool(patch['requireFirstPurchase'])
    if 'minPurchaseAmount' in patch:
        try:
            val = round(float(patch['minPurchaseAmount']), 2)
            if val < 0:
                raise ValueError
            upd['minPurchaseAmount'] = val
        except (TypeError, ValueError):
            pass
    if 'requireVerifiedEmail' in patch:
        upd['requireVerifiedEmail'] = bool(patch['requireVerifiedEmail'])
    if 'requireVerifiedPhone' in patch:
        upd['requireVerifiedPhone'] = bool(patch['requireVerifiedPhone'])
    if 'oneBonusPerDevice' in patch:
        upd['oneBonusPerDevice'] = bool(patch['oneBonusPerDevice'])
    if 'detectDuplicateAccounts' in patch:
        upd['detectDuplicateAccounts'] = bool(patch['detectDuplicateAccounts'])

    upd['updatedAt'] = now_iso()
    upd['updatedBy'] = admin_user.get('email') or admin_user.get('id') or 'admin'

    await db.bonus_settings.update_one({'id': 'signup_bonus_settings'}, {'$set': upd}, upsert=True)
    return clean_doc(await db.bonus_settings.find_one({'id': 'signup_bonus_settings'}))


async def evaluate_fraud_and_bonus(
    db,
    user: dict,
    device_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    purchase_amount: float = 0.0,
    is_purchase_trigger: bool = False
) -> Dict[str, Any]:
    """
    Evaluates signup bonus eligibility & fraud checks.
    Withholds bonus and flags account as suspicious if fraud checks trigger.
    Credits wallet if all criteria pass.
    """
    settings = await get_or_create_settings(db)
    uid = user['id']
    device_id = (device_id or '').strip()
    ip_address = (ip_address or '').strip()

    # 1. System enabled check
    if not settings.get('enabled', True):
        return {
            'eligible': False,
            'status': 'disabled',
            'message': 'Signup bonus is currently disabled by administrator.',
            'settings': settings
        }

    # 2. Check if user already received bonus
    existing_credited = await db.bonus_records.find_one({'userId': uid, 'status': 'credited'})
    if existing_credited or user.get('bonusReceived'):
        return {
            'eligible': False,
            'status': 'already_received',
            'record': clean_doc(existing_credited),
            'message': 'Signup bonus has already been credited to this account.'
        }

    # 3. Check if bonus is currently pending review
    pending_record = await db.bonus_records.find_one({'userId': uid, 'status': 'pending_review'})
    if pending_record and not is_purchase_trigger:
        return {
            'eligible': False,
            'status': 'pending_review',
            'isSuspicious': True,
            'reasons': pending_record.get('suspiciousReasons', []),
            'record': clean_doc(pending_record),
            'message': 'Your signup bonus is currently on hold and pending admin security review.'
        }

    # 4. First Purchase requirement check (if enabled)
    min_purchase = float(settings.get('minPurchaseAmount', 20.0))
    if settings.get('requireFirstPurchase', False):
        has_qualifying_purchase = False
        if is_purchase_trigger and purchase_amount >= min_purchase:
            has_qualifying_purchase = True
        else:
            # Check existing completed orders
            qualifying_orders = await db.orders.find({
                'buyerId': uid,
                'paymentStatus': 'paid',
                'price': {'$gte': min_purchase}
            }).to_list(1)
            if qualifying_orders:
                has_qualifying_purchase = True

        if not has_qualifying_purchase:
            return {
                'eligible': False,
                'status': 'requires_purchase',
                'minPurchaseAmount': min_purchase,
                'message': f"A qualifying first purchase of at least ${min_purchase:.2f} is required before receiving the signup bonus."
            }

    # 5. Verified Email requirement check
    is_email_verified = bool(user.get('isEmailVerified') or user.get('emailVerified'))
    if settings.get('requireVerifiedEmail', True) and not is_email_verified:
        return {
            'eligible': False,
            'status': 'pending_email_verification',
            'message': 'Email verification is required before receiving the signup bonus. Please verify your email.'
        }

    # 6. Verified Phone requirement check (if user has phone and rule active)
    user_phone = (user.get('phone') or '').strip()
    is_phone_verified = bool(user.get('isPhoneVerified') or user.get('phoneVerified'))
    if settings.get('requireVerifiedPhone', False):
        if not user_phone:
            return {
                'eligible': False,
                'status': 'pending_phone_verification',
                'message': 'A verified phone number is required before receiving the signup bonus.'
            }
        if not is_phone_verified:
            return {
                'eligible': False,
                'status': 'pending_phone_verification',
                'message': 'Phone verification is required before receiving the signup bonus. Please verify your phone.'
            }

    # -------------------------------------------------------------------------
    # FRAUD DETECTION CHECKS
    # -------------------------------------------------------------------------
    suspicious_reasons: List[str] = []

    # Check 1: One device can receive bonus only once
    if settings.get('oneBonusPerDevice', True):
        if not device_id:
            suspicious_reasons.append("Missing device fingerprint / hardware identifier.")
        else:
            # Check if any other account received bonus on this device
            device_match = await db.bonus_records.find_one({
                'deviceId': device_id,
                'userId': {'$ne': uid},
                'status': {'$in': ['credited', 'pending_review']}
            })
            if device_match:
                suspicious_reasons.append(
                    f"Device fingerprint '{device_id[:12]}...' was already used to receive a bonus by account {device_match.get('userEmail', 'unknown')}."
                )

            # Also check device ledger
            ledger_entry = await db.bonus_device_ledger.find_one({
                'deviceId': device_id,
                'firstUserId': {'$ne': uid}
            })
            if ledger_entry and not device_match:
                suspicious_reasons.append(
                    f"Device fingerprint is already registered to user '{ledger_entry.get('firstEmail')}'."
                )

    # Check 2: Detect duplicate accounts using existing user data
    if settings.get('detectDuplicateAccounts', True):
        # 2a. Duplicate Phone Number across accounts
        if user_phone:
            dup_phone_users = await db.users.find({
                'phone': user_phone,
                'id': {'$ne': uid}
            }).to_list(10)
            if dup_phone_users:
                dup_emails = [u.get('email', 'unknown') for u in dup_phone_users]
                suspicious_reasons.append(
                    f"Phone number '{user_phone}' is linked to other existing account(s): {', '.join(dup_emails)}."
                )

        # 2b. Duplicate IP Address across bonus records
        safe_ips = {'127.0.0.1', 'localhost', '::1', ''}
        if ip_address and ip_address not in safe_ips:
            dup_ip_records = await db.bonus_records.find({
                'ipAddress': ip_address,
                'userId': {'$ne': uid},
                'status': {'$in': ['credited', 'pending_review']}
            }).to_list(5)
            if dup_ip_records:
                dup_emails = list({r.get('userEmail', 'unknown') for r in dup_ip_records})
                suspicious_reasons.append(
                    f"IP address '{ip_address}' is shared with existing bonus claimant(s): {', '.join(dup_emails)}."
                )

        # 2c. Disposable Email Domain
        user_email = user.get('email', '').strip().lower()
        domain = user_email.split('@')[-1] if '@' in user_email else ''
        if domain in DISPOSABLE_EMAIL_DOMAINS:
            suspicious_reasons.append(
                f"Disposable/temporary email service detected (@{domain})."
            )

        # 2d. Plus-addressing duplicate detection (e.g. user+1@gmail.com)
        if '@' in user_email:
            local_part, dom = user_email.split('@', 1)
            if '+' in local_part:
                base_local = local_part.split('+', 1)[0]
                regex = f"^{re.escape(base_local)}(\\+.*)?@{re.escape(dom)}$"
                alias_matches = await db.users.find({
                    'email': {'$regex': regex, '$options': 'i'},
                    'id': {'$ne': uid}
                }).to_list(5)
                if alias_matches:
                    match_emails = [u.get('email') for u in alias_matches]
                    suspicious_reasons.append(
                        f"Alias/plus-addressing duplicate detected with root account(s): {', '.join(match_emails)}."
                    )

        # 2e. Identical Full Name cluster detection
        full_name = (user.get('fullName') or '').strip().lower()
        if len(full_name) >= 3:
            name_matches = await db.users.find({
                'fullName': {'$regex': f"^{re.escape(user.get('fullName'))}$", '$options': 'i'},
                'id': {'$ne': uid}
            }).to_list(5)
            if len(name_matches) >= 2:
                name_emails = [u.get('email') for u in name_matches]
                suspicious_reasons.append(
                    f"Identical full name matched {len(name_matches)} other accounts: {', '.join(name_emails)}."
                )

    # -------------------------------------------------------------------------
    # FRAUD ACTION: If suspicious, withhold bonus & mark account suspicious
    # -------------------------------------------------------------------------
    if suspicious_reasons:
        bonus_id = pending_record['id'] if pending_record else f"bn_{uuid.uuid4().hex[:12]}"
        bonus_record = {
            'id': bonus_id,
            'userId': uid,
            'userEmail': user.get('email'),
            'username': user.get('username'),
            'fullName': user.get('fullName'),
            'amount': float(settings.get('bonusAmount', 10.0)),
            'status': 'pending_review',
            'deviceId': device_id,
            'ipAddress': ip_address,
            'isSuspicious': True,
            'suspiciousReasons': suspicious_reasons,
            'adminReviewedBy': None,
            'adminReviewedAt': None,
            'reviewNote': 'Flagged automatically by fraud protection engine',
            'createdAt': pending_record.get('createdAt') if pending_record else now_iso(),
            'updatedAt': now_iso(),
        }

        await db.bonus_records.update_one({'id': bonus_id}, {'$set': bonus_record}, upsert=True)

        # Mark user as suspicious in users collection
        await db.users.update_one(
            {'id': uid},
            {
                '$set': {
                    'isSuspicious': True,
                    'suspiciousReasons': suspicious_reasons,
                    'bonusStatus': 'pending_review',
                    'updatedAt': now_iso(),
                }
            }
        )

        return {
            'eligible': False,
            'status': 'pending_review',
            'isSuspicious': True,
            'reasons': suspicious_reasons,
            'bonusId': bonus_id,
            'message': 'Account flagged for security review due to fraud protection policies. Signup bonus is held pending administrator review.'
        }

    # -------------------------------------------------------------------------
    # SUCCESS: ALL CHECKS PASS! Credit bonus to user's wallet
    # -------------------------------------------------------------------------
    bonus_amount = float(settings.get('bonusAmount', 10.0))
    current_balance = float(user.get('walletBalance') or 0.0)
    new_balance = round(current_balance + bonus_amount, 2)

    # 1. Update user
    await db.users.update_one(
        {'id': uid},
        {
            '$set': {
                'walletBalance': new_balance,
                'bonusReceived': True,
                'bonusStatus': 'credited',
                'isSuspicious': False,
                'suspiciousReasons': [],
                'updatedAt': now_iso(),
            }
        }
    )

    # 2. Add wallet transaction (matches existing wallet schema)
    wt_id = f"wt_{uuid.uuid4().hex[:12]}"
    wallet_txn = {
        'id': wt_id,
        'userId': uid,
        'type': 'bonus',
        'amount': bonus_amount,
        'note': f"Signup welcome bonus credited (${bonus_amount:.2f})",
        'adminId': 'system_bonus',
        'balanceAfter': new_balance,
        'createdAt': now_iso(),
    }
    await db.wallet_transactions.insert_one(wallet_txn)

    # 3. Insert/update bonus record
    bonus_id = pending_record['id'] if pending_record else f"bn_{uuid.uuid4().hex[:12]}"
    record = {
        'id': bonus_id,
        'userId': uid,
        'userEmail': user.get('email'),
        'username': user.get('username'),
        'fullName': user.get('fullName'),
        'amount': bonus_amount,
        'status': 'credited',
        'deviceId': device_id,
        'ipAddress': ip_address,
        'isSuspicious': False,
        'suspiciousReasons': [],
        'walletTxnId': wt_id,
        'creditedAt': now_iso(),
        'createdAt': pending_record.get('createdAt') if pending_record else now_iso(),
        'updatedAt': now_iso(),
    }
    await db.bonus_records.update_one({'id': bonus_id}, {'$set': record}, upsert=True)

    # 4. Record device in ledger
    if device_id:
        await db.bonus_device_ledger.update_one(
            {'deviceId': device_id},
            {
                '$set': {
                    'deviceId': device_id,
                    'firstUserId': uid,
                    'firstEmail': user.get('email'),
                    'bonusId': bonus_id,
                    'creditedAt': now_iso(),
                }
            },
            upsert=True
        )

    return {
        'eligible': True,
        'status': 'credited',
        'amount': bonus_amount,
        'newBalance': new_balance,
        'bonusId': bonus_id,
        'message': f"Congratulations! ${bonus_amount:.2f} signup bonus has been credited to your wallet."
    }


# ---------------------------------------------------------------------------
# Admin Management Operations
# ---------------------------------------------------------------------------
async def admin_approve_bonus(db, bonus_id: str, admin_user: dict, note: str = '') -> dict:
    record = await db.bonus_records.find_one({'id': bonus_id})
    if not record:
        raise ValueError("Bonus record not found")

    if record.get('status') == 'credited':
        return clean_doc(record)

    uid = record['userId']
    user = await db.users.find_one({'id': uid})
    if not user:
        raise ValueError("User not found for this bonus record")

    amount = float(record.get('amount') or 10.0)
    current_balance = float(user.get('walletBalance') or 0.0)
    new_balance = round(current_balance + amount, 2)

    # Update user wallet & status
    await db.users.update_one(
        {'id': uid},
        {
            '$set': {
                'walletBalance': new_balance,
                'bonusReceived': True,
                'bonusStatus': 'credited',
                'isSuspicious': False,
                'updatedAt': now_iso(),
            }
        }
    )

    # Log wallet transaction
    wt_id = f"wt_{uuid.uuid4().hex[:12]}"
    await db.wallet_transactions.insert_one({
        'id': wt_id,
        'userId': uid,
        'type': 'bonus',
        'amount': amount,
        'note': f"Signup bonus approved by admin ({admin_user.get('email')}): {note or 'Manual approval'}",
        'adminId': admin_user.get('id', 'admin'),
        'balanceAfter': new_balance,
        'createdAt': now_iso(),
    })

    # Update bonus record
    upd = {
        'status': 'credited',
        'walletTxnId': wt_id,
        'isSuspicious': False,
        'adminReviewedBy': admin_user.get('email') or admin_user.get('id'),
        'adminReviewedAt': now_iso(),
        'reviewNote': note or 'Approved by admin',
        'creditedAt': now_iso(),
        'updatedAt': now_iso(),
    }
    await db.bonus_records.update_one({'id': bonus_id}, {'$set': upd})

    # Record device in ledger
    if record.get('deviceId'):
        await db.bonus_device_ledger.update_one(
            {'deviceId': record['deviceId']},
            {
                '$set': {
                    'deviceId': record['deviceId'],
                    'firstUserId': uid,
                    'firstEmail': user.get('email'),
                    'bonusId': bonus_id,
                    'creditedAt': now_iso(),
                }
            },
            upsert=True
        )

    return clean_doc(await db.bonus_records.find_one({'id': bonus_id}))


async def admin_reject_bonus(db, bonus_id: str, admin_user: dict, note: str = '') -> dict:
    record = await db.bonus_records.find_one({'id': bonus_id})
    if not record:
        raise ValueError("Bonus record not found")

    upd = {
        'status': 'rejected',
        'adminReviewedBy': admin_user.get('email') or admin_user.get('id'),
        'adminReviewedAt': now_iso(),
        'reviewNote': note or 'Rejected by admin security triage',
        'updatedAt': now_iso(),
    }
    await db.bonus_records.update_one({'id': bonus_id}, {'$set': upd})
    await db.users.update_one(
        {'id': record['userId']},
        {'$set': {'bonusStatus': 'rejected', 'updatedAt': now_iso()}}
    )
    return clean_doc(await db.bonus_records.find_one({'id': bonus_id}))


async def admin_clear_suspicious(db, user_id: str, admin_user: dict) -> dict:
    user = await db.users.find_one({'id': user_id})
    if not user:
        raise ValueError("User not found")

    await db.users.update_one(
        {'id': user_id},
        {
            '$set': {
                'isSuspicious': False,
                'suspiciousReasons': [],
                'updatedAt': now_iso(),
            }
        }
    )
    await db.bonus_records.update_many(
        {'userId': user_id},
        {'$set': {'isSuspicious': False, 'updatedAt': now_iso()}}
    )
    return clean_doc(await db.users.find_one({'id': user_id}))
