import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="section flex flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-mono text-sm text-[var(--cyan)]">404</p>
      <h1 className="text-display text-4xl font-bold text-[var(--text-primary)]">Page not found</h1>
      <p className="max-w-md text-[var(--text-secondary)]">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="glass-cyan glow-cyan rounded-2xl px-7 py-3 text-sm text-[var(--cyan)]"
      >
        Back home
      </Link>
    </main>
  );
}
