"""
AgentTrust Identity — Ed25519 keypair + DID:key generation (pure Python).

No external cryptography libraries required for basic usage.
Uses hashlib + secrets from the standard library.
"""

from __future__ import annotations

import hashlib
import json
import os
import secrets
import struct
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

# ── Multibase / Multicodec constants ────────────────────────────────────────

ED25519_MULTICODEC_PREFIX = bytes([0xed, 0x01])
BASE58_ALPHABET = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def _base58_encode(data: bytes) -> str:
    """Bitcoin-alphabet base58 encoding."""
    n = int.from_bytes(data, "big")
    result = []
    while n > 0:
        n, r = divmod(n, 58)
        result.append(BASE58_ALPHABET[r:r+1])
    # Leading zero bytes
    result.extend(b"1" for b in data if b == 0)
    return b"".join(reversed(result)).decode()


def _base58_decode(s: str) -> bytes:
    n = 0
    for char in s.encode():
        n = n * 58 + BASE58_ALPHABET.index(char)
    result = []
    while n > 0:
        n, r = divmod(n, 256)
        result.append(r)
    # Leading '1's
    result.extend(0 for c in s if c == "1")
    return bytes(reversed(result))


# ── Ed25519 field arithmetic (Curve25519 / RFC 8032) ───────────────────────

P  = 2**255 - 19
D  = 37095705934669439343138083508754565189542113879843219016388785533085940283555
Q  = 2**252 + 27742317777372353535851937790883648493
I  = pow(2, (P - 1) // 4, P)


def _inv(x: int) -> int:
    return pow(x, P - 2, P)


def _recover_x(y: int, sign: int) -> int:
    y2 = y * y % P
    x2 = (y2 - 1) * _inv(D * y2 + 1) % P
    if x2 == 0:
        if sign:
            raise ValueError("Invalid point")
        return 0
    x = pow(x2, (P + 3) // 8, P)
    if (x * x - x2) % P != 0:
        x = x * I % P
    if (x * x - x2) % P != 0:
        raise ValueError("Invalid point")
    if x & 1 != sign:
        x = P - x
    return x


_G: Optional[tuple] = None


def _get_G() -> tuple:
    global _G
    if _G is None:
        y = 4 * _inv(5) % P
        x = _recover_x(y, 0)
        _G = (x, y, 1, x * y % P)
    return _G


def _point_add(P1: tuple, P2: tuple) -> tuple:
    X1, Y1, Z1, T1 = P1
    X2, Y2, Z2, T2 = P2
    a = (Y1 - X1) * (Y2 - X2) % P
    b = (Y1 + X1) * (Y2 + X2) % P
    c = T1 * 2 * D * T2 % P
    d = Z1 * 2 * Z2 % P
    e = b - a
    f = d - c
    g = d + c
    h = b + a
    return (e * f % P, g * h % P, f * g % P, e * h % P)


def _point_mul(s: int, point: tuple) -> tuple:
    result = (0, 1, 1, 0)
    current = point
    while s > 0:
        if s & 1:
            result = _point_add(result, current)
        current = _point_add(current, current)
        s >>= 1
    return result


def _compress(point: tuple) -> bytes:
    X, Y, Z = point[:3]
    zi = _inv(Z)
    x = X * zi % P
    y = Y * zi % P
    b = y.to_bytes(32, "little")
    if x & 1:
        b = b[:-1] + bytes([b[-1] | 0x80])
    return b


def _sha512(data: bytes) -> bytes:
    return hashlib.sha512(data).digest()


def _clamp(k: bytes) -> int:
    c = bytearray(k)
    c[0] &= 248
    c[31] &= 127
    c[31] |= 64
    return int.from_bytes(c, "little")


def _ed_sign(message: bytes, private_key: bytes) -> bytes:
    h = _sha512(private_key)
    a = _clamp(h[:32])
    prefix = h[32:]
    G = _get_G()
    A = _compress(_point_mul(a, G))
    r_hash = _sha512(prefix + message)
    r = int.from_bytes(r_hash, "little") % Q
    R = _compress(_point_mul(r, G))
    k_hash = _sha512(R + A + message)
    k = int.from_bytes(k_hash, "little") % Q
    S = ((r + k * a) % Q).to_bytes(32, "little")
    return R + S


def _ed_verify(message: bytes, signature: bytes, public_key: bytes) -> bool:
    if len(signature) != 64:
        return False
    try:
        R_bytes = signature[:32]
        S = int.from_bytes(signature[32:], "little")
        pk_y = int.from_bytes(public_key, "little") & ((1 << 255) - 1)
        pk_sign = public_key[31] >> 7
        pk_x = _recover_x(pk_y, pk_sign)
        A = (pk_x, pk_y, 1, pk_x * pk_y % P)
        ry = int.from_bytes(R_bytes, "little") & ((1 << 255) - 1)
        rs = R_bytes[31] >> 7
        rx = _recover_x(ry, rs)
        R_pt = (rx, ry, 1, rx * ry % P)
        G = _get_G()
        k_hash = _sha512(R_bytes + public_key + message)
        k = int.from_bytes(k_hash, "little") % Q
        lhs = _compress(_point_mul(S, G))
        rhs = _compress(_point_add(R_pt, _point_mul(k, A)))
        return lhs == rhs
    except Exception:
        return False


def _public_key_from_private(private_key: bytes) -> bytes:
    h = _sha512(private_key)
    a = _clamp(h[:32])
    G = _get_G()
    return _compress(_point_mul(a, G))


# ── Public API ──────────────────────────────────────────────────────────────

@dataclass
class AgentKeypair:
    """An Ed25519 keypair with a derived DID:key identity."""
    private_key: bytes   # 32 bytes
    public_key: bytes    # 32 bytes
    did: str             # did:key:z6Mk...


def generate_keypair() -> AgentKeypair:
    """
    Generate a fresh Ed25519 keypair and derive a did:key:z6Mk... DID.

    Example:
        kp = generate_keypair()
        print(kp.did)  # did:key:z6Mk...
    """
    private_key = secrets.token_bytes(32)
    public_key = _public_key_from_private(private_key)
    multicodec = ED25519_MULTICODEC_PREFIX + public_key
    did = f"did:key:z{_base58_encode(multicodec)}"
    return AgentKeypair(private_key=private_key, public_key=public_key, did=did)


def public_key_to_did(public_key: bytes) -> str:
    """Derive a did:key:z6Mk... DID from a 32-byte Ed25519 public key."""
    multicodec = ED25519_MULTICODEC_PREFIX + public_key
    return f"did:key:z{_base58_encode(multicodec)}"


def did_to_public_key(did: str) -> bytes:
    """Extract the raw 32-byte Ed25519 public key from a did:key:z6Mk... DID."""
    if not did.startswith("did:key:"):
        raise ValueError("Not a did:key DID")
    mb = did[len("did:key:"):]
    if not mb.startswith("z"):
        raise ValueError("Expected multibase base58btc (prefix 'z')")
    decoded = _base58_decode(mb[1:])
    if decoded[:2] != ED25519_MULTICODEC_PREFIX:
        raise ValueError("DID is not an Ed25519 did:key (expected multicodec prefix 0xed01)")
    return decoded[2:]  # 32-byte raw public key


def sign_data(data: str | bytes, private_key: bytes) -> str:
    """
    Sign data with a private key. Returns a 128-char hex string (64-byte signature).

    Example:
        sig = sign_data("hello world", kp.private_key)
    """
    if isinstance(data, str):
        data = data.encode()
    return _ed_sign(data, private_key).hex()


def verify_signature(data: str | bytes, signature_hex: str, public_key: bytes) -> bool:
    """Verify a signature produced by sign_data."""
    if isinstance(data, str):
        data = data.encode()
    return _ed_verify(data, bytes.fromhex(signature_hex), public_key)


def verify_signature_by_did(data: str | bytes, signature_hex: str, did: str) -> bool:
    """Verify a signature using a did:key:z6Mk... DID (no raw key needed)."""
    return verify_signature(data, signature_hex, did_to_public_key(did))


@dataclass
class IdentityFile:
    """Serialized keypair saved to .agent-trust.json"""
    did: str
    public_key: str   # hex
    private_key: str  # hex  ← keep secret!
    created_at: str
    version: str = "0.2.0"

    def to_dict(self) -> dict:
        return {
            "did": self.did,
            "publicKey": self.public_key,
            "privateKey": self.private_key,
            "createdAt": self.created_at,
            "version": self.version,
        }

    @classmethod
    def from_dict(cls, d: dict) -> "IdentityFile":
        return cls(
            did=d["did"],
            public_key=d["publicKey"],
            private_key=d["privateKey"],
            created_at=d["createdAt"],
            version=d.get("version", "0.2.0"),
        )

    def to_keypair(self) -> AgentKeypair:
        return AgentKeypair(
            private_key=bytes.fromhex(self.private_key),
            public_key=bytes.fromhex(self.public_key),
            did=self.did,
        )


def load_or_create_identity(path: str = ".agent-trust.json") -> AgentKeypair:
    """
    Load identity from .agent-trust.json, or generate a new one if it doesn't exist.

    This is the recommended way to initialize an agent's identity in production.
    """
    from datetime import datetime, timezone
    p = Path(path)
    if p.exists():
        with open(p) as f:
            return IdentityFile.from_dict(json.load(f)).to_keypair()

    kp = generate_keypair()
    identity_file = IdentityFile(
        did=kp.did,
        public_key=kp.public_key.hex(),
        private_key=kp.private_key.hex(),
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    with open(p, "w") as f:
        json.dump(identity_file.to_dict(), f, indent=2)
    return kp
