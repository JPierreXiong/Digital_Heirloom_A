/**
 * 修复 DATABASE_URL 环境变量
 * 确保使用正确的连接池 URL（端口 6543，包含 pgbouncer=true）
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
  console.error('❌ 错误: VERCEL_TOKEN 环境变量未设置');
  process.exit(1);
}

const VERCEL_API_URL = 'https://api.vercel.com';
const PROJECT_NAME = 'shipany-digital-heirloom';

// 正确的 DATABASE_URL（连接池 URL）
// 使用用户提供的密码: tQbCJXRaLlABMRE6
// 格式: postgres://postgres.{PROJECT_REF}:{PASSWORD}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
const CORRECT_DATABASE_URL = 'postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true';

// 验证连接字符串格式
function validateDatabaseUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hasPooler = url.includes('pooler.supabase.com');
    const hasPort6543 = url.includes(':6543');
    const hasPgbouncer = url.includes('pgbouncer=true');
    const hasCorrectUser = url.includes('postgres.vkafrwwskupsyibrvcvd');
    
    return hasPooler && hasPort6543 && hasPgbouncer && hasCorrectUser;
  } catch {
    return false;
  }
}

async function getProjectId(projectName: string): Promise<string | null> {
  try {
    const response = await fetch(`${VERCEL_API_URL}/v9/projects`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
    });
    const data = await response.json();
    return data.projects?.find((p: any) => p.name === projectName)?.id || null;
  } catch (error) {
    console.error('❌ 获取项目 ID 失败:', error);
    return null;
  }
}

async function getEnvVars(projectId: string): Promise<any[]> {
  try {
    const response = await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/env`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
    });
    const data = await response.json();
    return data.envs || [];
  } catch (error) {
    console.error('❌ 获取环境变量失败:', error);
    return [];
  }
}

async function deleteEnvVar(projectId: string, envId: string): Promise<boolean> {
  try {
    const response = await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/env/${envId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
    });
    return response.ok;
  } catch (error) {
    console.error(`❌ 删除环境变量失败:`, error);
    return false;
  }
}

async function setEnvVar(projectId: string, key: string, value: string, targets: string[]): Promise<boolean> {
  try {
    const response = await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        value,
        type: 'encrypted', // DATABASE_URL 应该加密
        target: targets,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  ⚠️  设置失败: ${error}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ 设置环境变量失败:`, error);
    return false;
  }
}

async function main() {
  console.log('🔧 修复 DATABASE_URL 环境变量...\n');

  const projectId = await getProjectId(PROJECT_NAME);
  if (!projectId) {
    console.error(`❌ 未找到项目: ${PROJECT_NAME}`);
    process.exit(1);
  }

  console.log(`✅ 找到项目 ID: ${projectId}\n`);

  // 获取所有 DATABASE_URL 变量
  const envVars = await getEnvVars(projectId);
  const databaseUrlVars = envVars.filter((e: any) => e.key === 'DATABASE_URL');

  if (databaseUrlVars.length === 0) {
    console.log('❌ 未找到 DATABASE_URL 变量，将创建新的...\n');
  } else {
    console.log(`📋 找到 ${databaseUrlVars.length} 个 DATABASE_URL 变量\n`);
    
    // 删除所有现有的 DATABASE_URL 变量
    for (const envVar of databaseUrlVars) {
      console.log(`  🗑️  删除旧的 DATABASE_URL (${envVar.target?.join(', ') || 'unknown'})...`);
      const deleted = await deleteEnvVar(projectId, envVar.id);
      if (deleted) {
        console.log(`  ✅ 已删除`);
      } else {
        console.log(`  ❌ 删除失败`);
      }
    }
    console.log('');
  }

  // 验证连接字符串格式
  if (!validateDatabaseUrl(CORRECT_DATABASE_URL)) {
    console.error('❌ 错误: DATABASE_URL 格式不正确！');
    console.error('   应包含: pooler.supabase.com:6543, pgbouncer=true, postgres.vkafrwwskupsyibrvcvd');
    process.exit(1);
  }

  // 在所有环境中设置正确的 DATABASE_URL
  const targets = ['production', 'preview', 'development'];
  console.log(`📝 设置新的 DATABASE_URL（连接池 URL）...`);
  console.log(`   值: ${CORRECT_DATABASE_URL.substring(0, 80)}...`);
  console.log(`   环境: ${targets.join(', ')}`);
  console.log(`   ✅ 格式验证通过\n`);

  const success = await setEnvVar(projectId, 'DATABASE_URL', CORRECT_DATABASE_URL, targets);
  
  if (success) {
    console.log('✅ DATABASE_URL 已成功更新！\n');
    console.log('💡 重要提示：');
    console.log('   1. DATABASE_URL 现在使用连接池 URL（端口 6543）');
    console.log('   2. 包含 pgbouncer=true 参数');
    console.log('   3. 这将解决 "Tenant or user not found" 错误');
    console.log('   4. 请重新部署项目以使更改生效\n');
  } else {
    console.log('❌ DATABASE_URL 更新失败\n');
  }
}

main().catch(console.error);
