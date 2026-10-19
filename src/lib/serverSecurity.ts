import crypto from 'crypto';
import { supabaseAdmin } from './supabaseAdmin';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'saqib_jwt_vault_super_secret_2026_xyz!#';
const FALLBACK_USERNAME = process.env.ADMIN_USERNAME || 'saqib';
const FALLBACK_SALT =
  process.env.ADMIN_PBKDF2_SALT || 'b9ab35f668716cb292036849d0d0b7a705e456f4d58a65c80f5c3f6459fc4ba2';
const FALLBACK_HASH =
  process.env.ADMIN_PBKDF2_HASH ||
  'f195d908c20941fc855a591ebb1f51c35bfc901443149fe091cb7201c924dbf7c7e88e68c629b5dddc612e843e10a4d6dec320e0961c849699604be04c2074b7';
const FALLBACK_ITERATIONS = Number(process.env.ADMIN_PBKDF2_ITERATIONS || 100000);

// ==================== 1. PBKDF2 HASH + SALT VERIFICATION ====================
export function hashPasswordPbkdf2(password: string, saltHex: string, iterations = 100000): string {
  return crypto.pbkdf2Sync(password, saltHex, iterations, 64, 'sha512').toString('hex');
}

export function verifyPbkdf2Password(
  submittedPassword: string,
  saltHex: string,
  expectedHashHex: string,
  iterations = 100000
): boolean {
  try {
    const computedHashHex = hashPasswordPbkdf2(submittedPassword, saltHex, iterations);
    const bufComputed = Buffer.from(computedHashHex, 'hex');
    const bufExpected = Buffer.from(expectedHashHex, 'hex');

    if (bufComputed.length !== bufExpected.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufComputed, bufExpected);
  } catch {
    return false;
  }
}

// ==================== 2. HMAC-SHA256 STANDARD JWT (HS256) ====================
export function signAdminJwt(payload: { username: string; role: string } = { username: 'saqib', role: 'admin' }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowSec = Math.floor(Date.now() / 1000);

  const fullPayload = {
    ...payload,
    sub: payload.username,
    iss: 'saqib-visuals-vault',
    iat: nowSec,
    exp: nowSec + 7 * 24 * 60 * 60, // 7 Days validity
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const message = `${headerB64}.${payloadB64}`;

  const signature = crypto.createHmac('sha256', JWT_SECRET).update(message).digest('base64url');
  return `${message}.${signature}`;
}

export function verifyAdminJwt(token: string): { authorized: boolean; payload?: { username: string; role: string }; reason?: string } {
  try {
    if (!token || typeof token !== 'string') {
      return { authorized: false, reason: 'Missing JWT token' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { authorized: false, reason: 'Malformed JWT structure' };
    }

    const [headerB64, payloadB64, signature] = parts;
    const message = `${headerB64}.${payloadB64}`;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(message).digest('base64url');

    const bufSig = Buffer.from(signature);
    const bufExp = Buffer.from(expectedSignature);

    if (bufSig.length !== bufExp.length || !crypto.timingSafeEqual(bufSig, bufExp)) {
      return { authorized: false, reason: 'Invalid HMAC-SHA256 cryptographic signature' };
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const nowSec = Math.floor(Date.now() / 1000);

    if (!payload.exp || nowSec > payload.exp) {
      return { authorized: false, reason: 'JWT token has expired' };
    }

    if (payload.role !== 'admin') {
      return { authorized: false, reason: 'Insufficient privileges' };
    }

    return { authorized: true, payload };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'JWT verification error';
    return { authorized: false, reason: msg };
  }
}

// ==================== 3. REQUEST VALIDATOR FOR MUTATION APIS ====================
export function verifyAdminRequest(req: Request): { authorized: boolean; reason?: string } {
  // Check Authorization Bearer Header
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const result = verifyAdminJwt(token);
    if (result.authorized) return { authorized: true };
  }

  // Check HTTP-Only Cookie
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/saqib_admin_jwt=([^;]+)/);
  if (match && match[1]) {
    const result = verifyAdminJwt(match[1]);
    if (result.authorized) return { authorized: true };
  }

  return { authorized: false, reason: 'Unauthorized: Valid Admin HMAC-SHA256 JWT required' };
}

// ==================== 4. AUTHENTICATE ADMIN CREDENTIALS ====================
export async function authenticateAdmin(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const cleanUser = (usernameInput || '').trim().toLowerCase();
  const cleanPass = (passwordInput || '').trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, error: 'Username and password are required' };
  }

  // Try checking Supabase 'admin_vault' table first
  try {
    const { data: adminRecord, error: dbErr } = await supabaseAdmin
      .from('admin_vault')
      .select('*')
      .eq('username', cleanUser)
      .maybeSingle();

    if (!dbErr && adminRecord && adminRecord.salt && adminRecord.password_hash) {
      const isValid = verifyPbkdf2Password(
        cleanPass,
        adminRecord.salt,
        adminRecord.password_hash,
        adminRecord.iterations || 100000
      );

      if (isValid) {
        const token = signAdminJwt({ username: adminRecord.username, role: 'admin' });
        return { success: true, token };
      }
      return { success: false, error: 'Invalid admin credentials' };
    }
  } catch {
    // If Supabase table query fails, proceed to environment fallback check
  }

  // Fallback to environment credentials (username: saqib | password: saqibadmin)
  if (cleanUser === FALLBACK_USERNAME) {
    const isValid = verifyPbkdf2Password(
      cleanPass,
      FALLBACK_SALT,
      FALLBACK_HASH,
      FALLBACK_ITERATIONS
    );

    if (isValid) {
      const token = signAdminJwt({ username: FALLBACK_USERNAME, role: 'admin' });
      return { success: true, token };
    }
  }

  return { success: false, error: 'Invalid admin credentials' };
}
