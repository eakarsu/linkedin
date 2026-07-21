export function requireAuthSecret(): string {
  const value = process.env.NEXTAUTH_SECRET?.trim();
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === 'test') return 'test-only-auth-secret-at-least-32-characters';
  throw new Error('NEXTAUTH_SECRET must be configured with at least 32 characters');
}
