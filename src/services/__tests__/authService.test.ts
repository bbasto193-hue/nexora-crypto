import { webcrypto } from 'node:crypto';

if (!globalThis.window) {
  (globalThis as any).window = {
    crypto: webcrypto
  };
}

const storage: Record<string, string> = {};
(constStorage => {
  (globalThis as any).localStorage = constStorage;
  (globalThis as any).sessionStorage = constStorage;
})({
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, val: string) => { storage[key] = val; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
});

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

async function runTests() {
  const { initAuthDatabase, registerUser, loginUser, getAllUsers, getCurrentSession, updateUserProfile } = await import('../authService');
  await initAuthDatabase();
  assert(getAllUsers().length === 0, 'Auth initialization must not create demo users.');

  const password = 'Test-Only-Pass-482!';
  const registration = await registerUser({ email: 'owner.test@example.invalid', password, name: 'Owner Test' });
  assert(registration.success && registration.user, 'Explicit account registration should succeed.');
  const registeredUser = registration.user!;
  assert(registeredUser.createdAt.length > 0, 'Creation timestamp should be recorded.');
  assert(!JSON.stringify(getAllUsers()).includes(password), 'Plaintext password must not be stored.');
  assert(getAllUsers().length === 1, 'Registration should create exactly one account record.');
  assert(!(await registerUser({ email: 'another.test@example.invalid', password, name: 'Another User' })).success, 'A second account must be rejected in single-user mode.');

  assert((await loginUser({ email: registeredUser.email, password, rememberMe: true })).success, 'Correct credentials should log in.');
  assert(!(await loginUser({ email: registeredUser.email, password: 'incorrect-password' })).success, 'Incorrect password must be rejected.');
  assert(!(await loginUser({ email: 'missing@example.invalid', password })).success, 'Unknown email must be rejected.');

  const updated = updateUserProfile(registeredUser.id, {
    name: 'Owner Updated',
    email: 'owner.updated@example.invalid',
    username: 'owner-handle',
    profilePictureDataUrl: 'data:image/png;base64,dGVzdA=='
  });
  assert(updated?.name === 'Owner Updated', 'Profile name should persist.');
  assert(updated?.username === 'owner-handle', 'Username should persist.');
  assert(updated?.profilePictureDataUrl === 'data:image/png;base64,dGVzdA==', 'Profile picture should persist.');
  assert(updated?.createdAt === registeredUser.createdAt, 'Profile edits must preserve account creation time.');
  assert(getCurrentSession()?.email === 'owner.updated@example.invalid', 'Active session identity should synchronize.');
  assert(updateUserProfile(registeredUser.id, { name: 'Owner Updated', email: 'invalid' }) === null, 'Invalid email must be rejected.');

  const removedPicture = updateUserProfile(registeredUser.id, {
    name: 'Owner Updated',
    email: 'owner.updated@example.invalid',
    profilePictureDataUrl: null
  });
  assert(removedPicture?.profilePictureDataUrl === undefined, 'Profile picture removal should persist.');
  console.log('PASS: no auto-seeded users; personal registration, login checks, profile persistence, session sync, original creation time, and photo removal verified.');
}

runTests().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
