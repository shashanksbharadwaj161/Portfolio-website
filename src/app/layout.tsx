// Passthrough root layout. The <html>/<body> tags are provided by
// [locale]/layout.tsx for localized routes and by not-found.tsx for the
// global 404 — this root only exists so those pages have a root boundary.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
