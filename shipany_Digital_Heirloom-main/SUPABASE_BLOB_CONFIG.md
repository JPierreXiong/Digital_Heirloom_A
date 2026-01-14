# Supabase & Vercel Blob 配置信息

**更新日期**: 2025-01-15  
**项目**: Digital Heirloom / Afterglow

---

## 🔑 Supabase 配置

### 项目信息

**项目 URL**:
```
https://vkafrwwskupsyibrvcvd.supabase.co
```

**项目引用 ID**: `vkafrwwskupsyibrvcvd`

---

### API Keys

**匿名密钥 (Anon Key)**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDE0NTcsImV4cCI6MjA4MzUxNzQ1N30.mpur4h25R891qzycu9A38QIveUCHMigEM3yPLx8EmMg
```

**Service Role Key** (仅服务端使用):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk0MTQ1NywiZXhwIjoyMDgzNTE3NDU3fQ.g-zsgOAF5R8w5IQQWUbrGohyfbN1opZWYBDjlq-hgE8
```

**Publishable Key**:
```
sb_publishable__cszF9OMQ8jEtXa449qMAg_bklhXid3
```

**Secret Key**:
```
sb_secret_VZdxILehZtP8ugFbBOXI5g_4bAqGCYC
```

**JWT Secret**:
```
fa1H/ULE6m2wpHTFqEfsQFm/MzWsGBf0qZHS9S93cnMoZaBYJIb0cCZuF+yWQb04s4g7NgCTrFJ4ey5aIAvRJg==
```

---

### 数据库配置

**连接池 URL** (推荐用于应用):
```
postgres://postgres.vkafrwwskupsyibrvcvd:lEuluFvxDT90QiFz@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**非连接池 URL** (用于迁移等操作):
```
postgres://postgres.vkafrwwskupsyibrvcvd:lEuluFvxDT90QiFz@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**连接信息**:
- Host: `db.vkafrwwskupsyibrvcvd.supabase.co`
- User: `postgres`
- Password: `lEuluFvxDT90QiFz`
- Database: `postgres`

---

## 🔑 Vercel Blob 配置

**读写令牌**:
```
vercel_blob_rw_T1QruDd1XViT9FhM_y9TAKwEjlSRuuQXRo9B5vJKNyGulcJ
```

**使用示例**:
```typescript
import { put } from "@vercel/blob";

const { url } = await put('articles/blob.txt', 'Hello World!', { 
  access: 'public' 
});
```

---

## 📋 环境变量配置

### 必需配置

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://vkafrwwskupsyibrvcvd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDE0NTcsImV4cCI6MjA4MzUxNzQ1N30.mpur4h25R891qzycu9A38QIveUCHMigEM3yPLx8EmMg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk0MTQ1NywiZXhwIjoyMDgzNTE3NDU3fQ.g-zsgOAF5R8w5IQQWUbrGohyfbN1opZWYBDjlq-hgE8

# 数据库配置
DATABASE_URL=postgres://postgres.vkafrwwskupsyibrvcvd:lEuluFvxDT90QiFz@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

# Vercel Blob（可选）
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_T1QruDd1XViT9FhM_y9TAKwEjlSRuuQXRo9B5vJKNyGulcJ
```

---

## ✅ 验证配置

### 检查 Supabase 连接

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 测试连接
const { data, error } = await supabase.from('digital_vaults').select('count');
```

### 检查数据库连接

```typescript
// 使用 Drizzle ORM
import { db } from '@/core/db';

const result = await db().select().from(digitalVaults).limit(1);
```

### 检查 Vercel Blob

```typescript
import { put } from "@vercel/blob";

const { url } = await put('test.txt', 'Test content', { 
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN
});
```

---

## 🔒 安全提示

1. **Service Role Key**
   - ⚠️ 仅在服务端使用
   - ⚠️ 不要暴露给客户端
   - ⚠️ 不要使用 `NEXT_PUBLIC_` 前缀

2. **数据库密码**
   - ⚠️ 不要提交到版本控制
   - ⚠️ 使用环境变量管理

3. **Vercel Blob Token**
   - ⚠️ 仅在需要时使用
   - ⚠️ Digital Heirloom 默认使用 Supabase Storage

---

## 📝 使用场景

### Supabase Storage（默认）

Digital Heirloom 默认使用 Supabase Storage 存储加密文件：

- Bucket: `digital_heirloom_assets`
- 路径格式: `{vault_id}/{file_id}_{filename}.enc`
- 访问控制: RLS (Row Level Security)

### Vercel Blob（可选）

如果需要使用 Vercel Blob：

1. 设置 `STORAGE_PROVIDER=vercel-blob`
2. 配置 `BLOB_READ_WRITE_TOKEN`
3. 更新存储服务配置

---

## 🔍 故障排查

### Supabase 连接失败

**可能原因**:
- URL 或 Key 配置错误
- 网络连接问题
- RLS 策略限制

**解决方法**:
1. 检查环境变量是否正确设置
2. 验证 URL 格式（以 `https://` 开头）
3. 检查 Supabase Dashboard 中的 API Keys

### 数据库连接失败

**可能原因**:
- 连接字符串格式错误
- 密码错误
- 连接池限制

**解决方法**:
1. 使用提供的连接池 URL
2. 确认密码正确
3. 检查 Supabase Dashboard 中的数据库连接信息

---

**最后更新**: 2025-01-15  
**配置状态**: ✅ 已配置


