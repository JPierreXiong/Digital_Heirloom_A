# Google SEO 测试指南 - Digital Heirloom

**测试日期**: 2026-01-13  
**网站**: https://www.digitalheirloom.app

---

## 🎯 今天需要完成的 Google 测试任务

### ✅ 任务清单

- [ ] 1. Google Search Console 验证和提交
- [ ] 2. Sitemap 提交
- [ ] 3. 结构化数据验证（Rich Results Test）
- [ ] 4. 页面性能测试（PageSpeed Insights）
- [ ] 5. 移动端友好性测试
- [ ] 6. URL 检查工具测试

---

## 📋 详细测试步骤

### 1. Google Search Console 设置

#### 1.1 访问 Google Search Console
- URL: https://search.google.com/search-console
- 使用 Google 账号登录

#### 1.2 添加属性（Property）
1. 点击左侧菜单 "属性" → "添加属性"
2. 选择 "网址前缀"
3. 输入: `https://www.digitalheirloom.app`
4. 点击 "继续"

#### 1.3 验证网站所有权

**方法 1: HTML 标签验证（推荐）**
1. 复制 Google 提供的 HTML 标签
2. 添加到 `src/app/layout.tsx` 的 `<head>` 部分：
```tsx
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

**方法 2: HTML 文件上传**
1. 下载 Google 提供的 HTML 文件
2. 上传到 `public/` 目录
3. 确保可以通过 `https://www.digitalheirloom.app/googlexxxxx.html` 访问

**方法 3: DNS 记录（如果使用自定义域名）**
1. 在域名 DNS 设置中添加 TXT 记录
2. 等待 DNS 传播（通常几分钟到几小时）

#### 1.4 验证完成
- 点击 "验证" 按钮
- 等待验证结果（通常几秒钟）

---

### 2. 提交 Sitemap

#### 2.1 访问 Sitemap 页面
- 在 Google Search Console 中，点击左侧菜单 "Sitemap"

#### 2.2 提交 Sitemap URL
1. 在 "添加新的 sitemap" 输入框中输入：
   ```
   https://www.digitalheirloom.app/sitemap.xml
   ```
2. 点击 "提交"

#### 2.3 验证 Sitemap
- 等待 Google 处理（通常几分钟到几小时）
- 检查状态：应该显示 "成功"
- 查看索引的 URL 数量

#### 2.4 检查 Sitemap 内容
访问以下 URL 确认 sitemap 正确生成：
- https://www.digitalheirloom.app/sitemap.xml

应该包含：
- 所有语言版本的主页（en, zh, fr）
- 所有营销页面（pricing, about, contact, blog）
- 所有博客文章（包括新添加的）

---

### 3. 结构化数据验证（Rich Results Test）

#### 3.1 访问 Rich Results Test
- URL: https://search.google.com/test/rich-results

#### 3.2 测试主页
1. 输入 URL: `https://www.digitalheirloom.app`
2. 点击 "测试网址"
3. 检查结果：
   - ✅ SoftwareApplication schema
   - ✅ Organization schema
   - ✅ FAQPage schema（如果有 FAQ）

#### 3.3 测试博客文章
测试以下博客文章：
1. `https://www.digitalheirloom.app/blog/what-is-xxx`
2. `https://www.digitalheirloom.app/blog/digital-inheritance-guide-2026`
3. `https://www.digitalheirloom.app/blog/how-decryption-works`

**预期结果**:
- ✅ Article schema 验证通过
- ✅ 显示标题、作者、发布日期
- ✅ 显示图片

#### 3.4 测试多语言版本
测试中文和法语版本：
- `https://www.digitalheirloom.app/zh/blog/what-is-xxx`
- `https://www.digitalheirloom.app/fr/blog/what-is-xxx`

---

### 4. 页面性能测试（PageSpeed Insights）

#### 4.1 访问 PageSpeed Insights
- URL: https://pagespeed.web.dev/

#### 4.2 测试主页
1. 输入 URL: `https://www.digitalheirloom.app`
2. 选择 "移动设备" 或 "桌面设备"
3. 点击 "分析"

#### 4.3 检查 Core Web Vitals
**目标分数**:
- Performance Score: > 90
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Total Blocking Time (TBT): < 200ms

#### 4.4 优化建议
如果分数低于目标：
- 优化图片（使用 `next/image`）
- 启用压缩（Gzip/Brotli）
- 减少 JavaScript 大小
- 使用 CDN

#### 4.5 测试其他关键页面
- `/pricing`
- `/blog`
- `/blog/what-is-xxx`

---

### 5. 移动端友好性测试

#### 5.1 使用 Google Mobile-Friendly Test
- URL: https://search.google.com/test/mobile-friendly

#### 5.2 测试关键页面
1. 输入 URL
2. 点击 "测试网址"
3. 检查结果：应该显示 "页面适合移动设备"

#### 5.3 手动检查
- 在移动设备上访问网站
- 检查：
  - 文字大小是否合适
  - 按钮是否易于点击
  - 页面是否响应式
  - 没有水平滚动

---

### 6. URL 检查工具

#### 6.1 访问 URL 检查工具
- URL: https://search.google.com/search-console/inspect

#### 6.2 检查关键页面索引状态
测试以下 URL：
- `https://www.digitalheirloom.app`
- `https://www.digitalheirloom.app/pricing`
- `https://www.digitalheirloom.app/blog`
- `https://www.digitalheirloom.app/blog/what-is-xxx`
- `https://www.digitalheirloom.app/blog/digital-inheritance-guide-2026`

#### 6.3 请求索引（如果需要）
- 如果页面未索引，点击 "请求编入索引"
- 等待 Google 处理（通常几分钟到几天）

---

## 🔍 验证检查清单

### 技术性 SEO
- [ ] Sitemap.xml 可以访问
- [ ] Robots.txt 正确配置
- [ ] 所有页面有唯一的 title 和 description
- [ ] Canonical URLs 正确设置
- [ ] hreflang 标签正确（多语言）

### 结构化数据
- [ ] SoftwareApplication schema 验证通过
- [ ] Organization schema 验证通过
- [ ] Article schema 验证通过（博客文章）
- [ ] FAQPage schema 验证通过（如果有）

### 性能
- [ ] PageSpeed Insights 分数 > 90
- [ ] Core Web Vitals 全部通过
- [ ] 移动端友好性测试通过

### 索引状态
- [ ] Google Search Console 显示网站已验证
- [ ] Sitemap 提交成功
- [ ] 关键页面已索引

---

## 📊 测试结果记录表

### Google Search Console
- **验证状态**: ⬜ 待测试
- **Sitemap 状态**: ⬜ 待测试
- **索引页面数**: ⬜ 待测试

### Rich Results Test
- **主页结构化数据**: ⬜ 待测试
- **博客文章结构化数据**: ⬜ 待测试
- **错误数量**: ⬜ 待测试

### PageSpeed Insights
- **桌面性能分数**: ⬜ 待测试
- **移动性能分数**: ⬜ 待测试
- **Core Web Vitals**: ⬜ 待测试

### Mobile-Friendly Test
- **移动端友好性**: ⬜ 待测试

---

## 🚨 常见问题排查

### 问题 1: Sitemap 无法访问
**解决方案**:
- 检查 `src/app/sitemap.ts` 是否正确
- 确认部署后 sitemap.xml 可以访问
- 检查 `robots.txt` 中是否引用了 sitemap

### 问题 2: 结构化数据验证失败
**解决方案**:
- 使用 [Schema.org Validator](https://validator.schema.org/) 检查
- 确认 JSON-LD 格式正确
- 检查是否有语法错误

### 问题 3: 页面未索引
**解决方案**:
- 在 URL 检查工具中请求索引
- 检查 robots.txt 是否阻止了爬虫
- 确认页面有内容（不是空白页）

### 问题 4: 性能分数低
**解决方案**:
- 优化图片大小和格式
- 启用 Next.js 图片优化
- 减少 JavaScript bundle 大小
- 使用 CDN

---

## 📝 测试后行动项

### 立即执行（今天）
1. ✅ 完成所有 Google 测试
2. ✅ 记录测试结果
3. ✅ 修复发现的问题

### 本周内
1. 监控 Google Search Console 数据
2. 检查索引状态
3. 优化性能问题

### 长期监控
1. 每周检查 Search Console
2. 监控关键词排名
3. 跟踪有机搜索流量

---

## 🔗 快速链接

- [Google Search Console](https://search.google.com/search-console)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [URL Inspection Tool](https://search.google.com/search-console/inspect)
- [Schema.org Validator](https://validator.schema.org/)

---

**测试完成后，请更新此文档中的检查清单状态！**
