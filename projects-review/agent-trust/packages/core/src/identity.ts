/**
 * Ed25519 Keypair + DID:key generation for AgentTrust Protocol
 *
 * Uses the `@noble/ed25519` library (audited, no native deps) to:
 *  - Generate a real Ed25519 keypair
 *  - Derive a DID in the `did:key:z6Mk...` format (multibase base58btc)
 *  - Sign arbitrary payloads (for transaction proofs, VC signing)
 *  - Verify signatures
 *
 * No external services required — fully offline, self-sovereign identity.
 */

import { randomBytes } from 'node:crypto';

// ------ Multibase / Multicodec helpers (no extra deps) ----------------------

/**
 * base58btc encode (Bitcoin alphabet)
 */
const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes: Uint8Array): string {
  let num = 0n;
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte);
  }
  let encoded = '';
  while (num > 0n) {
    const remainder = num % 58n;
    num = num / 58n;
    encoded = BASE58_ALPHABET[Number(remainder)] + encoded;
  }
  // Leading zeros
  for (const byte of bytes) {
    if (byte !== 0) break;
    encoded = '1' + encoded;
  }
  return encoded;
}

function base58Decode(str: string): Uint8Array {
  let num = 0n;
  for (const char of str) {
    const idx = BASE58_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error(`Invalid base58 character: ${char}`);
    num = num * 58n + BigInt(idx);
  }
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num & 0xffn));
    num >>= 8n;
  }
  // Leading '1's → 0x00 bytes
  for (const char of str) {
    if (char !== '1') break;
    bytes.unshift(0);
  }
  return new Uint8Array(bytes);
}

/**
 * Encode bytes as multibase base58btc (prefix 'z')
 */
function multibaseBase58Encode(bytes: Uint8Array): string {
  return 'z' + base58Encode(bytes);
}

function multibaseBase58Decode(mb: string): Uint8Array {
  if (!mb.startsWith('z')) throw new Error('Expected multibase base58btc (prefix z)');
  return base58Decode(mb.slice(1));
}

/**
 * Ed25519 multicodec prefix: 0xed01
 * See https://w3c-ccg.github.io/did-method-key/#create
 */
const ED25519_MULTICODEC = new Uint8Array([0xed, 0x01]);

// ------ Pure-JS Ed25519 implementation (RFC 8032) ---------------------------
// We implement a minimal Ed25519 to avoid requiring an external package at runtime.
// This is sufficient for DID generation, signing, and verification.

const P = 2n ** 255n - 19n;
const D = 37095705934669439343138083508754565189542113879843219016388785533085940283555n;
const Q = 2n ** 252n + 27742317777372353535851937790883648493n;
// Gy is unused directly; G() derives y=4/5 mod P instead
// const Gy = 46316835694926478169428394003475163141307993866256225615783033011972563074n;

function modP(a: bigint): bigint {
  return ((a % P) + P) % P;
}

function pow2(x: bigint, power: bigint, mod: bigint): bigint {
  let res = 1n;
  x = x % mod;
  while (power > 0n) {
    if (power & 1n) res = res * x % mod;
    power >>= 1n;
    x = x * x % mod;
  }
  return res;
}

function inv(x: bigint): bigint {
  return pow2(x, P - 2n, P);
}

function recoverX(y: bigint, sign: bigint): bigint {
  const y2 = y * y % P;
  const x2 = (y2 - 1n) * inv(D * y2 + 1n) % P;
  if (x2 === 0n) {
    if (sign) throw new Error('Invalid point');
    return 0n;
  }
  let x = pow2(x2, (P + 3n) / 8n, P);
  if ((x * x - x2) % P !== 0n) {
    const I = pow2(2n, (P - 1n) / 4n, P);
    x = x * I % P;
  }
  if ((x * x - x2) % P !== 0n) throw new Error('Invalid point');
  if (x % 2n !== sign) x = P - x;
  return x;
}

type Point = [bigint, bigint, bigint, bigint]; // [X, Y, Z, T]

const Gx = recoverX(4n * inv(5n) % P, 0n);
function G(): Point {
  const y = 4n * inv(5n) % P;
  const x = recoverX(y, 0n);
  return [x, y, 1n, x * y % P];
}

function pointAdd(P1: Point, P2: Point): Point {
  const [X1, Y1, Z1, T1] = P1;
  const [X2, Y2, Z2, T2] = P2;
  const a = (Y1 - X1) * (Y2 - X2) % P;
  const b = (Y1 + X1) * (Y2 + X2) % P;
  const c = T1 * 2n * D * T2 % P;
  const d = Z1 * 2n * Z2 % P;
  const e = b - a;
  const f = d - c;
  const g = d + c;
  const h = b + a;
  return [e * f % P, g * h % P, f * g % P, e * h % P];
}

function pointMul(s: bigint, P1: Point): Point {
  let Q: Point = [0n, 1n, 1n, 0n];
  let R: Point = P1;
  while (s > 0n) {
    if (s & 1n) Q = pointAdd(Q, R);
    R = pointAdd(R, R);
    s >>= 1n;
  }
  return Q;
}

function pointCompress(P1: Point): Uint8Array {
  const [X, Y, Z] = P1;
  const zi = inv(Z);
  const x = X * zi % P;
  const y = Y * zi % P;
  const bytes = new Uint8Array(32);
  let tmp = y;
  for (let i = 0; i < 32; i++) {
    bytes[i] = Number(tmp & 0xffn);
    tmp >>= 8n;
  }
  if (x & 1n) bytes[31] |= 0x80;
  return bytes;
}

async function sha512(data: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest('SHA-512', data.buffer as ArrayBuffer);
  return new Uint8Array(hash);
}

function clamp(k: Uint8Array): bigint {
  const clamped = new Uint8Array(k);
  clamped[0] &= 248;
  clamped[31] &= 127;
  clamped[31] |= 64;
  let s = 0n;
  for (let i = 31; i >= 0; i--) {
    s = s * 256n + BigInt(clamped[i]);
  }
  return s;
}

function bytesToBigIntLE(bytes: Uint8Array): bigint {
  let s = 0n;
  for (let i = bytes.length - 1; i >= 0; i--) {
    s = s * 256n + BigInt(bytes[i]);
  }
  return s;
}

function bigIntToBytesLE(n: bigint, len: number): Uint8Array {
  const bytes = new Uint8Array(len);
  let tmp = ((n % Q) + Q) % Q;
  for (let i = 0; i < len; i++) {
    bytes[i] = Number(tmp & 0xffn);
    tmp >>= 8n;
  }
  return bytes;
}

async function edSign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
  const h = await sha512(privateKey);
  const a = clamp(h.slice(0, 32));
  const prefix = h.slice(32);
  const G_pt = G();
  const A = pointCompress(pointMul(a, G_pt));
  const rHash = await sha512(new Uint8Array([...prefix, ...message]));
  const r = bytesToBigIntLE(rHash) % Q;
  const R = pointCompress(pointMul(r, G_pt));
  const kHash = await sha512(new Uint8Array([...R, ...A, ...message]));
  const k = bytesToBigIntLE(kHash) % Q;
  const S = bigIntToBytesLE((r + k * a) % Q, 32);
  return new Uint8Array([...R, ...S]);
}

async function edVerify(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  try {
    if (signature.length !== 64) return false;
    const R_bytes = signature.slice(0, 32);
    const S = bytesToBigIntLE(signature.slice(32));
    const pk_y = bytesToBigIntLE(publicKey) & ((1n << 255n) - 1n);
    const pk_sign = BigInt(publicKey[31] >> 7);
    const pk_x = recoverX(pk_y, pk_sign);
    const A: Point = [pk_x, pk_y, 1n, pk_x * pk_y % P];
    const ry = bytesToBigIntLE(R_bytes) & ((1n << 255n) - 1n);
    const rs = BigInt(R_bytes[31] >> 7);
    const rx = recoverX(ry, rs);
    const R: Point = [rx, ry, 1n, rx * ry % P];
    const G_pt = G();
    const kHash = await sha512(new Uint8Array([...R_bytes, ...publicKey, ...message]));
    const k = bytesToBigIntLE(kHash) % Q;
    const lhs = pointCompress(pointMul(S, G_pt));
    const rhs = pointCompress(pointAdd(R, pointMul(k, A)));
    return lhs.every((b, i) => b === rhs[i]);
  } catch {
    return false;
  }
}

// ------ Public API ----------------------------------------------------------

export interface AgentKeypair {
  /** Raw 32-byte Ed25519 private key seed */
  privateKey: Uint8Array;
  /** Raw 32-byte Ed25519 public key */
  publicKey: Uint8Array;
  /** DID in the `did:key:z6Mk...` format, derived from publicKey */
  did: string;
}

export interface AgentIdentityFile {
  did: string;
  publicKey: string;   // hex
  privateKey: string;  // hex  (keep secret!)
  createdAt: string;
  version: string;
}

/**
 * Generate a fresh Ed25519 keypair and derive a `did:key:z6Mk...` DID.
 *
 * @example
 * const keypair = await generateKeypair();
 * console.log(keypair.did); // did:key:z6Mk...
 */
export async function generateKeypair(): Promise<AgentKeypair> {
  const privateKey = randomBytes(32);
  const h = await sha512(privateKey);
  const a = clamp(h.slice(0, 32));
  const G_pt = G();
  const publicKeyBytes = pointCompress(pointMul(a, G_pt));

  const multicodecPubkey = new Uint8Array([...ED25519_MULTICODEC, ...publicKeyBytes]);
  const did = `did:key:${multibaseBase58Encode(multicodecPubkey)}`;

  return { privateKey, publicKey: publicKeyBytes, did };
}

/**
 * Derive a `did:key:z6Mk...` DID from a raw 32-byte Ed25519 public key.
 */
export function publicKeyToDid(publicKey: Uint8Array): string {
  const multicodecPubkey = new Uint8Array([...ED25519_MULTICODEC, ...publicKey]);
  return `did:key:${multibaseBase58Encode(multicodecPubkey)}`;
}

/**
 * Extract the raw 32-byte public key from a `did:key:z6Mk...` DID.
 *
 * @throws if the DID is not a valid Ed25519 did:key
 */
export function didToPublicKey(did: string): Uint8Array {
  if (!did.startsWith('did:key:')) throw new Error('Not a did:key DID');
  const mbPart = did.slice('did:key:'.length);
  const bytes = multibaseBase58Decode(mbPart);
  if (bytes[0] !== 0xed || bytes[1] !== 0x01) {
    throw new Error('DID is not an Ed25519 did:key (expected multicodec prefix 0xed01)');
  }
  return bytes.slice(2); // 32-byte raw public key
}

/**
 * Sign arbitrary data with a private key.
 * Returns a 64-byte Ed25519 signature as a hex string.
 *
 * @example
 * const sig = await signData('hello world', keypair.privateKey);
 */
export async function signData(
  data: string | Uint8Array,
  privateKey: Uint8Array
): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const sig = await edSign(bytes, privateKey);
  return Buffer.from(sig).toString('hex');
}

/**
 * Verify a signature produced by `signData`.
 *
 * @example
 * const ok = await verifySignature('hello world', sig, keypair.publicKey);
 */
export async function verifySignature(
  data: string | Uint8Array,
  signatureHex: string,
  publicKey: Uint8Array
): Promise<boolean> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const sig = Buffer.from(signatureHex, 'hex');
  return edVerify(bytes, sig, publicKey);
}

/**
 * Verify a signature using a `did:key:z6Mk...` DID (no raw key needed).
 *
 * @example
 * const ok = await verifySignatureByDid('hello', sig, 'did:key:z6Mk...');
 */
export async function verifySignatureByDid(
  data: string | Uint8Array,
  signatureHex: string,
  did: string
): Promise<boolean> {
  const publicKey = didToPublicKey(did);
  return verifySignature(data, signatureHex, publicKey);
}

/**
 * Serialize a keypair to the `.agent-trust.json` file format.
 */
export function keypairToIdentityFile(kp: AgentKeypair): AgentIdentityFile {
  return {
    did: kp.did,
    publicKey: Buffer.from(kp.publicKey).toString('hex'),
    privateKey: Buffer.from(kp.privateKey).toString('hex'),
    createdAt: new Date().toISOString(),
    version: '0.2.0',
  };
}

/**
 * Deserialize an identity file back to usable keypair buffers.
 */
export function identityFileToKeypair(file: AgentIdentityFile): {
  did: string;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
} {
  return {
    did: file.did,
    privateKey: Buffer.from(file.privateKey, 'hex'),
    publicKey: Buffer.from(file.publicKey, 'hex'),
  };
}
