import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const isJa = locale === 'ja';
  const title = isJa ? '研究' : 'Research';
  const description = isJa
    ? 'ハンドオペレーション支援システム — Ray-Ban Meta AR と e-テキスタイル圧力グローブによる AI 支援リハビリテーション研究。'
    : 'Hand Operation Support System — Ray-Ban Meta AR + an e-textile pressure glove for AI-assisted rehabilitation.';
  const url = `${SITE_URL}/${locale}/research`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | Shashank S Bharadwaj`, description, url },
  };
}

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
