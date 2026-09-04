import crypto from 'crypto';

export function isCollegiateEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.toLowerCase().split('@')[1];
  const academicSuffixes = ['.edu', '.ac.in', '.ac.uk', '.edu.au', '.edu.cn', '.ac.jp', '.edu.sg'];
  return academicSuffixes.some((suffix) => domain.endsWith(suffix));
}

export function generateSecureQrToken(ticketId: string, userId: string): string {
  const rand = typeof crypto !== 'undefined' && crypto.randomBytes ? crypto.randomBytes(8).toString('hex') : Math.random().toString(36).substring(2);
  const payload = ticketId + ':' + userId + ':' + Date.now() + ':' + rand;
  if (typeof crypto !== 'undefined' && crypto.createHash) {
    return 'cc_sec_' + crypto.createHash('sha256').update(payload).digest('hex');
  }
  return 'cc_sec_' + Math.abs(hashString(payload)).toString(16);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function generateTotpSecret(length: number = 20): string {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const randBytes = typeof crypto !== 'undefined' && crypto.randomBytes ? crypto.randomBytes(length) : null;
  for (let i = 0; i < length; i++) {
    const val = randBytes ? randBytes[i] : Math.floor(Math.random() * 256);
    secret += base32chars[val % base32chars.length];
  }
  return secret;
}

// Universal RFC 3174 SHA-1 implementation (0-dependency, browser and node compatible)
function sha1(bytes: Uint8Array): Uint8Array {
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const len = bytes.length;
  const bitLen = len * 8;

  const withPadding = new Uint8Array(((len + 8 >> 6) + 1) * 64);
  withPadding.set(bytes);
  withPadding[len] = 0x80;

  const view = new DataView(withPadding.buffer);
  view.setUint32(withPadding.length - 4, bitLen, false);

  const w = new Uint32Array(80);

  for (let i = 0; i < withPadding.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 80; j++) {
      const val = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
      w[j] = (val << 1) | (val >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let j = 0; j < 80; j++) {
      let f = 0;
      let k = 0;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) >>> 0;
      e = d;
      d = c;
      c = ((b << 30) | (b >>> 2)) >>> 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const result = new Uint8Array(20);
  const resView = new DataView(result.buffer);
  resView.setUint32(0, h0, false);
  resView.setUint32(4, h1, false);
  resView.setUint32(8, h2, false);
  resView.setUint32(12, h3, false);
  resView.setUint32(16, h4, false);
  return result;
}

function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let k = key;
  if (k.length > blockSize) {
    k = sha1(k);
  }
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(k);

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = paddedKey[i] ^ 0x5c;
    iKeyPad[i] = paddedKey[i] ^ 0x36;
  }

  const inner = new Uint8Array(iKeyPad.length + message.length);
  inner.set(iKeyPad);
  inner.set(message, iKeyPad.length);
  const innerHash = sha1(inner);

  const outer = new Uint8Array(oKeyPad.length + innerHash.length);
  outer.set(oKeyPad);
  outer.set(innerHash, oKeyPad.length);
  return sha1(outer);
}

function base32ToUint8Array(base32: string): Uint8Array {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const clean = (base32 || '').toUpperCase().replace(/=+$/, '');
  for (let i = 0; i < clean.length; i++) {
    const val = base32chars.indexOf(clean.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return new Uint8Array(bytes);
}

export function generateDynamicTotpToken(
  secret: string,
  timeSec: number = Math.floor(Date.now() / 1000),
  step: number = 30,
  digits: number = 6
): { token: string; remainingSeconds: number } {
  if (!secret) return { token: '000000', remainingSeconds: 30 };
  const epoch = Math.floor(timeSec / step);
  const timeBytes = new Uint8Array(8);
  let tmp = epoch;
  for (let i = 7; i >= 0; i--) {
    timeBytes[i] = tmp & 0xff;
    tmp = tmp >> 8;
  }

  const keyBytes = base32ToUint8Array(secret);
  const hmac = hmacSha1(keyBytes, timeBytes);

  const offset = hmac[hmac.length - 1] & 0x0f;
  const otp =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const token = (otp % Math.pow(10, digits)).toString().padStart(digits, '0');
  const remainingSeconds = step - (timeSec % step);

  return { token, remainingSeconds };
}

export function verifyDynamicTotpToken(token: string, secret: string, window: number = 1, step: number = 30): boolean {
  if (!token || !secret) return false;
  const currentEpoch = Math.floor(Date.now() / 1000);
  for (let i = -window; i <= window; i++) {
    const candidate = generateDynamicTotpToken(secret, currentEpoch + i * step, step).token;
    if (candidate === token.trim()) return true;
  }
  return false;
}

export function generateTicketNumber(): string {
  const rand = typeof crypto !== 'undefined' && crypto.randomBytes ? crypto.randomBytes(3).toString('hex').toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
  return 'CC-TKT-' + Date.now().toString().slice(-6) + '-' + rand;
}

export function generateTransactionNumber(): string {
  const rand = typeof crypto !== 'undefined' && crypto.randomBytes ? crypto.randomBytes(3).toString('hex').toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
  return 'ESCROW-TX-' + Date.now().toString() + '-' + rand;
}
