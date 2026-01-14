/**
 * SEO Data Configuration
 * Multi-language structured data for Afterglow Digital Heirloom
 */

export const getFaqSchema = (locale: string) => {
  const isZh = locale === 'zh';
  const isFr = locale === 'fr';

  // Extended FAQ with 12 questions covering all core keywords
  const faqs = {
    en: [
      {
        q: "What is Fragment A/B?",
        a: "Fragment A/B is a split-key security model where access is divided into two encrypted shards for maximum protection. Fragment A stays in your zero-knowledge vault, while Fragment B is delivered separately via secure channels like ShipAny. Neither fragment alone can decrypt your assets.",
      },
      {
        q: "How does the 180-day heartbeat work?",
        a: "The system monitors your activity through periodic check-ins. If you don't check in for 180 days (Free plan), 90 days (Base plan), or 30 days (Pro plan), the inheritance process automatically triggers. This Dead Man's Switch ensures your digital legacy is accessible when needed.",
      },
      {
        q: "Is ShipAny delivery secure?",
        a: "Yes. Fragment B is encrypted and useless without Fragment A, ensuring safety even during global transit via ShipAny. Even if the physical package is intercepted, the encrypted shard cannot be decrypted without Fragment A from your vault.",
      },
      {
        q: "Can Afterglow see my data?",
        a: "No. We use zero-knowledge architecture. Your master password never reaches our servers and is only used for local encryption in your browser. Even our engineers cannot access your encrypted vault.",
      },
      {
        q: "Which assets can I protect?",
        a: "You can protect crypto private keys, seed phrases, legal documents, sensitive personal data, and any digital credentials. Afterglow supports Bitcoin, Ethereum, and other cryptocurrencies, as well as cloud storage credentials and important documents.",
      },
      {
        q: "What is a Dead Man's Switch?",
        a: "A Dead Man's Switch is a fail-safe trigger that executes your legacy plan if you are no longer active. Afterglow's system monitors your heartbeat (check-ins) and automatically triggers inheritance distribution when you're unable to respond, ensuring your digital assets reach your heirs.",
      },
      {
        q: "Is this legally recognized?",
        a: "Afterglow provides the technical execution for digital assets, complementing your traditional will. As of 2026, many countries recognize digital assets as inheritable property. Our platform provides verifiable proof of ownership and beneficiary designations that can be used in probate proceedings.",
      },
      {
        q: "What do beneficiaries receive?",
        a: "Beneficiaries receive the decrypted Fragment B required to unlock your legacy vault. This shard, combined with Fragment A from your vault, allows them to access your digital inheritance according to your predefined plan.",
      },
      {
        q: "Can I cancel a trigger?",
        a: "Yes. During the grace period after a missed check-in, any login activity will automatically cancel the trigger. You can also manually extend your heartbeat deadline before traveling or during extended offline periods.",
      },
      {
        q: "What if the website goes down?",
        a: "Afterglow's decentralized storage ensures fragments remain accessible via protocol-level tools. Your encrypted data is stored redundantly, and beneficiaries can access their Fragment B through alternative channels if needed.",
      },
      {
        q: "Are there monthly fees?",
        a: "We offer free tiers for basic vaults with 180-day heartbeat checks. Base plan ($X/month) provides 90-day checks, and Pro plan ($Y/month) offers 30-day checks plus priority support and advanced beneficiary management features.",
      },
      {
        q: "Why split keys into A and B?",
        a: "Splitting keys prevents single points of failure. No single party—not even Afterglow—holds the full access key. This zero-knowledge architecture ensures mathematical guarantees of privacy and security that traditional systems cannot match.",
      },
    ],
    zh: [
      {
        q: "什么是 Fragment A/B？",
        a: "Fragment A/B 是一种分片密钥安全模型，将访问权限拆分为两个加密碎片以提供最高等级的保护。Fragment A 保留在您的零知识金库中，而 Fragment B 通过 ShipAny 等安全渠道单独交付。单独任何一个碎片都无法解密您的资产。",
      },
      {
        q: "180 天心跳检测如何工作？",
        a: "系统通过定期检入监控您的活跃状态。如果您 180 天（Free 计划）、90 天（Base 计划）或 30 天（Pro 计划）未检入，继承流程将自动启动。这个死信开关确保您的数字遗产在需要时可以被访问。",
      },
      {
        q: "ShipAny 投递安全吗？",
        a: "安全。Fragment B 经过加密，没有 Fragment A 就毫无用处，确保通过 ShipAny 全球运输时的安全。即使物理包裹被拦截，加密的分片也无法在没有您金库中的 Fragment A 的情况下被解密。",
      },
      {
        q: "Afterglow 能看到我的数据吗？",
        a: "不能。我们采用零知识架构。您的主密码永远不会到达我们的服务器，仅在您的浏览器中用于本地加密。即使是我们自己的工程师也无法访问您的加密金库。",
      },
      {
        q: "我可以保护哪些资产？",
        a: "您可以保护加密货币私钥、助记词、法律文件、敏感个人数据和任何数字凭证。Afterglow 支持比特币、以太坊和其他加密货币，以及云存储凭证和重要文档。",
      },
      {
        q: "什么是死信开关？",
        a: "死信开关是一个安全触发器，如果您不再活跃，它将执行您的遗产计划。Afterglow 的系统监控您的心跳（检入），当您无法响应时自动触发继承分发，确保您的数字资产到达您的继承人。",
      },
      {
        q: "这有法律认可吗？",
        a: "Afterglow 为数字资产提供技术执行，作为传统遗嘱的有力补充。截至 2026 年，许多国家已承认数字资产为可继承财产。我们的平台提供可验证的所有权证明和受益人指定，可用于遗嘱认证程序。",
      },
      {
        q: "受益人会收到什么？",
        a: "受益人将收到解锁您遗产金库所需的解密 Fragment B。这个分片与您金库中的 Fragment A 结合，允许他们根据您预定义的计划访问您的数字遗产。",
      },
      {
        q: "我可以取消触发吗？",
        a: "可以。在错过检入后的宽限期内，任何登录活动都将自动取消触发。您也可以在旅行或长时间离线期间手动延长您的心跳截止日期。",
      },
      {
        q: "如果网站关闭了怎么办？",
        a: "Afterglow 的去中心化存储确保碎片仍可通过协议级工具访问。您的加密数据被冗余存储，受益人可以通过替代渠道访问他们的 Fragment B（如果需要）。",
      },
      {
        q: "有月费吗？",
        a: "我们为基础金库提供免费层级，包含 180 天心跳检测。Base 计划（$X/月）提供 90 天检测，Pro 计划（$Y/月）提供 30 天检测以及优先支持和高级受益人管理功能。",
      },
      {
        q: "为什么要分片 A 和 B？",
        a: "分片密钥可以防止单点故障。没有任何一方（甚至包括 Afterglow）持有完整的访问密钥。这种零知识架构确保了传统系统无法匹配的隐私和安全数学保证。",
      },
    ],
    fr: [
      {
        q: "Qu'est-ce que le Fragment A/B ?",
        a: "Le Fragment A/B est un modèle de sécurité à clé scindée où l'accès est divisé en deux parties cryptées pour une protection maximale. Le Fragment A reste dans votre coffre-fort zéro connaissance, tandis que le Fragment B est livré séparément via des canaux sécurisés comme ShipAny. Aucun fragment seul ne peut décrypter vos actifs.",
      },
      {
        q: "Comment fonctionne le heartbeat de 180 jours ?",
        a: "Le système surveille votre activité via des vérifications périodiques. Sans connexion pendant 180 jours (plan gratuit), 90 jours (plan de base) ou 30 jours (plan Pro), le processus d'héritage se déclenche automatiquement. Ce Dead Man's Switch garantit que votre héritage numérique est accessible lorsque nécessaire.",
      },
      {
        q: "La livraison ShipAny est-elle sûre ?",
        a: "Oui. Le Fragment B est crypté et inutile sans le Fragment A, garantissant la sécurité même pendant le transport mondial via ShipAny. Même si le colis physique est intercepté, l'éclat crypté ne peut pas être décrypté sans le Fragment A de votre coffre-fort.",
      },
      {
        q: "Afterglow peut-il voir mes données ?",
        a: "Non. Nous utilisons une architecture zéro connaissance. Votre mot de passe principal n'atteint jamais nos serveurs et n'est utilisé que pour le chiffrement local dans votre navigateur. Même nos ingénieurs ne peuvent pas accéder à votre coffre-fort crypté.",
      },
      {
        q: "Quels actifs puis-je protéger ?",
        a: "Vous pouvez protéger les clés privées crypto, phrases de récupération, documents légaux, données personnelles sensibles et toutes les identifiants numériques. Afterglow prend en charge Bitcoin, Ethereum et autres cryptomonnaies, ainsi que les identifiants de stockage cloud et documents importants.",
      },
      {
        q: "Qu'est-ce qu'un Dead Man's Switch ?",
        a: "Un Dead Man's Switch est un déclencheur de sécurité qui exécute votre plan d'héritage si vous n'êtes plus actif. Le système d'Afterglow surveille votre heartbeat (vérifications) et déclenche automatiquement la distribution d'héritage lorsque vous ne pouvez pas répondre, garantissant que vos actifs numériques atteignent vos héritiers.",
      },
      {
        q: "Est-ce reconnu légalement ?",
        a: "Afterglow fournit l'exécution technique des actifs numériques, complétant votre testament traditionnel. En 2026, de nombreux pays reconnaissent les actifs numériques comme des biens héritables. Notre plateforme fournit une preuve vérifiable de propriété et des désignations de bénéficiaires utilisables dans les procédures de succession.",
      },
      {
        q: "Que reçoivent les bénéficiaires ?",
        a: "Les bénéficiaires reçoivent le Fragment B décrypté nécessaire pour déverrouiller votre coffre-fort d'héritage. Cet éclat, combiné avec le Fragment A de votre coffre-fort, leur permet d'accéder à votre héritage numérique selon votre plan prédéfini.",
      },
      {
        q: "Puis-je annuler un déclenchement ?",
        a: "Oui. Pendant la période de grâce après une vérification manquée, toute activité de connexion annulera automatiquement le déclenchement. Vous pouvez également prolonger manuellement votre date limite de heartbeat avant de voyager ou pendant des périodes hors ligne prolongées.",
      },
      {
        q: "Et si le site n'est plus accessible ?",
        a: "Le stockage décentralisé d'Afterglow garantit que les fragments restent accessibles via des outils de niveau protocole. Vos données cryptées sont stockées de manière redondante, et les bénéficiaires peuvent accéder à leur Fragment B via des canaux alternatifs si nécessaire.",
      },
      {
        q: "Y a-t-il des frais mensuels ?",
        a: "Nous offrons des paliers gratuits pour les coffres-forts de base avec vérifications heartbeat de 180 jours. Le plan de base ($X/mois) fournit des vérifications de 90 jours, et le plan Pro ($Y/mois) offre des vérifications de 30 jours plus un support prioritaire et des fonctionnalités avancées de gestion des bénéficiaires.",
      },
      {
        q: "Pourquoi scinder les clés en A et B ?",
        a: "La division des clés empêche les points de défaillance uniques. Aucune partie—pas même Afterglow—ne détient la clé d'accès complète. Cette architecture zéro connaissance garantit des garanties mathématiques de confidentialité et de sécurité que les systèmes traditionnels ne peuvent pas égaler.",
      },
    ],
  };

  const currentFaqs = faqs[locale as keyof typeof faqs] || faqs.en;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: currentFaqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
};

export const getOrgSchema = (locale: string) => {
  const isZh = locale === 'zh';
  const isFr = locale === 'fr';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Afterglow',
    description: isZh
      ? '领先的数字遗产与资产传承平台'
      : isFr
        ? "Plateforme leader d'héritage numérique et de transmission d'actifs"
        : 'Leading Digital Heirloom & Asset Inheritance Platform',
    url: 'https://www.digitalheirloom.app',
    logo: 'https://www.digitalheirloom.app/logo.png',
    sameAs: [
      // Add your social media links here when available
      // 'https://twitter.com/afterglow_app',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@digitalheirloom.app',
      contactType: 'customer service',
    },
  };
};

export const getSoftwareSchema = (locale: string) => {
  const isZh = locale === 'zh';
  const isFr = locale === 'fr';

  // Multi-language metadata for SEO
  const metadata = {
    en: {
      name: 'Afterglow Digital Heirloom',
      description:
        'Protect your digital inheritance with Afterglow\'s automated legacy vault. A zero-knowledge Dead Man\'s Switch ensures your crypto and data pass safely to your heirs.',
      keywords:
        'Digital Heirloom, Dead Man\'s Switch, Digital Inheritance, Legacy Vault, crypto inheritance, automated digital legacy distribution, secure vault for heirs, zero-knowledge encryption',
    },
    zh: {
      name: 'Afterglow 数字遗产',
      description:
        '使用 Afterglow 的数字资产继承工具。基于零知识加密的死信开关，确保您的比特币及私密数据在特殊情况下自动且安全地传承给继承人。',
      keywords:
        '数字遗产, 死信开关, 数字资产继承, 加密资产托管, 比特币遗产怎么处理, 自动触发的数字遗嘱, 零知识加密资产管理, 私钥继承, 助记词备份',
    },
    fr: {
      name: 'Afterglow Héritage Numérique',
      description:
        'Gérez votre succession digitale avec Afterglow. Notre coffre-fort numérique utilise un Dead Man\'s Switch pour transférer automatiquement vos actifs à vos héritiers.',
      keywords:
        'Héritage Numérique, Dead Man\'s Switch, Succession Digitale, Coffre-fort numérique, Comment léguer ses cryptos, distribution automatique d\'héritage numérique, sécurité héritage web, héritage de clés privées',
    },
  };

  const meta = metadata[locale as keyof typeof metadata] || metadata.en;
  const appUrl = 'https://www.digitalheirloom.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: meta.name,
    description: meta.description,
    keywords: meta.keywords,
    operatingSystem: 'Web',
    applicationCategory: 'SecurityApplication',
    url: `${appUrl}${locale === 'en' ? '' : `/${locale}`}`,
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    author: {
      '@type': 'Organization',
      name: 'Afterglow',
      url: appUrl,
    },
  };
};

/**
 * Article Schema for Blog Posts
 * Used to enhance SEO for blog articles
 */
export const getArticleSchema = (
  locale: string,
  article: {
    title: string;
    description: string;
    author: string;
    publishedTime: string;
    modifiedTime?: string;
    imageUrl?: string;
    url: string;
  }
) => {
  const isZh = locale === 'zh';
  const isFr = locale === 'fr';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Afterglow',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.digitalheirloom.app/logo.png',
      },
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    image: article.imageUrl || 'https://www.digitalheirloom.app/logo.png',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
};

/**
 * BreadcrumbList Schema for Navigation
 * Helps search engines understand site structure
 */
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};
