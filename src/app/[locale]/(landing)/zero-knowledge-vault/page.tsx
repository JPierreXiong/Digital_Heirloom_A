import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import { Landing } from '@/shared/types/blocks/landing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('pages.zeroKnowledge');

  const canonicalUrl =
    locale !== envConfigs.locale
      ? `${envConfigs.app_url}/${locale}/zero-knowledge-vault`
      : `${envConfigs.app_url}/zero-knowledge-vault`;

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ZeroKnowledgeVaultPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Load page data - reuse landing page structure
  const t = await getTranslations('landing');

  // Build page params - focus on zero-knowledge security section
  const page: Landing = {
    hero: {
      ...t.raw('hero'),
      image: undefined,
      image_invert: undefined,
      show_avatars: false,
    },
    // Focus on zero-knowledge security section
    'zero-knowledge-security': t.raw('zero-knowledge-security'),
    'technical-architecture': t.raw('technical-architecture'),
    faq: t.raw('faq'),
    cta: t.raw('cta'),
    // Hide other sections
    logos: undefined,
    introduce: undefined,
    benefits: undefined,
    usage: undefined,
    features: undefined,
    stats: undefined,
    testimonials: undefined,
    'how-it-works': undefined,
  };

  // Load page component
  const Page = await getThemePage('landing');

  return <Page locale={locale} page={page} />;
}
