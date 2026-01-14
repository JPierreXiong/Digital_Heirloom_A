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
  const t = await getTranslations('pages.deadMansSwitch');

  const canonicalUrl =
    locale !== envConfigs.locale
      ? `${envConfigs.app_url}/${locale}/dead-mans-switch`
      : `${envConfigs.app_url}/dead-mans-switch`;

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function DeadMansSwitchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Load page data - reuse landing page structure
  const t = await getTranslations('landing');

  // Build page params - focus on relevant sections
  const page: Landing = {
    hero: {
      ...t.raw('hero'),
      image: undefined,
      image_invert: undefined,
      show_avatars: false,
    },
    // Focus on how-it-works section which explains Dead Man's Switch
    'how-it-works': t.raw('how-it-works'),
    'zero-knowledge-security': t.raw('zero-knowledge-security'),
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
    'technical-architecture': undefined,
  };

  // Load page component
  const Page = await getThemePage('landing');

  return <Page locale={locale} page={page} />;
}
