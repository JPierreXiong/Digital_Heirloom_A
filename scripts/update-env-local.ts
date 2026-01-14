#!/usr/bin/env tsx
/**
 * 更新 .env.local 文件，包含所有必需�?API 密钥和配�? */
import { writeFileSync, existsSync, copyFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();
const envLocalPath = join(projectRoot, '.env.local');

console.log('🔧 更新 .env.local 文件...\n');

// 环境变量内容
const envContent = `# ============================================
# Digital Heirloom - 环境变量配置文件
# ============================================
# ⚠️ 警告: 此文件包含敏感信息，不要提交到版本控制系�?# ============================================

# ============================================
# 基础应用配置 (必需)
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Digital Heirloom
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_THEME=default
NEXT_PUBLIC_APPEARANCE=system
NEXT_PUBLIC_DEBUG=false

# ============================================
# 数据库配�?(必需)
# ============================================
DATABASE_URL=postgres://postgres.vkafrwwskupsyibrvcvd:lEuluFvxDT90QiFz@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL=postgres://postgres.vkafrwwskupsyibrvcvd:lEuluFvxDT90QiFz@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL_NON_POOLING=postgres://postgres.vkafrwwskupsyibrvcvd:lEuluFvxDT90QiFz@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_PRISMA_URL=postgres://postgres.vkafrwwskupsyibrvcvd:lEuluFvxDT90QiFz@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_HOST=db.vkafrwwskupsyibrvcvd.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=lEuluFvxDT90QiFz
POSTGRES_DATABASE=postgres
DATABASE_PROVIDER=postgresql

# ============================================
# 认证配置 (必需)
# ============================================
# ⚠️ 请生成一个新�?AUTH_SECRET: openssl rand -base64 32
AUTH_SECRET=your-auth-secret-key-here-generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000

# ============================================
# Supabase 配置 (Digital Heirloom 必需)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://vkafrwwskupsyibrvcvd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDE0NTcsImV4cCI6MjA4MzUxNzQ1N30.mpur4h25R891qzycu9A38QIveUCHMigEM3yPLx8EmMg
SUPABASE_URL=https://vkafrwwskupsyibrvcvd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDE0NTcsImV4cCI6MjA4MzUxNzQ1N30.mpur4h25R891qzycu9A38QIveUCHMigEM3yPLx8EmMg
SUPABASE_PUBLISHABLE_KEY=sb_publishable__cszF9OMQ8jEtXa449qMAg_bklhXid3
SUPABASE_SECRET_KEY=sb_secret_VZdxILehZtP8ugFbBOXI5g_4bAqGCYC
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk0MTQ1NywiZXhwIjoyMDgzNTE3NDU3fQ.g-zsgOAF5R8w5IQQWUbrGohyfbN1opZWYBDjlq-hgE8
SUPABASE_JWT_SECRET=fa1H/ULE6m2wpHTFqEfsQFm/MzWsGBf0qZHS9S93cnMoZaBYJIb0cCZuF+yWQb04s4g7NgCTrFJ4ey5aIAvRJg==

# ============================================
# ShipAny 配置 (物理资产寄�?- Pro 版功�?
# ============================================
SHIPANY_API_KEY=e50e2b3d-a412-4f90-95eb-aafc9837b9ea
SHIPANY_MERCHANDISE_ID=1955cf99-daf3-4587-a698-2c28ea9180cc
SHIPANY_API_URL=https://api.shipany.io/v1
SHIPANY_SENDER_NAME=Digital Heirloom Vault
SHIPANY_SENDER_PHONE=+852-xxxx-xxxx
SHIPANY_SENDER_EMAIL=noreply@afterglow.app
SHIPANY_SENDER_ADDRESS_LINE1=Your Warehouse Address
SHIPANY_SENDER_ADDRESS_LINE2=
SHIPANY_SENDER_CITY=Hong Kong
SHIPANY_SENDER_STATE=
SHIPANY_SENDER_ZIP_CODE=000000
SHIPANY_SENDER_COUNTRY_CODE=HKG

# ============================================
# 邮件配置 (死信开关通知)
# ============================================
# Resend API Key - XJP_product
RESEND_API_KEY=re_JrzLE2sa_HAe9ZVgzmszQ1iepVhRUS4Ci
RESEND_DEFAULT_FROM=security@afterglow.app

# ============================================
# 存储配置
# ============================================
# Vercel Blob 读写令牌
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_T1QruDd1XViT9FhM_y9TAKwEjlSRuuQXRo9B5vJKNyGulcJ
# 存储提供�? vercel-blob / supabase / r2 / s3
STORAGE_PROVIDER=supabase

# ============================================
# Vercel API Token (可�?- 用于脚本)
# ============================================
# 用于运行 Vercel 管理脚本（如设置环境变量�?# 获取地址: https://vercel.com/account/tokens
VERCEL_TOKEN=rF4aDNj4aTRotWfhKQAzVNQd

# ============================================
# 系统环境变量
# ============================================
NODE_ENV=development

# ============================================
# 注意事项
# ============================================
# 1. 所有包�?"NEXT_PUBLIC_" 前缀的变量会暴露给客户端
# 2. 敏感信息（如 API Keys、Secrets）不要使�?"NEXT_PUBLIC_" 前缀
# 3. SUPABASE_SERVICE_ROLE_KEY 仅在服务端使用，不要暴露给客户端
# 4. 生产环境请使用环境变量管理工具（�?Vercel Environment Variables�?# 5. 不要�?.env.local 文件提交到版本控制系�?# 6. 请生成一个新�?AUTH_SECRET: openssl rand -base64 32
`;

// 备份现有文件
if (existsSync(envLocalPath)) {
  const backupPath = `${envLocalPath}.backup.${Date.now()}`;
  copyFileSync(envLocalPath, backupPath);
  console.log(`�?已备份现有文件到: ${backupPath}`);
}

// 写入文件
writeFileSync(envLocalPath, envContent, 'utf-8');

console.log(`\n�?.env.local 文件已更�? ${envLocalPath}\n`);
console.log('⚠️  重要提示:');
console.log('   1. 请生成一个新�?AUTH_SECRET:');
console.log('      openssl rand -base64 32');
console.log('   2. 然后更新 .env.local 中的 AUTH_SECRET 值\n');
console.log('📋 已配置的 API 密钥:');
console.log('   �?ShipAny API Key');
console.log('   �?ShipAny Merchandise ID');
console.log('   �?Supabase 配置');
console.log('   �?Resend API Key');
console.log('   �?Vercel Blob Token\n');
