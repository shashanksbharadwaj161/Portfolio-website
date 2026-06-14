import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ja'],
  defaultLocale: 'en',
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Next.js internals (_next)
  // - static files (anything containing a dot, e.g. favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
