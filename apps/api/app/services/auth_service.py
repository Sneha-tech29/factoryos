"""Owner authentication, password hashing, and session management service for FactoryOS."""

import hashlib
import hmac
import os
import secrets
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, Tuple


def hash_password(password: str) -> Tuple[str, str]:
    """Hashes password with PBKDF2-HMAC-SHA512 using a unique 16-byte salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha512", password.encode("utf-8"), bytes.fromhex(salt), 100000, 64)
    return key.hex(), salt


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Timing-safe password verification."""
    key = hashlib.pbkdf2_hmac("sha512", password.encode("utf-8"), bytes.fromhex(salt), 100000, 64)
    return hmac.compare_digest(key.hex(), stored_hash)


class AuthService:
    @staticmethod
    def register_owner(
        conn,
        full_name: str,
        email: str,
        password: str
    ) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        if not full_name or len(full_name.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters long.")
        if "@" not in email_clean or "." not in email_clean:
            raise ValueError("Invalid email format.")
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long.")

        cursor = conn.cursor()
        existing = cursor.execute("SELECT id FROM users WHERE email = ? COLLATE NOCASE", (email_clean,)).fetchone()
        if existing:
            raise ValueError("An account with this email address already exists.")

        pwd_hash, salt = hash_password(password)
        user_id = f"usr_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()

        cursor.execute("""
            INSERT INTO users (id, full_name, email, password_hash, salt, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'OWNER', ?, ?)
        """, (user_id, full_name.strip(), email_clean, pwd_hash, salt, now, now))

        # Initial factory
        factory_id = f"fac_{uuid.uuid4().hex[:8]}"
        factory_name = f"{full_name.strip()}'s Factory"

        cursor.execute("""
            INSERT INTO factories (id, owner_id, name, is_setup_complete, current_setup_step, created_at, updated_at)
            VALUES (?, ?, ?, 0, 1, ?, ?)
        """, (factory_id, user_id, factory_name, now, now))

        cursor.execute("""
            INSERT INTO setup_progress (id, factory_id, current_step, completed_steps, step_data, updated_at)
            VALUES (?, ?, 1, '[]', '{}', ?)
        """, (f"prog_{uuid.uuid4().hex[:8]}", factory_id, now))

        token = secrets.token_hex(32)
        expires = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()

        cursor.execute("""
            INSERT INTO sessions (token, user_id, expires_at, created_at)
            VALUES (?, ?, ?, ?)
        """, (token, user_id, expires, now))

        conn.commit()

        return {
            "user_id": user_id,
            "full_name": full_name.strip(),
            "email": email_clean,
            "factory_id": factory_id,
            "token": token,
            "is_setup_complete": False,
            "current_setup_step": 1
        }

    @staticmethod
    def authenticate_owner(conn, email: str, password: str) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        cursor = conn.cursor()
        row = cursor.execute("""
            SELECT id, full_name, email, password_hash, salt, role
            FROM users WHERE email = ? COLLATE NOCASE
        """, (email_clean,)).fetchone()

        if not row:
            raise PermissionError("Invalid email or password.")

        if not verify_password(password, row["password_hash"], row["salt"]):
            raise PermissionError("Invalid email or password.")

        user_id = row["id"]
        factory_row = cursor.execute("""
            SELECT id, name, is_setup_complete, current_setup_step
            FROM factories WHERE owner_id = ? ORDER BY created_at ASC LIMIT 1
        """, (user_id,)).fetchone()

        token = secrets.token_hex(32)
        now = datetime.now(timezone.utc).isoformat()
        expires = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()

        cursor.execute("""
            INSERT INTO sessions (token, user_id, expires_at, created_at)
            VALUES (?, ?, ?, ?)
        """, (token, user_id, expires, now))
        conn.commit()

        is_setup_complete = bool(factory_row["is_setup_complete"]) if factory_row else False
        current_step = factory_row["current_setup_step"] if factory_row else 1

        return {
            "user_id": user_id,
            "full_name": row["full_name"],
            "email": row["email"],
            "factory_id": factory_row["id"] if factory_row else None,
            "factory_name": factory_row["name"] if factory_row else None,
            "token": token,
            "is_setup_complete": is_setup_complete,
            "current_setup_step": current_step
        }
