import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isJa = locale === 'ja';
  const title = isJa ? 'プロジェクト' : 'Projects';
  const description = isJa
    ? 'eコマース、不動産、AI ツールにわたる 10 のプロジェクト。React・Next.js・WordPress で構築。'
    : 'Ten projects across e-commerce, real estate, and AI tools — built with React, Next.js, and WordPress.';
  const url = `${SITE_URL}/${locale}/projects`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | Shashank S Bharadwaj`, description, url },
  };
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
