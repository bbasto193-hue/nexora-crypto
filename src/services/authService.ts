export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username?: string;
  country?: string;
  nationality?: string;
  phone?: string;
  profilePictureDataUrl?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLogin: string;
  role: 'Personal Account' | 'Institutional Trader' | 'Demo Analyst';
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

export async function initAuthDatabase(): Promise<void> {
  // Accounts are created explicitly through registration; do not seed fake users.
}

export function getAllUsers(): AuthUser[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export interface AuthProfileChanges {
  name: string;
  email: string;
  username?: string;
  country?: string;
  nationality?: string;
  phone?: string;
  profilePictureDataUrl?: string | null;
}

export function updateUserProfile(userId: string, changes: AuthProfileChanges): AuthUser | null {
  const users = getAllUsers();
  const userIndex = users.findIndex((user) => user.id === userId);
  const cleanName = changes.name.trim();
  const cleanEmail = changes.email.trim().toLowerCase();

  if (
    userIndex === -1 ||
    !cleanName ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
    users.some((user) => user.id !== userId && user.email.toLowerCase() === cleanEmail)
  ) {
    return null;
  }

  const updatedUser: AuthUser = { ...users[userIndex], name: cleanName, email: cleanEmail };
  if (changes.username !== undefined) {
    const username = changes.username.trim();
    if (username) updatedUser.username = username;
    else delete updatedUser.username;
  }
  for (const field of ['country', 'nationality', 'phone'] as const) {
    if (changes[field] !== undefined) {
      const value = changes[field]!.trim();
      if (value) updatedUser[field] = value;
      else delete updatedUser[field];
    }
  }
  if (changes.profilePictureDataUrl !== undefined) {
    if (changes.profilePictureDataUrl) updatedUser.profilePictureDataUrl = changes.profilePictureDataUrl;
    else delete updatedUser.profilePictureDataUrl;
  }

  users[userIndex] = updatedUser;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    for (const storage of [sessionStorage, localStorage]) {
      const rawSession = storage.getItem(SESSION_STORAGE_KEY);
      if (!rawSession) continue;
      const session = JSON.parse(rawSession);
      if (session.userId === userId) {
        storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...session, name: cleanName, email: cleanEmail }));
      }
    }
  } catch {
    return null;
  }

  return updatedUser;
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

  if (users.length > 0) {
    return { success: false, error: 'This personal installation already has an account. Please sign in instead.' };
  }

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
    role: 'Personal Account'
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
