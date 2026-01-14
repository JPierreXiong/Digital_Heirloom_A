# 🚨 紧急部署说明

## 当前状态

✅ **已修复：** Vercel 上的 `DATABASE_URL` 已更新为正确的用户名格式  
❌ **待执行：** 项目需要重新部署才能使更改生效

## 问题

虽然环境变量已更新，但 Vercel 上的运行实例仍在使用旧的环境变量。**必须重新部署才能加载新的环境变量。**

## 立即执行步骤

### 方法 1: 通过 Vercel Dashboard（最快）

1. **登录 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 登录您的账户

2. **选择项目**
   - 找到项目：`shipany-digital-heirloom`
   - 点击进入项目详情

3. **重新部署**
   - 点击顶部 **Deployments** 标签
   - 找到最新的部署（应该是最上面的）
   - 点击部署右侧的 **⋯** 菜单
   - 选择 **Redeploy**
   - 在确认对话框中点击 **Redeploy**

4. **等待部署完成**
   - 部署通常需要 2-5 分钟
   - 您会看到部署进度和日志

5. **验证修复**
   - 部署完成后，点击部署 → **Functions** 标签
   - 查找以下日志（表示修复成功）：
     ```
     [DB] Connecting to: aws-1-us-east-1.pooler.supabase.com:6543
     [DB] Using pooler: ✅
     [DB] Has pgbouncer: ✅
     [DB] Correct user format: ✅  ← 这个应该显示 ✅
     ```

### 方法 2: 通过 Git Push（自动触发）

如果您的项目已配置自动部署：

1. **确保代码已推送**
   ```bash
   git status  # 确认没有未提交的更改
   git push origin main  # 如果还没有推送
   ```

2. **等待自动部署**
   - Vercel 会自动检测到新的推送
   - 自动触发部署（如果已配置）

3. **验证部署**
   - 在 Vercel Dashboard 中查看新的部署
   - 检查函数日志验证修复

### 方法 3: 通过 Vercel CLI

如果您安装了 Vercel CLI：

```bash
# 登录（如果还没有）
vercel login

# 重新部署生产环境
vercel --prod

# 或重新部署预览环境
vercel
```

## 验证修复

部署完成后，请检查以下内容：

### 1. 检查函数日志

在 Vercel Dashboard → Deployments → 最新部署 → Functions：

**应该看到：**
```
[DB] Connecting to: aws-1-us-east-1.pooler.supabase.com:6543
[DB] Using pooler: ✅
[DB] Has pgbouncer: ✅
[DB] Correct user format: ✅  ← 关键：这个应该显示 ✅
```

**不应该看到：**
```
[DB] Correct user format: ❌
[DB] ❌ ERROR: DATABASE_URL user format is INCORRECT!
```

### 2. 测试 Signin 功能

部署完成后，测试登录功能是否正常工作：
- 访问您的网站
- 尝试登录
- 确认不再出现 "Tenant or user not found" 错误

### 3. 检查环境变量（可选）

在 Vercel Dashboard → Settings → Environment Variables：
- 确认 `DATABASE_URL` 存在
- 虽然值已加密，但可以确认变量存在

## 如果重新部署后仍有问题

### 步骤 1: 确认环境变量已更新

运行验证脚本：

```bash
VERCEL_TOKEN=rF4aDNj4aTRotWfhKQAzVNQd pnpm tsx scripts/force-fix-all-database-urls.ts
```

### 步骤 2: 检查是否有多个 DATABASE_URL

在 Vercel Dashboard → Settings → Environment Variables：
- 搜索 `DATABASE_URL`
- 确认每个环境（production, preview, development）都有一个变量
- 如果有重复的，删除旧的

### 步骤 3: 清除 Vercel 缓存

有时 Vercel 会缓存环境变量：

1. 在 Vercel Dashboard → Settings → General
2. 找到 **Clear Build Cache** 选项
3. 清除缓存后重新部署

### 步骤 4: 检查 Supabase 项目状态

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 确认项目状态为 **Active**（不是 Paused）
3. 确认项目引用 ID：`vkafrwwskupsyibrvcvd`

## 环境变量详情

### 正确的 DATABASE_URL 格式

```
postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

**关键点：**
- ✅ 用户名：`postgres.vkafrwwskupsyibrvcvd`（不是 `postgres`）
- ✅ 端口：`6543`（连接池端口）
- ✅ 参数：`pgbouncer=true`

### 当前设置

- ✅ Production 环境：已设置正确的 DATABASE_URL
- ✅ Preview 环境：已设置正确的 DATABASE_URL
- ✅ Development 环境：已设置正确的 DATABASE_URL

## 时间线

- ✅ **已完成：** 环境变量已更新（所有环境）
- ⏳ **待执行：** 重新部署项目（**必须立即执行**）
- ⏳ **部署后：** 验证修复是否成功

---

## ⚠️ 重要提醒

**环境变量更新后，必须重新部署才能生效！**

Vercel 不会自动重新加载环境变量。即使变量已更新，运行中的函数实例仍在使用旧的环境变量。

**请立即重新部署项目！**
