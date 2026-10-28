/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Isolated demo authentication configuration.
 * 
 * IMPORTANT:
 * - This configuration is strictly for local sandbox demonstration & testing.
 * - The specified Gmail account is a simulated demo identifier; the application
 *   does not claim this external account exists, has been contacted, or has been verified.
 * - Passwords are never stored in plaintext within the persistent database;
 *   they are salted and hashed using Web Crypto API SHA-256 before storage.
 */

export const DEMO_AUTH_CONFIG = {
  email: 'velqorin73@gmail.com',
  name: 'Demo Trader',
  role: 'Institutional Trader' as const,
  // Demo password requested for local demo authentication testing
  demoPassword: 'R7!mK2@vL9#p',
  // Deterministic seed salt for the demo user
  seedSalt: '9c4f82e1b7a5d306',
  // Explicit unverified status disclosure
  isExternalVerified: false,
  verificationNotice: 'Local Sandbox Demo Identifier (Unverified External Account)'
};
