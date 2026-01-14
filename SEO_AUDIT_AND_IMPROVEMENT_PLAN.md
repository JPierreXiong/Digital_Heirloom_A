# Digital Heirloom - SEO 审计报告与改进计划

**审计日期**: 2026-01-13  
**项目**: Digital Heirloom (Afterglow)  
**架构**: Next.js 16 + App Router + Server Components

---

## 📊 SEO 现状检查

### ✅ 已完成项目

#### 1. 技术性 SEO (Technical SEO)

| 项目 | 状态 | 说明 |
|------|------|------|
| **Sitemap.xml** | ✅ 完成 | `src/app/sitemap.ts` 动态生成，支持多语言 |
| **Robots.txt** | ✅ 完成 | `public/robots.txt` 已配置，正确屏蔽私有路径 |
| **Meta 标签系统** | ✅ 完成 | `src/shared/lib/seo.ts` 提供统一的 `getMetadata()` 函数 |
| **多语言支持** | ✅ 完成 | hreflang 标签已实现（en, zh, fr） |
| **Open Graph** | ✅ 完成 | 所有页面支持 OG 标签 |
| **Twitter Cards** | ✅ 完成 | Twitter 卡片元数据已配置 |
| **Canonical URLs** | ✅ 完成 | 每个页面都有规范的 canonical URL |
| **SSR/SSG** | ✅ 完成 | Next.js App Router 默认 SSR |

#### 2. 结构化数据 (Structured Data)

| Schema 类型 | 状态 | 位置 |
|-------------|------|------|
| **FAQPage** | ✅ 完成 | `src/config/seo-data.ts` + `src/themes/default/pages/landing.tsx` |
| **Organization** | ✅ 完成 | `src/config/seo-data.ts` |
| **SoftwareApplication** | ✅ 完成 | `src/config/seo-data.ts` + Landing 页面 |
| **JSON-LD 组件** | ✅ 完成 | `src/shared/components/seo/json-ld.tsx` |

#### 3. 内容优化

| 项目 | 状态 | 说明 |
|------|------|------|
| **博客系统** | ✅ 完成 | 支持多语言博客文章 |
| **元数据翻译** | ✅ 完成 | 使用 `next-intl` 进行多语言元数据 |
| **页面标题优化** | ✅ 完成 | 每个页面都有独特的标题 |

---

## ⚠️ 需要改进的项目

### 🔴 高优先级（立即修复）

#### 1. Sitemap 缺少最新博客文章

**问题**: `src/app/sitemap.ts` 中只包含 `how-decryption-works`，缺少：
- `what-is-xxx` (Afterglow Story)
- `digital-inheritance-guide-2026`

**影响**: 搜索引擎无法发现新博客文章，影响 SEO 流量

**解决方案**:
```typescript
// 更新 src/app/sitemap.ts
const blogPosts = [
  'how-decryption-works',
  'what-is-xxx',  // Afterglow Story
  'digital-inheritance-guide-2026',
];
```

#### 2. 博客文章缺少 Article 结构化数据

**问题**: 博客详情页 (`src/app/[locale]/(landing)/blog/[slug]/page.tsx`) 没有 Article schema

**影响**: 无法在搜索结果中显示富摘要（发布日期、作者、图片等）

**解决方案**: 添加 Article JSON-LD 到博客详情页

#### 3. 缺少 BreadcrumbList 结构化数据

**问题**: 没有面包屑导航的结构化数据

**影响**: 搜索结果中无法显示面包屑导航

**解决方案**: 为所有页面添加 BreadcrumbList schema

---

### 🟡 中优先级（近期优化）

#### 4. 动态 Sitemap 生成

**问题**: 当前 sitemap 是静态的，需要手动添加博客文章

**影响**: 每次发布新文章都需要更新代码

**解决方案**: 从数据库动态读取所有博客文章

#### 5. 缺少性能优化验证

**问题**: 未验证 Core Web Vitals (LCP, FID, CLS)

**影响**: 可能影响 Google 搜索排名

**解决方案**: 
- 使用 `next/image` 优化图片
- 添加性能监控
- 运行 PageSpeed Insights 测试

#### 6. 缺少 Article 元数据优化

**问题**: 博客文章缺少 `article:published_time`, `article:author` 等元数据

**影响**: 社交媒体分享效果不佳

**解决方案**: 在 `generateMetadata` 中添加 Article 元数据

---

### 🟢 低优先级（长期优化）

#### 7. 缺少视频结构化数据

**问题**: 如果有视频内容，缺少 VideoObject schema

**影响**: 无法在视频搜索结果中显示

**解决方案**: 为视频内容添加 VideoObject schema

#### 8. 缺少本地化结构化数据

**问题**: 如果有实体地址，缺少 LocalBusiness schema

**影响**: 无法在本地搜索结果中显示

**解决方案**: 添加 LocalBusiness schema（如果适用）

#### 9. 缺少评论结构化数据

**问题**: 如果有评论功能，缺少 Review/Rating schema

**影响**: 无法显示评分和评论

**解决方案**: 添加 Review 和 AggregateRating schema

---

## 🚀 改进计划实施步骤

### 阶段 1: 立即修复（1-2 天）

#### 任务 1.1: 更新 Sitemap
- [ ] 添加缺失的博客文章到 `sitemap.ts`
- [ ] 测试 sitemap.xml 生成是否正确
- [ ] 提交到 Google Search Console

#### 任务 1.2: 添加 Article 结构化数据
- [ ] 创建 `getArticleSchema()` 函数
- [ ] 在博客详情页添加 Article JSON-LD
- [ ] 测试结构化数据验证工具

#### 任务 1.3: 添加 BreadcrumbList
- [ ] 创建 `getBreadcrumbSchema()` 函数
- [ ] 为所有页面添加面包屑数据
- [ ] 测试验证

### 阶段 2: 近期优化（1 周）

#### 任务 2.1: 动态 Sitemap
- [ ] 从数据库读取所有博客文章
- [ ] 动态生成 sitemap
- [ ] 添加缓存机制

#### 任务 2.2: 性能优化
- [ ] 运行 PageSpeed Insights
- [ ] 优化图片加载
- [ ] 添加性能监控

#### 任务 2.3: Article 元数据
- [ ] 添加 `article:published_time`
- [ ] 添加 `article:author`
- [ ] 添加 `article:section`

### 阶段 3: 长期优化（1 个月）

#### 任务 3.1: 内容策略
- [ ] 关键词研究（数字遗产、加密资产传承等）
- [ ] 创建内容日历
- [ ] 优化现有内容

#### 任务 3.2: 外链建设
- [ ] 寻找相关网站合作
- [ ] 创建可分享的资源
- [ ] 参与行业社区

---

## 📝 代码改进示例

### 1. 更新 Sitemap（立即实施）

```typescript
// src/app/sitemap.ts
const blogPosts = [
  'how-decryption-works',
  'what-is-xxx',  // Afterglow Story
  'digital-inheritance-guide-2026',
];
```

### 2. 添加 Article Schema（立即实施）

```typescript
// src/config/seo-data.ts
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
```

### 3. 添加 Breadcrumb Schema（立即实施）

```typescript
// src/config/seo-data.ts
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
```

### 4. 在博客详情页使用 Article Schema

```typescript
// src/app/[locale]/(landing)/blog/[slug]/page.tsx
import Script from 'next/script';
import { getArticleSchema } from '@/config/seo-data';

export default async function BlogDetailPage({ params }) {
  const { locale, slug } = await params;
  const post = await getPost({ slug, locale });
  
  const articleSchema = getArticleSchema(locale, {
    title: post.title,
    description: post.description,
    author: post.author_name || 'Admin',
    publishedTime: post.created_at,
    imageUrl: post.image,
    url: `${envConfigs.app_url}/${locale}/blog/${slug}`,
  });

  return (
    <>
      <Script
        id="json-ld-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* 页面内容 */}
    </>
  );
}
```

---

## 🔍 SEO 检测工具清单

### 必用工具（免费）

1. **Google Search Console**
   - 验证网站所有权
   - 提交 sitemap.xml
   - 监控索引状态
   - 查看搜索表现

2. **Google PageSpeed Insights**
   - 测试页面性能
   - 检查 Core Web Vitals
   - 获取优化建议
   - URL: https://pagespeed.web.dev/

3. **Google Rich Results Test**
   - 验证结构化数据
   - 检查 JSON-LD 是否正确
   - URL: https://search.google.com/test/rich-results

4. **Bing Webmaster Tools**
   - 提交网站到 Bing
   - 监控 Bing 搜索表现
   - URL: https://www.bing.com/webmasters

### 推荐工具（付费/高级）

5. **Ahrefs / Semrush**
   - 关键词研究
   - 竞品分析
   - 外链监控
   - 排名追踪

6. **Screaming Frog SEO Spider**
   - 技术 SEO 审计
   - 检查死链
   - 验证元数据
   - URL: https://www.screamingfrog.co.uk/seo-spider/

7. **Schema.org Validator**
   - 验证结构化数据
   - URL: https://validator.schema.org/

---

## 📈 SEO 关键指标监控

### 技术指标

- [ ] Sitemap 提交状态（Google Search Console）
- [ ] 索引页面数量
- [ ] 404 错误数量
- [ ] Core Web Vitals 分数
- [ ] 移动端友好性

### 内容指标

- [ ] 关键词排名
- [ ] 有机搜索流量
- [ ] 点击率 (CTR)
- [ ] 平均排名位置
- [ ] 博客文章阅读量

### 结构化数据指标

- [ ] 结构化数据错误数量
- [ ] 富摘要显示次数
- [ ] Article schema 验证状态

---

## 🎯 关键词策略建议

### 主要关键词（高竞争）

- Digital Inheritance（数字遗产）
- Digital Legacy（数字遗产）
- Dead Man's Switch（死信开关）
- Zero-Knowledge Encryption（零知识加密）
- Asset Inheritance（资产传承）

### 长尾关键词（低竞争，高转化）

- How to pass digital assets to heirs（如何将数字资产传给继承人）
- Secure crypto inheritance solution（安全的加密资产继承方案）
- Zero-knowledge digital vault（零知识数字金库）
- Automated asset distribution after death（死后自动资产分配）
- Encrypted legacy planning（加密遗产规划）

### 多语言关键词

**中文**:
- 数字遗产管理
- 加密资产传承
- 死信开关
- 零知识加密

**法语**:
- Héritage numérique
- Transmission d'actifs cryptographiques
- Dead Man's Switch
- Chiffrement zero-knowledge

---

## ✅ 检查清单

### 部署前检查

- [ ] 所有页面都有唯一的 title 和 description
- [ ] Sitemap.xml 包含所有重要页面
- [ ] Robots.txt 正确配置
- [ ] 结构化数据验证通过
- [ ] 所有图片都有 alt 属性
- [ ] 移动端响应式设计
- [ ] HTTPS 已启用
- [ ] 页面加载速度 < 3 秒

### 部署后检查

- [ ] 提交 sitemap 到 Google Search Console
- [ ] 验证网站所有权
- [ ] 运行 PageSpeed Insights 测试
- [ ] 验证结构化数据
- [ ] 检查移动端友好性
- [ ] 监控索引状态
- [ ] 设置 Google Analytics

---

## 📚 相关资源

- [Next.js SEO 最佳实践](https://nextjs.org/learn/seo/introduction-to-seo)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org 文档](https://schema.org/)
- [Vercel SEO 指南](https://vercel.com/guides/nextjs-seo)

---

**最后更新**: 2026-01-13  
**下次审计日期**: 2026-02-13
