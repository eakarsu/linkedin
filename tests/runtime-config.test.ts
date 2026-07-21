import assert from 'node:assert/strict';
import test from 'node:test';
import { requireAuthSecret } from '../lib/runtime-config.ts';

test('authentication secret is fail-closed outside test mode', () => {
  const env = process.env as Record<string, string | undefined>;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSecret = process.env.NEXTAUTH_SECRET;
  try {
    env.NODE_ENV = 'production';
    delete env.NEXTAUTH_SECRET;
    assert.throws(() => requireAuthSecret(), /NEXTAUTH_SECRET/);
    env.NEXTAUTH_SECRET = 'short';
    assert.throws(() => requireAuthSecret(), /32 characters/);
    env.NEXTAUTH_SECRET = 'a-secure-secret-value-with-more-than-32-characters';
    assert.equal(requireAuthSecret(), process.env.NEXTAUTH_SECRET);
  } finally {
    if (originalNodeEnv === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = originalNodeEnv;
    if (originalSecret === undefined) delete env.NEXTAUTH_SECRET;
    else env.NEXTAUTH_SECRET = originalSecret;
  }
});
