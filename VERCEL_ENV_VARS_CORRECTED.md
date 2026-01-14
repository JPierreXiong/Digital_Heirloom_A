# Vercel 环境变量正确配置

## ⚠️ 发现的问题

### 1. 错误的变量名
您提供的环境变量中有错误的变量名：
- ❌ `NEXT_PUBLIC_digital_heirloomSUPABASE_ANON_KEY` （错误）
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` （正确）

### 2. 缺少关键变量
**最重要的**：缺少 `DATABASE_URL`，这是代码中实际使用的数据库连接变量！

### 3. 重复的变量
`NEXT_PUBLIC_digital_heirloomSUPABASE_ANON_KEY` 出现了两次

### 4. 密码不匹配
您提供的 `POSTGRES_PASSWORD` 是 `tQbCJXRaLlABMRE6`，但连接字符串中的密码可能不同

---

## ✅ 正确的环境变量配置

### 必需的环境变量（代码中实际使用）

```bash
# ============================================
# 数据库配置（最重要！）
# ============================================
DATABASE_URL=postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

# ============================================
# Supabase 配置（客户端）
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://vkafrwwskupsyibrvcvd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDE0NTcsImV4cCI6MjA4MzUxNzQ1N30.mpur4h25R891qzycu9A38QIveUCHMigEM3yPLx8EmMg

# ============================================
# Supabase 配置（服务端）
# ============================================
SUPABASE_URL=https://vkafrwwskupsyibrvcvd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk0MTQ1NywiZXhwIjoyMDgzNTE3NDU3fQ.g-zsgOAF5R8w5IQQWUbrGohyfbN1opZWYBDjlq-hgE8

# ============================================
# Supabase 其他配置（可选）
# ============================================
SUPABASE_PUBLISHABLE_KEY=sb_publishable__cszF9OMQ8jEtXa449qMAg_bklhXid3
SUPABASE_SECRET_KEY=sb_secret_VZdxILehZtP8ugFbBOXI5g_4bAqGCYC
SUPABASE_JWT_SECRET=fa1H/ULE6m2wpHTFqEfsQFm/MzWsGBf0qZHS9S93cnMoZaBYJIb0cCZuF+yWQb04s4g7NgCTrFJ4ey5aIAvRJg==

# ============================================
# PostgreSQL 其他变量（可选，代码中不使用）
# ============================================
# 注意：这些变量在代码中不使用，但可以保留作为参考
POSTGRES_URL=postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL_NON_POOLING=postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_PRISMA_URL=postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_HOST=db.vkafrwwskupsyibrvcvd.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tQbCJXRaLlABMRE6
POSTGRES_DATABASE=postgres
```

---

## 🔧 在 Vercel 中设置环境变量

### 步骤 1：删除错误的变量

删除以下错误的变量：
- ❌ `NEXT_PUBLIC_digital_heirloomSUPABASE_ANON_KEY`（删除）
- ❌ `NEXT_PUBLIC_digital_heirloomSUPABASE_PUBLISHABLE_KEY`（删除）
- ❌ `NEXT_PUBLIC_digital_heirloomSUPABASE_URL`（删除）

### 步骤 2：添加/更新正确的变量

#### 最重要的：添加 `DATABASE_URL`

1. 登录 Vercel Dashboard
2. 选择项目 → **Settings** → **Environment Variables**
3. 添加新变量：
   - **Key**: `DATABASE_URL`
   - **Value**: `postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`
   - **Environment**: Production, Preview, Development（全选）

#### 修复 Supabase 变量名

更新以下变量：
- `NEXT_PUBLIC_SUPABASE_URL` = `https://vkafrwwskupsyibrvcvd.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDE0NTcsImV4cCI6MjA4MzUxNzQ1N30.mpur4h25R891qzycu9A38QIveUCHMigEM3yPLx8EmMg`

---

## 📋 代码中实际使用的变量清单

根据代码扫描，以下变量是**实际使用**的：

### 必需变量（必须设置）

| 变量名 | 用途 | 是否必需 |
|--------|------|---------|
| `DATABASE_URL` | 数据库连接（最重要！） | ✅ 必需 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 客户端 URL | ✅ 必需 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 客户端密钥 | ✅ 必需 |
| `SUPABASE_URL` | Supabase 服务端 URL | ✅ 必需 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | ✅ 必需 |

### 可选变量（可以设置）

| 变量名 | 用途 | 是否必需 |
|--------|------|---------|
| `SUPABASE_PUBLISHABLE_KEY` | Supabase 发布密钥 | ⚠️ 可选 |
| `SUPABASE_SECRET_KEY` | Supabase 密钥 | ⚠️ 可选 |
| `SUPABASE_JWT_SECRET` | Supabase JWT 密钥 | ⚠️ 可选 |
| `POSTGRES_URL` | PostgreSQL URL（代码中不使用） | ❌ 不使用 |
| `POSTGRES_PRISMA_URL` | Prisma URL（代码中不使用） | ❌ 不使用 |
| `POSTGRES_URL_NON_POOLING` | 非连接池 URL（代码中不使用） | ❌ 不使用 |

---

## ⚠️ 重要提醒

1. **DATABASE_URL 必须使用连接池 URL**（端口 6543，包含 `pgbouncer=true`）
2. **变量名必须完全匹配**（区分大小写）
3. **删除所有错误的变量名**（包含 `digital_heirloom` 前缀的）
4. **确保密码一致**：检查 `DATABASE_URL` 中的密码是否与 `POSTGRES_PASSWORD` 匹配

---

## 🔍 验证配置

部署后，检查以下内容：

1. **检查 DATABASE_URL**：
   ```bash
   # 应该包含：
   # - pooler.supabase.com
   # - 端口 6543
   # - pgbouncer=true
   ```

2. **检查变量名**：
   ```bash
   # 正确的变量名：
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   
   # 错误的变量名（删除）：
   NEXT_PUBLIC_digital_heirloomSUPABASE_ANON_KEY
   ```

3. **测试连接**：
   - 访问 `/api/auth/get-session`
   - 检查是否还有 "Tenant or user not found" 错误
