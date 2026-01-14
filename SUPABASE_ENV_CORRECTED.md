# Supabase 环境变量配置修正

## ⚠️ 问题发现

您提供的环境变量名有误，包含错误的前缀 `digital_heirloom`。

## ✅ 正确的环境变量名

根据代码实际使用的变量名，正确的配置应该是：

```env
# ============================================
# Supabase 配置 (Digital Heirloom 必需)
# ============================================

# Supabase 项目 URL - 必需（客户端和服务端）
NEXT_PUBLIC_SUPABASE_URL=https://vkafrwwskupsyibrvcvd.supabase.co

# Supabase 匿名密钥 - 必需（客户端使用）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDE0NTcsImV4cCI6MjA4MzUxNzQ1N30.mpur4h25R891qzycu9A38QIveUCHMigEM3yPLx8EmMg

# Supabase Service Role Key - 必需（仅服务端使用）
# ⚠️ 警告: 此密钥具有完整数据库访问权限，仅在服务端使用，不要暴露给客户端
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk0MTQ1NywiZXhwIjoyMDgzNTE3NDU3fQ.g-zsgOAF5R8w5IQQWUbrGohyfbN1opZWYBDjlq-hgE8

# Supabase URL - 可选（服务端使用，如果未设置会使用 NEXT_PUBLIC_SUPABASE_URL）
SUPABASE_URL=https://vkafrwwskupsyibrvcvd.supabase.co

# ============================================
# 数据库配置 (必需)
# ============================================

# PostgreSQL 数据库连接 URL - 必需（使用连接池）
DATABASE_URL=postgres://postgres.vkafrwwskupsyibrvcvd:lEuluFvxDT90QiFz@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

# PostgreSQL 非连接池 URL（用于迁移等操作）
POSTGRES_URL_NON_POOLING=postgres://postgres.vkafrwwskupsyibrvcvd:lEuluFvxDT90QiFz@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require

# PostgreSQL 连接信息（可选，用于参考）
POSTGRES_HOST=db.vkafrwwskupsyibrvcvd.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=lEuluFvxDT90QiFz
POSTGRES_DATABASE=postgres

# ============================================
# 可选 Supabase 配置
# ============================================

# Supabase Publishable Key - 可选（代码中未使用）
SUPABASE_PUBLISHABLE_KEY=sb_publishable__cszF9OMQ8jEtXa449qMAg_bklhXid3

# Supabase Secret Key - 可选（代码中未使用）
SUPABASE_SECRET_KEY=sb_secret_VZdxILehZtP8ugFbBOXI5g_4bAqGCYC

# Supabase JWT Secret - 可选（代码中未使用）
SUPABASE_JWT_SECRET=fa1H/ULE6m2wpHTFqEfsQFm/MzWsGBf0qZHS9S93cnMoZaBYJIb0cCZuF+yWQb04s4g7NgCTrFJ4ey5aIAvRJg==
```

## ❌ 错误的变量名（请删除或重命名）

以下变量名是错误的，代码无法识别：

```env
# ❌ 错误 - 包含错误的前缀
NEXT_PUBLIC_digital_heirloomSUPABASE_ANON_KEY=...
NEXT_PUBLIC_digital_heirloomSUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_digital_heirloomSUPABASE_URL=...
```

## 📋 代码中实际使用的变量

根据代码检查，以下变量在代码中被实际使用：

1. **客户端组件使用**：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **服务端 API 路由使用**：
   - `SUPABASE_URL` 或 `NEXT_PUBLIC_SUPABASE_URL`（作为 fallback）
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **数据库连接使用**：
   - `DATABASE_URL`（主要）
   - `POSTGRES_URL_NON_POOLING`（迁移时使用）

## 🔍 验证配置

### 1. 检查 Supabase URL 和 Key 是否正确

```bash
# 验证 Supabase URL 格式
echo $NEXT_PUBLIC_SUPABASE_URL
# 应该输出: https://vkafrwwskupsyibrvcvd.supabase.co

# 验证 ANON KEY 格式（JWT token）
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY | cut -d'.' -f1
# 应该输出 JWT header（base64 编码）
```

### 2. 检查数据库连接

```bash
# 验证 DATABASE_URL 格式
echo $DATABASE_URL
# 应该包含: postgres://postgres.vkafrwwskupsyibrvcvd:...
```

### 3. 测试连接

可以使用以下 Node.js 脚本测试连接：

```javascript
// test-supabase-connection.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 环境变量未设置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 测试连接
supabase.from('user').select('count').limit(1)
  .then(() => console.log('✅ Supabase 连接成功'))
  .catch((err) => console.error('❌ Supabase 连接失败:', err));
```

## 📝 更新步骤

1. **更新 `.env.local` 文件**：
   - 删除错误的变量名（包含 `digital_heirloom` 前缀的）
   - 使用上面提供的正确变量名

2. **更新 Vercel 环境变量**（如果使用 Vercel 部署）：
   - 进入 Vercel Dashboard → Project Settings → Environment Variables
   - 删除错误的变量
   - 添加正确的变量

3. **重启开发服务器**：
   ```bash
   pnpm dev
   ```

## ✅ 配置验证清单

- [ ] `NEXT_PUBLIC_SUPABASE_URL` 已设置且格式正确
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已设置且是有效的 JWT token
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 已设置（服务端使用）
- [ ] `DATABASE_URL` 已设置且可以连接
- [ ] 删除了所有错误的变量名（包含 `digital_heirloom` 前缀的）
