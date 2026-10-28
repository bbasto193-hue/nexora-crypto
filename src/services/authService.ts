export interface AuthUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLogin: string;
  role: 'Institutional Trader' | 'Demo Analyst';
}

export interface PasswordResetRequest {
  email: string;
  token: string;
  expiresAt: number;
}

const USERS_STORAGE_KEY = 'nexora_auth_users_v1';
const SESSION_STORAGE_KEY = 'nexora_auth_session_v1';
const RESET_TOKENS_KEY = 'nexora_auth_resets_v1';

// Web Crypto API salted SHA-256 password hashing (Zero plaintext password storage)
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:nexora_crypto_secret_pepper`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

import { DEMO_AUTH_CONFIG } from './demoAuthConfig';

// Default Seed Demo Account
const SEED_SALT = 'e48a1c90f23b7e61';
let seedUserInitialized = false;

export async function initAuthDatabase(): Promise<void> {
  if (seedUserInitialized) return;
  seedUserInitialized = true;

  try {
    const users = getAllUsers();

    // Securely hash requested demo password with unique cryptographic salt
    const velqorinHash = await hashPassword(
      DEMO_AUTH_CONFIG.demoPassword,
      DEMO_AUTH_CONFIG.seedSalt
    );
    const existingVelqorin = users.find((u) => u.email === DEMO_AUTH_CONFIG.email);

    if (!existingVelqorin) {
      users.push({
        id: 'usr_demo_velqorin73',
        email: DEMO_AUTH_CONFIG.email,
        name: DEMO_AUTH_CONFIG.name,
        passwordHash: velqorinHash,
        salt: DEMO_AUTH_CONFIG.seedSalt,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: DEMO_AUTH_CONFIG.role
      });
    } else {
      // Ensure hash and salt match the configured demo credentials
      existingVelqorin.passwordHash = velqorinHash;
      existingVelqorin.salt = DEMO_AUTH_CONFIG.seedSalt;
    }

    // Secondary demo trader
    if (!users.some((u) => u.email === 'demo@nexora.io')) {
      const demoHash = await hashPassword('NexoraPass2026!', SEED_SALT);
      users.push({
        id: 'usr_demo_institutional_1',
        email: 'demo@nexora.io',
        name: 'Institutional Demo Trader',
        passwordHash: demoHash,
        salt: SEED_SALT,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: 'Institutional Trader'
      });
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to init auth database:', err);
  }
}

export function getAllUsers(): AuthUser[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function registerUser({
  email,
  password,
  name
}: {
  email: string;
  password: string;
  name: string;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  await initAuthDatabase();

  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  if (users.some((u) => u.email === cleanEmail)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const newUser: AuthUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    name: name.trim() || cleanEmail.split('@')[0],
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    role: 'Institutional Trader'
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, user: newUser };
}

export async function loginUser({
  email,
  password,
  rememberMe
}: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  await initAuthDatabase();

  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();
  const targetUser = users.find((u) => u.email === cleanEmail);

  if (!targetUser) {
    return { success: false, error: 'Invalid email address or password.' };
  }

  const computedHash = await hashPassword(password, targetUser.salt);
  if (computedHash !== targetUser.passwordHash) {
    return { success: false, error: 'Invalid email address or password.' };
  }

  // Update lastLogin
  targetUser.lastLogin = new Date().toISOString();
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Store Session
  const sessionData = {
    userId: targetUser.id,
    email: targetUser.email,
    name: targetUser.name,
    role: targetUser.role,
    loggedInAt: new Date().toISOString()
  };

  if (rememberMe) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  return { success: true, user: targetUser };
}

export function getCurrentSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const users = getAllUsers();
    return users.find((u) => u.id === session.userId) || null;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

// Password Reset Simulation Flow
export async function createPasswordResetRequest(email: string): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  await initAuthDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();
  const user = users.find((u) => u.email === cleanEmail);

  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  // Generate 6-digit verification code token
  const token = `NX-${Math.floor(100000 + Math.random() * 900000)}`;
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  try {
    const existing = localStorage.getItem(RESET_TOKENS_KEY);
    const resets: PasswordResetRequest[] = existing ? JSON.parse(existing) : [];
    const filtered = resets.filter((r) => r.email !== cleanEmail);
    filtered.push({ email: cleanEmail, token, expiresAt });
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore
  }

  return { success: true, token };
}

export async function resetPasswordWithToken({
  email,
  token,
  newPassword
}: {
  email: string;
  token: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim().toUpperCase();

  try {
    const raw = localStorage.getItem(RESET_TOKENS_KEY);
    if (!raw) return { success: false, error: 'Invalid or expired recovery code.' };
    const resets: PasswordResetRequest[] = JSON.parse(raw);
    const match = resets.find((r) => r.email === cleanEmail && r.token === cleanToken);

    if (!match) {
      return { success: false, error: 'The recovery code entered is incorrect.' };
    }

    if (Date.now() > match.expiresAt) {
      return { success: false, error: 'This recovery code has expired. Please request a new one.' };
    }

    // Update user password
    const users = getAllUsers();
    const userIndex = users.findIndex((u) => u.email === cleanEmail);
    if (userIndex === -1) {
      return { success: false, error: 'Account not found.' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);
    users[userIndex].salt = salt;
    users[userIndex].passwordHash = passwordHash;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Clear reset token
    const remaining = resets.filter((r) => r.email !== cleanEmail);
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(remaining));

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to reset password.' };
  }
}
