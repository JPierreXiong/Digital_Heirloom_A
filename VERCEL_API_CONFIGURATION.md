# Digital Heirloom - Vercel API 配置清单

本文档列出了 Digital Heirloom 项目在 Vercel 上部署所需的所有 API 配置和环境变量。

## 📋 目录

1. [Vercel Cron Jobs API](#vercel-cron-jobs-api)
2. [内部 API 路由](#内部-api-路由)
3. [外部服务 API](#外部服务-api)
4. [环境变量配置](#环境变量配置)
5. [Vercel 部署配置](#vercel-部署配置)

---

## 🔄 Vercel Cron Jobs API

### 1. Unified Handler (统一守卫任务)

**路径**: `/api/cron/unified-handler`  
**调度**: `0 2 * * *` (每天 UTC 02:00，北京时间 10:00)  
**功能**: 按顺序执行三个核心任务
- Dead Man's Switch 检查（用户活跃度检测、资产释放、ShipAny 物流触发）
- 系统健康监控（业务指标异常检测）
- 成本监控（邮件、存储、物流成本监控）

**认证**: 
- 需要设置 `VERCEL_CRON_SECRET` 环境变量（优先使用）或 `CRON_SECRET`（备用）
- Vercel 会自动在请求头中添加 `Authorization: Bearer <secret>`
- 代码会自动验证请求头中的密钥是否匹配环境变量

**配置示例** (vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/cron/unified-handler",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**环境变量设置步骤**:

1. **在 Vercel Dashboard 中设置**:
   - 登录 Vercel Dashboard: https://vercel.com/dashboard
   - 选择项目 → Settings → Environment Variables
   - 添加环境变量:
     - **Key**: `VERCEL_CRON_SECRET`
     - **Value**: `super_secret_string_123` (或自定义的随机字符串)
     - **Environment**: 选择 Production、Preview、Development（建议全部选择）
   - 点击 **Save**

2. **验证代码逻辑**:
   ```typescript
   // 代码会自动检查请求头中的 Authorization
   const authHeader = request.headers.get('authorization');
   const cronSecret = process.env.VERCEL_CRON_SECRET || process.env.CRON_SECRET;
   
   if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

3. **为什么需要 VERCEL_CRON_SECRET**:
   - 防止外部恶意调用：确保只有 Vercel 的定时器可以触发 Cron Job
   - 安全性：保护敏感的后台操作（如资产释放、ShipAny 物流触发等）
   - 符合最佳实践：遵循 Vercel 官方推荐的安全配置方式

**环境变量示例**:
```bash
# 推荐：使用 VERCEL_CRON_SECRET（优先）
VERCEL_CRON_SECRET=super_secret_string_123

# 备用：如果没有设置 VERCEL_CRON_SECRET，可以使用 CRON_SECRET
CRON_SECRET=super_secret_string_123
```

**注意事项**:
- ⚠️ 如果环境变量未设置，Cron Job 仍然可以运行（向后兼容）
- ⚠️ 建议在生产环境中始终设置 `VERCEL_CRON_SECRET` 以确保安全
- ⚠️ 密钥应该是一个随机生成的长字符串，不要使用简单的密码

---

## 🔌 内部 API 路由

### 认证相关

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/auth/[...all]` | GET/POST | Better Auth 认证路由 | 可选 |

### Digital Heirloom 核心功能

#### 保险箱管理

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/digital-heirloom/vault/create` | POST | 创建数字遗产保险箱 | 必需 |
| `/api/digital-heirloom/vault/get` | GET | 获取保险箱信息 | 必需 |
| `/api/digital-heirloom/vault/initialize` | POST | 初始化保险箱 | 必需 |
| `/api/digital-heirloom/vault/update` | POST | 更新保险箱配置 | 必需 |
| `/api/digital-heirloom/vault/heartbeat` | POST | 发送心跳信号 | 必需 |
| `/api/digital-heirloom/vault/trigger-inheritance` | POST | 手动触发继承流程 | 必需 |

#### 受益人管理

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/digital-heirloom/beneficiaries/add` | POST | 添加受益人 | 必需 |
| `/api/digital-heirloom/beneficiaries/list` | GET | 获取受益人列表 | 必需 |
| `/api/digital-heirloom/beneficiaries/remove` | POST | 删除受益人 | 必需 |
| `/api/digital-heirloom/beneficiaries/decrypt` | POST | 受益人解密资产 | 必需 |
| `/api/digital-heirloom/beneficiaries/verify-fragment` | POST | 验证物理分片 | 必需 |
| `/api/digital-heirloom/beneficiaries/inheritance-center` | GET | 继承中心页面数据 | 必需 |

#### 资产管理

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/digital-heirloom/assets/upload` | POST | 上传资产文件 | 必需 |
| `/api/digital-heirloom/assets/list` | GET | 获取资产列表 | 必需 |
| `/api/digital-heirloom/assets/get` | GET | 获取单个资产 | 必需 |
| `/api/digital-heirloom/assets/update` | POST | 更新资产信息 | 必需 |
| `/api/digital-heirloom/assets/delete` | POST | 删除资产 | 必需 |
| `/api/digital-heirloom/assets/preview` | GET | 预览资产 | 必需 |
| `/api/digital-heirloom/assets/blob-upload` | POST | Blob 存储上传 | 必需 |

#### 心跳确认

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/digital-heirloom/heartbeat/confirm` | POST | 确认心跳（通过邮件链接） | 可选 |

#### 资产释放

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/digital-heirloom/release/request` | POST | 请求资产释放 | 必需 |
| `/api/digital-heirloom/release/verify` | POST | 验证释放令牌 | 必需 |

#### 恢复工具包

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/digital-heirloom/recovery-kit/print-data` | GET | 获取打印数据 | 必需 |

### 管理员功能

#### 数字遗产管理

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/admin/digital-heirloom/vaults` | GET | 获取所有保险箱列表 | Admin |
| `/api/admin/digital-heirloom/vaults/[vaultId]/trigger-now` | POST | 立即触发继承 | Admin |
| `/api/admin/digital-heirloom/vaults/[vaultId]/reset-heartbeat` | POST | 重置心跳 | Admin |
| `/api/admin/digital-heirloom/vaults/[vaultId]/pause` | POST | 暂停保险箱 | Admin |
| `/api/admin/digital-heirloom/vaults/[vaultId]` | GET/DELETE | 获取/删除保险箱 | Admin |
| `/api/admin/digital-heirloom/vaults/batch-compensate` | POST | 批量补偿 | Admin |
| `/api/admin/digital-heirloom/vaults/export` | GET | 导出保险箱数据 | Admin |
| `/api/admin/digital-heirloom/stats` | GET | 获取统计信息 | Admin |
| `/api/admin/digital-heirloom/alerts` | GET | 获取报警信息 | Admin |
| `/api/admin/digital-heirloom/costs` | GET | 获取成本统计 | Admin |
| `/api/admin/digital-heirloom/reports` | GET | 获取报告 | Admin |
| `/api/admin/digital-heirloom/security` | GET | 获取安全信息 | Admin |
| `/api/admin/digital-heirloom/compensations` | GET | 获取补偿记录 | Admin |

#### 物流管理

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/admin/shipping/list` | GET | 获取物流订单列表 | Admin |
| `/api/admin/shipping/confirm-ship` | POST | 确认发货 | Admin |
| `/api/admin/shipping/request-payment` | POST | 请求支付 | Admin |

### 其他功能

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/config/get-configs` | GET | 获取应用配置 | 可选 |
| `/api/email/send-email` | POST | 发送邮件 | 必需 |
| `/api/storage/upload-image` | POST | 上传图片 | 必需 |
| `/api/user/get-user-info` | GET | 获取用户信息 | 必需 |
| `/api/user/get-user-credits` | GET | 获取用户积分 | 必需 |
| `/api/user/grant-free-credits` | POST | 授予免费积分 | Admin |
| `/api/docs/search` | GET | 文档搜索 | 可选 |

### 支付相关

| 路径 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/payment/checkout` | POST | 创建支付订单 | 必需 |
| `/api/payment/callback` | GET | 支付回调 | 可选 |
| `/api/payment/notify/[provider]` | POST | 支付通知（Stripe/PayPal） | 可选 |

---

## 🌐 外部服务 API

### 1. Supabase API

**用途**: 数据库和存储服务

**必需配置**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 仅服务端使用
```

**API 端点**:
- 数据库: `https://your-project.supabase.co/rest/v1/`
- 存储: `https://your-project.supabase.co/storage/v1/`
- 认证: `https://your-project.supabase.co/auth/v1/`

**文档**: https://supabase.com/docs/reference

### 2. ShipAny API

**用途**: 物理资产物流寄送（Pro 版功能）

**必需配置**:
```bash
SHIPANY_API_KEY=your-api-key
SHIPANY_MERCHANDISE_ID=your-merchandise-id
SHIPANY_API_URL=https://api.shipany.io/v1
```

**可选配置**:
```bash
SHIPANY_SENDER_NAME=Digital Heirloom Vault
SHIPANY_SENDER_PHONE=+852-xxxx-xxxx
SHIPANY_SENDER_EMAIL=noreply@afterglow.app
SHIPANY_SENDER_ADDRESS_LINE1=Your Warehouse Address
SHIPANY_SENDER_CITY=Hong Kong
SHIPANY_SENDER_ZIP_CODE=000000
SHIPANY_SENDER_COUNTRY_CODE=HKG
```

**API 端点**: `https://api.shipany.io/v1`

**主要功能**:
- 创建物流订单: `POST /shipments`
- 查询订单状态: `GET /shipments/{id}`
- 取消订单: `DELETE /shipments/{id}`

### 3. Resend API

**用途**: 邮件发送服务（死信开关通知）

**必需配置**:
```bash
RESEND_API_KEY=re_your-api-key
RESEND_DEFAULT_FROM=security@afterglow.app
```

**API 端点**: `https://api.resend.com`

**主要功能**:
- 发送邮件: `POST /emails`
- 查询邮件状态: `GET /emails/{id}`

**文档**: https://resend.com/docs/api-reference

### 4. Vercel Blob Storage (可选)

**用途**: 文件存储（如果使用 Vercel Blob 而非 Supabase Storage）

**必需配置**:
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your-token
STORAGE_PROVIDER=vercel-blob  # 或 supabase
```

**API 端点**: `https://blob.vercel-storage.com`

**文档**: https://vercel.com/docs/storage/vercel-blob

### 5. Google OAuth (可选)

**用途**: Google 登录认证

**可选配置**:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**API 端点**: `https://accounts.google.com`

---

## ⚙️ 环境变量配置

### 必需环境变量

```bash
# ============================================
# 基础应用配置
# ============================================
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Digital Heirloom
NEXT_PUBLIC_DEFAULT_LOCALE=en

# ============================================
# 数据库配置
# ============================================
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://user:password@host:5432/database?sslmode=require

# ============================================
# 认证配置
# ============================================
AUTH_SECRET=your-auth-secret-key  # 生成: openssl rand -base64 32
AUTH_URL=https://your-domain.com

# ============================================
# Supabase 配置
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============================================
# ShipAny 配置（Pro 版功能）
# ============================================
SHIPANY_API_KEY=your-api-key
SHIPANY_MERCHANDISE_ID=your-merchandise-id
SHIPANY_API_URL=https://api.shipany.io/v1

# ============================================
# 邮件配置
# ============================================
RESEND_API_KEY=re_your-api-key
RESEND_DEFAULT_FROM=security@afterglow.app

# ============================================
# Vercel Cron 配置
# ============================================
# 推荐：使用 VERCEL_CRON_SECRET（优先）
VERCEL_CRON_SECRET=super_secret_string_123

# 备用：如果没有设置 VERCEL_CRON_SECRET，可以使用 CRON_SECRET
# CRON_SECRET=super_secret_string_123
```

### 可选环境变量

```bash
# 存储配置
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your-token
STORAGE_PROVIDER=supabase  # 或 vercel-blob

# ShipAny 发件人信息（可选）
SHIPANY_SENDER_NAME=Digital Heirloom Vault
SHIPANY_SENDER_PHONE=+852-xxxx-xxxx
SHIPANY_SENDER_EMAIL=noreply@afterglow.app
SHIPANY_SENDER_ADDRESS_LINE1=Your Warehouse Address
SHIPANY_SENDER_CITY=Hong Kong
SHIPANY_SENDER_ZIP_CODE=000000
SHIPANY_SENDER_COUNTRY_CODE=HKG

# Google OAuth（可选）
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# 管理员报警邮箱（可选）
ADMIN_ALERT_EMAIL=admin@example.com

# Slack/Telegram 通知（可选）
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# 系统环境
NODE_ENV=production
```

---

## 🚀 Vercel 部署配置

### vercel.json 配置

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096",
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    },
    "src/app/api/ai/**/*.ts": {
      "maxDuration": 60
    },
    "src/app/api/payment/**/*.ts": {
      "maxDuration": 30
    },
    "src/app/api/storage/**/*.ts": {
      "maxDuration": 30
    },
    "src/app/api/media/**/*.ts": {
      "maxDuration": 180
    }
  },
  "crons": [
    {
      "path": "/api/cron/unified-handler",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Vercel 环境变量设置步骤

1. 登录 Vercel Dashboard: https://vercel.com/dashboard
2. 选择项目: `Digital_Heirloom_A`
3. 进入 Settings → Environment Variables
4. 添加所有必需的环境变量（见上方列表）
5. 确保为以下环境设置变量:
   - Production
   - Preview
   - Development

### Vercel Cron Job 配置

1. **配置 Cron Job**:
   - 在 Vercel Dashboard 中，进入项目的 Settings → Cron Jobs
   - 确认 `unified-handler` Cron Job 已正确配置
   - 调度时间: `0 2 * * *` (每天 UTC 02:00)

2. **设置 VERCEL_CRON_SECRET**:
   - 进入 Settings → Environment Variables
   - 添加环境变量:
     - **Key**: `VERCEL_CRON_SECRET`
     - **Value**: `super_secret_string_123` (或自定义的随机字符串)
     - **Environment**: Production、Preview、Development（建议全部选择）
   - 点击 **Save**

3. **验证配置**:
   - 部署后，在 Vercel Dashboard → Functions → Cron Jobs 中查看执行日志
   - 如果看到 401 Unauthorized 错误，检查 `VERCEL_CRON_SECRET` 是否正确设置
   - 确保环境变量已应用到正确的环境（Production/Preview/Development）

4. **手动测试 Cron Job** (可选):
   ```bash
   # 使用 curl 测试（需要替换为实际的域名和密钥）
   curl -X GET https://your-domain.com/api/cron/unified-handler \
     -H "Authorization: Bearer super_secret_string_123"
   ```

### 部署检查清单

- [ ] 所有必需环境变量已设置
- [ ] `VERCEL_CRON_SECRET` 已配置（推荐值: `super_secret_string_123`）
- [ ] `VERCEL_CRON_SECRET` 已应用到所有环境（Production/Preview/Development）
- [ ] Supabase 连接字符串正确
- [ ] ShipAny API Key 已配置（如果使用 Pro 功能）
- [ ] Resend API Key 已配置
- [ ] `AUTH_SECRET` 已生成并设置
- [ ] `NEXT_PUBLIC_APP_URL` 设置为生产域名
- [ ] Cron Job 在 Vercel Dashboard 中可见
- [ ] 已测试 Cron Job 可以正常执行（检查 Functions 日志）

---

## 📝 注意事项

1. **安全性**:
   - 所有包含 `NEXT_PUBLIC_` 前缀的变量会暴露给客户端
   - 敏感信息（API Keys、Secrets）不要使用 `NEXT_PUBLIC_` 前缀
   - `SUPABASE_SERVICE_ROLE_KEY` 仅在服务端使用，不要暴露给客户端

2. **Cron Job 限制**:
   - Vercel Hobby 计划最多支持 2 个 Cron Jobs
   - 当前配置使用 1 个统一处理程序，符合限制
   - 必须设置 `VERCEL_CRON_SECRET` 环境变量以确保安全

3. **VERCEL_CRON_SECRET 安全提示**:
   - ⚠️ 不要将 `VERCEL_CRON_SECRET` 提交到代码仓库
   - ⚠️ 使用随机生成的长字符串作为密钥值（推荐: `super_secret_string_123`）
   - ⚠️ 定期轮换密钥以提高安全性
   - ⚠️ 如果遇到 401 Unauthorized 错误，检查环境变量是否正确设置
   - ⚠️ 确保环境变量已应用到所有环境（Production/Preview/Development）

4. **API 速率限制**:
   - Resend: 免费版每月 3,000 封邮件
   - ShipAny: 根据套餐限制
   - Supabase: 根据套餐限制

5. **监控和日志**:
   - Vercel Dashboard → Functions 查看 API 调用日志
   - Vercel Dashboard → Cron Jobs 查看 Cron 执行日志
   - Supabase Dashboard 查看数据库和存储使用情况

---

## 🔗 相关文档

- [Vercel Cron Jobs 文档](https://vercel.com/docs/cron-jobs)
- [Supabase 文档](https://supabase.com/docs)
- [ShipAny API 文档](https://docs.shipany.io)
- [Resend API 文档](https://resend.com/docs)
- [Better Auth 文档](https://www.better-auth.com/docs)

---

**最后更新**: 2026-01-13  
**版本**: 1.0.0
