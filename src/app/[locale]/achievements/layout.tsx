import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isJa = locale === 'ja';
  const title = isJa ? '実績' : 'Achievements';
  const description = isJa
    ? 'ロータリー米山奨学生、ハッカソン、資格認定 — 受賞、認定、インパクト。'
    : 'Rotary Yoneyama Scholar, hackathons, and certifications — awards, recognitions, and impact.';
  const url = `${SITE_URL}/${locale}/achievements`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | Shashank S Bharadwaj`, description, url },
  };
}

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
