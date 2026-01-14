# ⚠️ 紧急：需要重新部署

## 问题

Vercel 上的 `DATABASE_URL` 用户名格式不正确，导致 "Tenant or user not found" 错误。

**错误格式：** `postgres://postgres@...`  
**正确格式：** `postgres://postgres.vkafrwwskupsyibrvcvd@...`

## 已完成的修复

✅ 已强制更新 Vercel 上的 `DATABASE_URL`：
- 删除了旧的 `DATABASE_URL`（用户名格式错误）
- 设置了新的 `DATABASE_URL`（用户名格式正确：`postgres.vkafrwwskupsyibrvcvd`）
- 应用到所有环境（production, preview, development）

## 必须立即执行的操作

### 步骤 1: 重新部署项目

环境变量已更新，但**必须重新部署才能生效**。

#### 方法 A: 通过 Vercel Dashboard（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 `shipany-digital-heirloom`
3. 进入 **Deployments** 标签
4. 找到最新的部署
5. 点击 **⋯** → **Redeploy**
6. 等待部署完成（约 2-5 分钟）

#### 方法 B: 通过 Git Push（自动触发）

如果已推送代码到 GitHub，Vercel 会自动触发部署。

### 步骤 2: 验证修复

部署完成后，检查 Vercel 函数日志：

1. 进入 **Deployments** → 最新部署 → **Functions**
2. 查找以下日志（表示修复成功）：

```
[DB] Connecting to: aws-1-us-east-1.pooler.supabase.com:6543
[DB] Using pooler: ✅
[DB] Has pgbouncer: ✅
[DB] Correct user format: ✅  ← 这个应该显示 ✅
```

如果仍然显示 `❌`，说明环境变量可能未正确更新，请运行：

```bash
VERCEL_TOKEN=your-token pnpm tsx scripts/verify-and-fix-database-url.ts
```

### 步骤 3: 测试 Signin 功能

部署完成后，测试登录功能是否正常工作。

## 验证脚本

如果仍有问题，运行验证脚本：

```bash
# 设置 Vercel Token
export VERCEL_TOKEN=rF4aDNj4aTRotWfhKQAzVNQd

# 运行验证和修复脚本
pnpm tsx scripts/verify-and-fix-database-url.ts
```

## 关键信息

- **项目 ID:** `prj_oCjiDqkxdVfFnSeKfbqjmdZ9c3uF`
- **正确的 DATABASE_URL 格式:**
  ```
  postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
  ```
- **用户名格式:** `postgres.vkafrwwskupsyibrvcvd`（不是 `postgres`）

## 如果重新部署后仍有问题

1. **检查环境变量是否已更新**
   - Vercel Dashboard → Settings → Environment Variables
   - 确认 `DATABASE_URL` 的值（虽然已加密，但可以确认是否存在）

2. **查看详细的错误日志**
   - Vercel Dashboard → Deployments → Functions
   - 查找 `[DB]` 开头的日志

3. **运行诊断脚本**
   ```bash
   pnpm tsx scripts/diagnose-vercel-db-issue.ts
   ```

4. **检查 Supabase 项目状态**
   - 登录 [Supabase Dashboard](https://app.supabase.com)
   - 确认项目状态为 Active（不是 Paused）

## 时间线

- ✅ 2026-01-XX: 已更新 DATABASE_URL 用户名格式
- ⏳ **现在：需要重新部署**
- ⏳ 部署后：验证修复是否成功

---

**重要：** 请立即重新部署项目，否则修复不会生效！
