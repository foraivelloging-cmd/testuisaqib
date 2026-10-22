import crypto from 'crypto';
import { supabaseAdmin } from './supabaseAdmin';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || '';
const FALLBACK_USERNAME = (process.env.ADMIN_USERNAME || 'saqib').toLowerCase();
const FALLBACK_SALT =
  process.env.ADMIN_PBKDF2_SALT || 'b9ab35f668716cb292036849d0d0b7a705e456f4d58a65c80f5c3f6459fc4ba2';
const FALLBACK_HASH =
  process.env.ADMIN_PBKDF2_HASH ||
  'f195d908c20941fc855a591ebb1f51c35bfc901443149fe091cb7201c924dbf7c7e88e68c629b5dddc612e843e10a4d6dec320e0961c849699604be04c2074b7';
const FALLBACK_ITERATIONS = Number(process.env.ADMIN_PBKDF2_ITERATIONS || 100000);

// ==================== RBAC TYPES & PERMISSIONS ====================
export type AdminRole = 'superadmin' | 'subadmin' | 'admin';

export interface AdminPermissions {
  manage_services: boolean;
  manage_tools: boolean;
  manage_orders: boolean;
  manage_users: boolean;
  view_telemetry: boolean;
  manage_site_config: boolean;
  manage_admins?: boolean;
}

export type AdminPermissionKey = keyof AdminPermissions;

export const DEFAULT_SUBADMIN_PERMISSIONS: AdminPermissions = {
  manage_services: true,
  manage_tools: true,
  manage_orders: true,
  manage_users: false,
  view_telemetry: false,
  manage_site_config: false,
  manage_admins: false,
};

export const SUPERADMIN_PERMISSIONS: AdminPermissions = {
  manage_services: true,
  manage_tools: true,
  manage_orders: true,
  manage_users: true,
  view_telemetry: true,
  manage_site_config: true,
  manage_admins: true,
};

export interface AdminJwtPayload {
  username: string;
  role: AdminRole;
  permissions: AdminPermissions;
  token_version: number;
  sub?: string;
  iss?: string;
  iat?: number;
  exp?: number;
}

export interface VerifyAdminResult {
  authorized: boolean;
  revoked?: boolean;
  reason?: string;
  payload?: AdminJwtPayload;
}

// In-memory revoked usernames set for zero-latency local revocation
const revokedUsersCache = new Set<string>();

export function markUserRevokedLocally(username: string) {
  revokedUsersCache.add(username.toLowerCase());
}

export function clearUserRevokedLocally(username: string) {
  revokedUsersCache.delete(username.toLowerCase());
}

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
export function signAdminJwt(payload: {
  username: string;
  role?: AdminRole;
  permissions?: AdminPermissions;
  token_version?: number;
}): string {
  if (!JWT_SECRET) {
    throw new Error('ADMIN_JWT_SECRET must be configured in the server environment.');
  }
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowSec = Math.floor(Date.now() / 1000);
  const cleanUser = payload.username.toLowerCase();
  const isSaqib = cleanUser === FALLBACK_USERNAME;

  const role: AdminRole = isSaqib
    ? 'superadmin'
    : payload.role || 'subadmin';

  const permissions: AdminPermissions = isSaqib || role === 'superadmin'
    ? SUPERADMIN_PERMISSIONS
    : payload.permissions || DEFAULT_SUBADMIN_PERMISSIONS;

  const token_version = payload.token_version ?? 1;

  const fullPayload: AdminJwtPayload = {
    username: cleanUser,
    role,
    permissions,
    token_version,
    sub: cleanUser,
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

export function verifyAdminJwt(token: string): {
  authorized: boolean;
  payload?: AdminJwtPayload;
  reason?: string;
} {
  try {
    if (!JWT_SECRET) {
      return { authorized: false, reason: 'Admin JWT secret is not configured' };
    }
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawPayload: any = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const nowSec = Math.floor(Date.now() / 1000);

    if (!rawPayload.exp || nowSec > rawPayload.exp) {
      return { authorized: false, reason: 'JWT token has expired' };
    }

    const cleanUser = (rawPayload.username || rawPayload.sub || '').toLowerCase();
    if (revokedUsersCache.has(cleanUser)) {
      return { authorized: false, reason: 'Admin session revoked' };
    }

    const isSaqib = cleanUser === FALLBACK_USERNAME;
    const role: AdminRole = isSaqib ? 'superadmin' : rawPayload.role || 'subadmin';
    const permissions: AdminPermissions = isSaqib || role === 'superadmin'
      ? SUPERADMIN_PERMISSIONS
      : rawPayload.permissions || DEFAULT_SUBADMIN_PERMISSIONS;

    const payload: AdminJwtPayload = {
      username: cleanUser,
      role,
      permissions,
      token_version: rawPayload.token_version ?? 1,
      sub: cleanUser,
      iss: rawPayload.iss,
      iat: rawPayload.iat,
      exp: rawPayload.exp,
    };

    return { authorized: true, payload };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'JWT verification error';
    return { authorized: false, reason: msg };
  }
}

// ==================== 3. REQUEST VALIDATOR (SYNC WITH RBAC) ====================
export function verifyAdminRequest(
  req: Request,
  requiredPermission?: AdminPermissionKey
): VerifyAdminResult {
  let token = '';

  // 1. Check Authorization Bearer Header
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else {
    // 2. Check HTTP-Only Cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/saqib_admin_jwt=([^;]+)/);
    if (match && match[1]) {
      token = match[1];
    }
  }

  if (!token) {
    return { authorized: false, reason: 'Unauthorized: Valid Admin HMAC-SHA256 JWT required' };
  }

  const result = verifyAdminJwt(token);
  if (!result.authorized || !result.payload) {
    return { authorized: false, reason: result.reason || 'Invalid JWT token' };
  }

  const payload = result.payload;

  // Primary Superadmin has unrestricted permission to everything
  if (payload.role === 'superadmin' || payload.username.toLowerCase() === FALLBACK_USERNAME) {
    return { authorized: true, payload };
  }

  // Check Granular RBAC Permission for Sub-Admins
  if (requiredPermission) {
    if (requiredPermission === 'manage_admins') {
      return {
        authorized: false,
        reason: 'Forbidden: Admin Team & RBAC management is strictly restricted to Superadmin.',
      };
    }

    const hasPerm = Boolean(payload.permissions && payload.permissions[requiredPermission]);
    if (!hasPerm) {
      return {
        authorized: false,
        reason: `Forbidden: Sub-admin lacks required permission "${requiredPermission}".`,
      };
    }
  }

  return { authorized: true, payload };
}

// ==================== 3.1 REAL-TIME ASYNC DB VALIDATOR FOR INSTANT REVOCATION ====================
export async function verifyAdminRequestAsync(
  req: Request,
  requiredPermission?: AdminPermissionKey,
  requireSuperadmin = false
): Promise<VerifyAdminResult> {
  const syncResult = verifyAdminRequest(req, requiredPermission);
  if (!syncResult.authorized || !syncResult.payload) {
    return syncResult;
  }

  const { username, token_version } = syncResult.payload;

  // Primary fallback Superadmin bypasses DB query if table doesn't have it
  if (username === FALLBACK_USERNAME && !requireSuperadmin) {
    return syncResult;
  }

  try {
    const { data: dbAdmin, error } = await supabaseAdmin
      .from('admin_vault')
      .select('id, username, role, is_active, token_version, permissions')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      // If column or schema issue, allow syncResult unless requireSuperadmin
      if (requireSuperadmin && syncResult.payload.role !== 'superadmin' && username !== FALLBACK_USERNAME) {
        return { authorized: false, reason: 'Access restricted to Superadmin only.' };
      }
      return syncResult;
    }

    if (!dbAdmin) {
      // User was deleted by Superadmin!
      markUserRevokedLocally(username);
      return {
        authorized: false,
        revoked: true,
        reason: 'Admin account has been deleted by Superadmin. Session terminated.',
      };
    }

    if (dbAdmin.is_active === false) {
      // User was deactivated/suspended!
      markUserRevokedLocally(username);
      return {
        authorized: false,
        revoked: true,
        reason: 'Admin account has been deactivated by Superadmin. Session terminated.',
      };
    }

    // Check token version (if bumped, all previous sessions are dead)
    if (dbAdmin.token_version !== undefined && dbAdmin.token_version !== null) {
      if (Number(dbAdmin.token_version) > Number(token_version)) {
        return {
          authorized: false,
          revoked: true,
          reason: 'Admin session has expired or was revoked. Please log in again.',
        };
      }
    }

    if (requireSuperadmin && dbAdmin.role !== 'superadmin' && username !== FALLBACK_USERNAME) {
      return {
        authorized: false,
        reason: 'Access Denied: Only Superadmin can perform this action.',
      };
    }

    // Update payload with fresh DB permissions & role
    const freshPayload: AdminJwtPayload = {
      ...syncResult.payload,
      role: (dbAdmin.role as AdminRole) || syncResult.payload.role,
      permissions: (dbAdmin.permissions as AdminPermissions) || syncResult.payload.permissions,
      token_version: dbAdmin.token_version ?? token_version,
    };

    return { authorized: true, payload: freshPayload };
  } catch {
    // If Supabase query fails, return standard sync verification
    return syncResult;
  }
}

// ==================== 4. AUTHENTICATE ADMIN CREDENTIALS ====================
export async function authenticateAdmin(
  usernameInput: string,
  passwordInput: string
): Promise<{
  success: boolean;
  token?: string;
  role?: AdminRole;
  permissions?: AdminPermissions;
  username?: string;
  error?: string;
}> {
  const cleanUser = (usernameInput || '').trim().toLowerCase();
  const cleanPass = (passwordInput || '').trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, error: 'Username and password are required' };
  }

  // Clear any local revocation cache if logging in fresh
  clearUserRevokedLocally(cleanUser);

  // Try checking Supabase 'admin_vault' table first
  try {
    const { data: adminRecord, error: dbErr } = await supabaseAdmin
      .from('admin_vault')
      .select('*')
      .eq('username', cleanUser)
      .maybeSingle();

    if (!dbErr && adminRecord && adminRecord.salt && adminRecord.password_hash) {
      if (adminRecord.is_active === false) {
        return { success: false, error: 'This admin account has been deactivated by Superadmin.' };
      }

      const isValid = verifyPbkdf2Password(
        cleanPass,
        adminRecord.salt,
        adminRecord.password_hash,
        adminRecord.iterations || 100000
      );

      if (isValid) {
        const isSaqib = cleanUser === FALLBACK_USERNAME;
        const role: AdminRole = isSaqib
          ? 'superadmin'
          : (adminRecord.role as AdminRole) || 'subadmin';

        const permissions: AdminPermissions = isSaqib || role === 'superadmin'
          ? SUPERADMIN_PERMISSIONS
          : (adminRecord.permissions as AdminPermissions) || DEFAULT_SUBADMIN_PERMISSIONS;

        const token_version = adminRecord.token_version || 1;

        const token = signAdminJwt({
          username: adminRecord.username,
          role,
          permissions,
          token_version,
        });

        return {
          success: true,
          token,
          role,
          permissions,
          username: adminRecord.username,
        };
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
      const token = signAdminJwt({
        username: FALLBACK_USERNAME,
        role: 'superadmin',
        permissions: SUPERADMIN_PERMISSIONS,
        token_version: 1,
      });

      return {
        success: true,
        token,
        role: 'superadmin',
        permissions: SUPERADMIN_PERMISSIONS,
        username: FALLBACK_USERNAME,
      };
    }
  }

  return { success: false, error: 'Invalid admin credentials' };
}

// ==================== 5. SUB-ADMIN CRUD OPERATIONS (SUPERADMIN ONLY) ====================

export interface AdminVaultRecord {
  id: string;
  username: string;
  role: AdminRole;
  permissions: AdminPermissions;
  token_version: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export async function listAllAdmins(): Promise<{ success: boolean; admins: AdminVaultRecord[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_vault')
      .select('id, username, role, permissions, token_version, is_active, created_by, created_at, updated_at')
      .order('created_at', { ascending: true });

    if (error) {
      // Fallback if table doesn't have new columns yet
      const fallback = await supabaseAdmin
        .from('admin_vault')
        .select('id, username, created_at, updated_at')
        .order('created_at', { ascending: true });

      if (fallback.error) {
        // Return default superadmin if DB unreachable
        return {
          success: true,
          admins: [
            {
              id: 'primary-saqib-superadmin',
              username: FALLBACK_USERNAME,
              role: 'superadmin',
              permissions: SUPERADMIN_PERMISSIONS,
              token_version: 1,
              is_active: true,
              created_by: 'system',
              created_at: new Date().toISOString(),
            },
          ],
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = (fallback.data || []).map((a: any) => ({
        id: a.id,
        username: a.username,
        role: a.username.toLowerCase() === FALLBACK_USERNAME ? ('superadmin' as AdminRole) : ('subadmin' as AdminRole),
        permissions: a.username.toLowerCase() === FALLBACK_USERNAME ? SUPERADMIN_PERMISSIONS : DEFAULT_SUBADMIN_PERMISSIONS,
        token_version: 1,
        is_active: true,
        created_by: 'system',
        created_at: a.created_at,
        updated_at: a.updated_at,
      }));

      return { success: true, admins: mapped };
    }

    let records: AdminVaultRecord[] = (data || []).map((r) => ({
      id: r.id,
      username: r.username,
      role: (r.role as AdminRole) || (r.username.toLowerCase() === FALLBACK_USERNAME ? 'superadmin' : 'subadmin'),
      permissions: (r.permissions as AdminPermissions) || (r.username.toLowerCase() === FALLBACK_USERNAME ? SUPERADMIN_PERMISSIONS : DEFAULT_SUBADMIN_PERMISSIONS),
      token_version: r.token_version ?? 1,
      is_active: r.is_active ?? true,
      created_by: r.created_by || 'superadmin',
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    // Ensure saqib is always listed
    if (!records.some((a) => a.username.toLowerCase() === FALLBACK_USERNAME)) {
      records.unshift({
        id: 'primary-saqib-superadmin',
        username: FALLBACK_USERNAME,
        role: 'superadmin',
        permissions: SUPERADMIN_PERMISSIONS,
        token_version: 1,
        is_active: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
      });
    }

    return { success: true, admins: records };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to query admin records';
    return { success: false, admins: [], error: msg };
  }
}

export async function createSubAdmin(
  usernameInput: string,
  passwordInput: string,
  permissionsInput: Partial<AdminPermissions>,
  createdBy = 'saqib'
): Promise<{ success: boolean; admin?: AdminVaultRecord; error?: string }> {
  const cleanUser = (usernameInput || '').trim().toLowerCase();
  const cleanPass = (passwordInput || '').trim();

  if (!cleanUser || cleanUser.length < 3) {
    return { success: false, error: 'Sub-admin username must be at least 3 characters long.' };
  }
  if (!cleanPass || cleanPass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }
  if (cleanUser === FALLBACK_USERNAME) {
    return { success: false, error: `The username "${FALLBACK_USERNAME}" is reserved for Primary Superadmin.` };
  }

  // Check if username already exists
  const { data: existing } = await supabaseAdmin
    .from('admin_vault')
    .select('id')
    .eq('username', cleanUser)
    .maybeSingle();

  if (existing) {
    return { success: false, error: `An admin account with username "${cleanUser}" already exists.` };
  }

  const salt = crypto.randomBytes(32).toString('hex');
  const password_hash = hashPasswordPbkdf2(cleanPass, salt, 100000);

  const permissions: AdminPermissions = {
    manage_services: Boolean(permissionsInput.manage_services ?? true),
    manage_tools: Boolean(permissionsInput.manage_tools ?? true),
    manage_orders: Boolean(permissionsInput.manage_orders ?? true),
    manage_users: Boolean(permissionsInput.manage_users ?? false),
    view_telemetry: Boolean(permissionsInput.view_telemetry ?? false),
    manage_site_config: Boolean(permissionsInput.manage_site_config ?? false),
    manage_admins: false, // Strictly false for sub-admins!
  };

  const newRecord = {
    username: cleanUser,
    password_hash,
    salt,
    iterations: 100000,
    algorithm: 'sha512',
    role: 'subadmin',
    permissions,
    token_version: 1,
    is_active: true,
    created_by: createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('admin_vault')
    .insert(newRecord)
    .select('id, username, role, permissions, token_version, is_active, created_by, created_at, updated_at')
    .single();

  if (error) {
    // Resilient fallback if table has not had ADMIN_ROLES_PERMISSIONS.sql applied yet
    if (error.message.includes('column') || error.message.includes('schema cache')) {
      const fallbackRecord = {
        username: cleanUser,
        password_hash,
        salt,
        iterations: 100000,
        algorithm: 'sha512',
        updated_at: new Date().toISOString(),
      };

      const { data: fbData, error: fbErr } = await supabaseAdmin
        .from('admin_vault')
        .insert(fallbackRecord)
        .select('id, username, created_at, updated_at')
        .single();

      if (fbErr) {
        return {
          success: false,
          error: `Database error: ${fbErr.message}. Please run ADMIN_ROLES_PERMISSIONS.sql in Supabase SQL Editor!`,
        };
      }

      clearUserRevokedLocally(cleanUser);

      return {
        success: true,
        admin: {
          id: fbData.id,
          username: fbData.username,
          role: 'subadmin',
          permissions,
          token_version: 1,
          is_active: true,
          created_by: createdBy,
          created_at: fbData.created_at,
          updated_at: fbData.updated_at,
        },
      };
    }

    return { success: false, error: `Failed to create sub-admin: ${error.message}` };
  }

  clearUserRevokedLocally(cleanUser);

  return {
    success: true,
    admin: {
      id: data.id,
      username: data.username,
      role: data.role as AdminRole,
      permissions: data.permissions as AdminPermissions,
      token_version: data.token_version,
      is_active: data.is_active,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
    },
  };
}

export async function updateSubAdmin(
  usernameInput: string,
  updates: {
    permissions?: Partial<AdminPermissions>;
    newPassword?: string;
    is_active?: boolean;
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanUser = (usernameInput || '').trim().toLowerCase();

  if (!cleanUser) {
    return { success: false, error: 'Username is required' };
  }

  if (cleanUser === FALLBACK_USERNAME && updates.is_active === false) {
    return { success: false, error: 'Primary Superadmin account cannot be deactivated.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patchPayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof updates.is_active === 'boolean') {
    patchPayload.is_active = updates.is_active;
    if (!updates.is_active) {
      markUserRevokedLocally(cleanUser);
    } else {
      clearUserRevokedLocally(cleanUser);
    }
  }

  if (updates.permissions) {
    patchPayload.permissions = {
      manage_services: Boolean(updates.permissions.manage_services),
      manage_tools: Boolean(updates.permissions.manage_tools),
      manage_orders: Boolean(updates.permissions.manage_orders),
      manage_users: Boolean(updates.permissions.manage_users),
      view_telemetry: Boolean(updates.permissions.view_telemetry),
      manage_site_config: Boolean(updates.permissions.manage_site_config),
      manage_admins: false, // Never grant manage_admins to sub-admins
    };
  }

  if (updates.newPassword && updates.newPassword.trim().length >= 6) {
    const salt = crypto.randomBytes(32).toString('hex');
    const password_hash = hashPasswordPbkdf2(updates.newPassword.trim(), salt, 100000);
    patchPayload.password_hash = password_hash;
    patchPayload.salt = salt;
    patchPayload.iterations = 100000;
  }

  // Increment token version to instantly revoke any old sessions if permissions or password change
  const { data: current } = await supabaseAdmin
    .from('admin_vault')
    .select('token_version')
    .eq('username', cleanUser)
    .maybeSingle();

  const nextVersion = (current?.token_version || 1) + 1;
  patchPayload.token_version = nextVersion;

  const { error } = await supabaseAdmin
    .from('admin_vault')
    .update(patchPayload)
    .eq('username', cleanUser);

  if (error) {
    return { success: false, error: `Failed to update sub-admin: ${error.message}` };
  }

  return { success: true, message: `Admin "${cleanUser}" updated successfully.` };
}

export async function deleteSubAdmin(
  usernameInput: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanUser = (usernameInput || '').trim().toLowerCase();

  if (!cleanUser) {
    return { success: false, error: 'Username is required' };
  }

  if (cleanUser === FALLBACK_USERNAME) {
    return { success: false, error: 'Primary Superadmin cannot be deleted.' };
  }

  // 1. Immediately mark user revoked in local memory cache for 0ms latency cutoff
  markUserRevokedLocally(cleanUser);

  // 2. Delete from database
  const { error } = await supabaseAdmin
    .from('admin_vault')
    .delete()
    .eq('username', cleanUser);

  if (error) {
    return { success: false, error: `Database delete failed: ${error.message}` };
  }

  return {
    success: true,
    message: `Sub-admin "${cleanUser}" has been deleted and their active sessions instantly revoked.`,
  };
}

// ==================== 6. UPDATE CREDENTIALS (SUPERADMIN / SELF) ====================
export async function updateAdminCredentials(
  currentPasswordInput: string,
  newUsernameInput: string,
  newPasswordInput: string,
  adminUsernameHint?: string
): Promise<{ success: boolean; message?: string; error?: string; token?: string; username?: string }> {
  const cleanCurrentPass = (currentPasswordInput || '').trim();
  const cleanNewUser = (newUsernameInput || '').trim().toLowerCase();
  const cleanNewPass = (newPasswordInput || '').trim();

  if (!cleanCurrentPass) {
    return { success: false, error: 'Current password is required to authorize changes.' };
  }
  if (!cleanNewUser || cleanNewUser.length < 3) {
    return { success: false, error: 'New username must be at least 3 characters long.' };
  }
  if (!cleanNewPass || cleanNewPass.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  let currentMatchedUser: string | null = null;
  let currentRecord: any = null;

  try {
    if (adminUsernameHint) {
      const { data: rec } = await supabaseAdmin
        .from('admin_vault')
        .select('*')
        .eq('username', adminUsernameHint.toLowerCase())
        .maybeSingle();
      if (rec && verifyPbkdf2Password(cleanCurrentPass, rec.salt, rec.password_hash, rec.iterations || 100000)) {
        currentMatchedUser = rec.username;
        currentRecord = rec;
      }
    }

    if (!currentMatchedUser) {
      const { data: allAdmins } = await supabaseAdmin
        .from('admin_vault')
        .select('*');
      if (allAdmins && allAdmins.length > 0) {
        for (const admin of allAdmins) {
          if (verifyPbkdf2Password(cleanCurrentPass, admin.salt, admin.password_hash, admin.iterations || 100000)) {
            currentMatchedUser = admin.username;
            currentRecord = admin;
            break;
          }
        }
      }
    }
  } catch {
    // Database query failed
  }

  if (!currentMatchedUser) {
    if (verifyPbkdf2Password(cleanCurrentPass, FALLBACK_SALT, FALLBACK_HASH, FALLBACK_ITERATIONS)) {
      currentMatchedUser = FALLBACK_USERNAME;
    }
  }

  if (!currentMatchedUser) {
    return { success: false, error: 'Current password is incorrect. Authorization denied.' };
  }

  const newSalt = crypto.randomBytes(32).toString('hex');
  const newHash = hashPasswordPbkdf2(cleanNewPass, newSalt, 100000);
  const nextVersion = ((currentRecord?.token_version) || 1) + 1;

  try {
    if (currentMatchedUser && currentMatchedUser !== cleanNewUser) {
      await supabaseAdmin
        .from('admin_vault')
        .delete()
        .eq('username', currentMatchedUser);
      markUserRevokedLocally(currentMatchedUser);
    }

    const { error: upsertErr } = await supabaseAdmin
      .from('admin_vault')
      .upsert({
        username: cleanNewUser,
        password_hash: newHash,
        salt: newSalt,
        iterations: 100000,
        algorithm: 'sha512',
        role: currentRecord?.role || (cleanNewUser === FALLBACK_USERNAME ? 'superadmin' : 'subadmin'),
        permissions: currentRecord?.permissions || (cleanNewUser === FALLBACK_USERNAME ? SUPERADMIN_PERMISSIONS : DEFAULT_SUBADMIN_PERMISSIONS),
        token_version: nextVersion,
        is_active: true,
        updated_at: new Date().toISOString(),
      });

    if (upsertErr) {
      return { success: false, error: `Database update failed: ${upsertErr.message}` };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown database error';
    return { success: false, error: `Failed to save to admin vault: ${msg}` };
  }

  const newToken = signAdminJwt({
    username: cleanNewUser,
    role: currentRecord?.role || (cleanNewUser === FALLBACK_USERNAME ? 'superadmin' : 'subadmin'),
    permissions: currentRecord?.permissions || (cleanNewUser === FALLBACK_USERNAME ? SUPERADMIN_PERMISSIONS : DEFAULT_SUBADMIN_PERMISSIONS),
    token_version: nextVersion,
  });

  return {
    success: true,
    message: `Admin credentials updated successfully! New username: "${cleanNewUser}"`,
    token: newToken,
    username: cleanNewUser,
  };
}
