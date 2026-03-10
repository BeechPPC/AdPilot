export const AUTH_CONFIG = {
  get jwtSecret() { return process.env.JWT_SECRET || ''; },
  get adminPasswordHash() { return process.env.ADMIN_PASSWORD_HASH || ''; },
  jwtExpiresIn: '24h' as const,
};

export function validateAuthConfig(): void {
  if (!AUTH_CONFIG.jwtSecret || AUTH_CONFIG.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long');
  }
}
