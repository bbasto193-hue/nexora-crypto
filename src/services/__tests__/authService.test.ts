/**
 * Direct Unit & Integration Test for Demo Authentication
 * Tests:
 * 1. Successful login with correct credentials (velqorin73@gmail.com / R7!mK2@vL9#p)
 * 2. Rejection of incorrect password
 * 3. Rejection of incorrect email
 * 4. Verification that plaintext password is NOT stored
 * 5. Clear error message assertion
 */

import { webcrypto } from 'node:crypto';
import { DEMO_AUTH_CONFIG } from '../demoAuthConfig';

// Set up mock browser environment for node
if (!globalThis.window) {
  (globalThis as any).window = {
    crypto: webcrypto
  };
}

// In-memory localStorage mock
const storage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => { storage[key] = val; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
};
(globalThis as any).sessionStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => { storage[key] = val; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
};

async function runTests() {
  console.log('--- STARTING DEMO AUTHENTICATION VERIFICATION TESTS ---');

  // Dynamic import of auth service
  const { initAuthDatabase, loginUser, getAllUsers } = await import('../authService');

  // 1. Initialize
  await initAuthDatabase();
  const users = getAllUsers();
  console.log(`[PASS] Auth database initialized with ${users.length} users.`);

  // 2. Check velqorin user exists
  const velqorinUser = users.find((u) => u.email === DEMO_AUTH_CONFIG.email);
  if (!velqorinUser) {
    throw new Error('FAILED: velqorin73@gmail.com was not seeded into auth database.');
  }
  console.log('[PASS] Demo user velqorin73@gmail.com found in database.');

  // 3. Verify NO plaintext password is stored
  if (JSON.stringify(users).includes('R7!mK2@vL9#p')) {
    throw new Error('CRITICAL SECURITY FAILURE: Plaintext password found in database storage!');
  }
  console.log('[PASS] Confirmed: Plaintext password is NEVER stored. Found salted SHA-256 hash:', velqorinUser.passwordHash);

  // 4. Test SUCCESSFUL login
  const successResult = await loginUser({
    email: 'velqorin73@gmail.com',
    password: 'R7!mK2@vL9#p',
    rememberMe: true
  });

  if (!successResult.success || !successResult.user) {
    throw new Error(`FAILED: Successful login attempt was rejected: ${successResult.error}`);
  }
  console.log('[PASS] Valid login attempt: SUCCESS. Authenticated as:', successResult.user.name, `(${successResult.user.role})`);

  // 5. Test UNSUCCESSFUL login - wrong password
  const wrongPassResult = await loginUser({
    email: 'velqorin73@gmail.com',
    password: 'WrongPassword999!',
    rememberMe: false
  });

  if (wrongPassResult.success) {
    throw new Error('SECURITY FAILURE: Login with incorrect password succeeded!');
  }
  if (!wrongPassResult.error) {
    throw new Error('FAILED: Error message missing on failed password attempt.');
  }
  console.log('[PASS] Invalid password rejection: SUCCESS. Error message:', wrongPassResult.error);

  // 6. Test UNSUCCESSFUL login - wrong email
  const wrongEmailResult = await loginUser({
    email: 'fake.intruder@unknown.com',
    password: 'R7!mK2@vL9#p',
    rememberMe: false
  });

  if (wrongEmailResult.success) {
    throw new Error('SECURITY FAILURE: Login with non-existent email succeeded!');
  }
  if (!wrongEmailResult.error) {
    throw new Error('FAILED: Error message missing on unknown email attempt.');
  }
  console.log('[PASS] Unknown email rejection: SUCCESS. Error message:', wrongEmailResult.error);

  console.log('--- ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
