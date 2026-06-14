/**
 * Canonical site origin. Override at build/deploy time with
 * NEXT_PUBLIC_SITE_URL (e.g. your Vercel/production URL).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://shashank-portfolio.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'Shashank S Bharadwaj';
