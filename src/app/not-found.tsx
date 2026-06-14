import Link from 'next/link';
import './globals.css';

// Global 404 boundary. It renders outside the [locale] layout, so it provides
// its own <html>/<body> and stays language-neutral (links home → /en).
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main className="not-found-page">
          <div className="not-found-content">
            <h1 className="not-found-title text-gradient-cyan">404</h1>
            <p className="not-found-subtitle">Page not found</p>
            <p className="not-found-description">
              The page you&#39;re looking for doesn&#39;t exist or has been moved.
            </p>
            <div className="not-found-actions">
              <Link href="/" className="not-found-button not-found-button-primary">
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
