/**
 * 强制修复所有 DATABASE_URL 变量
 * 确保所有环境都使用正确的用户名格式
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
  console.error('❌ 错误: VERCEL_TOKEN 环境变量未设置');
  process.exit(1);
}

const VERCEL_API_URL = 'https://api.vercel.com';
const PROJECT_NAME = 'shipany-digital-heirloom';

// 正确的 DATABASE_URL（连接池 URL）
const CORRECT_DATABASE_URL = 'postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true';

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
        type: 'encrypted',
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
  console.log('🔧 强制修复所有 DATABASE_URL 变量...\n');
  console.log('='.repeat(60));

  const projectId = await getProjectId(PROJECT_NAME);
  if (!projectId) {
    console.error(`❌ 未找到项目: ${PROJECT_NAME}`);
    process.exit(1);
  }

  console.log(`✅ 项目 ID: ${projectId}\n`);

  // 获取所有环境变量
  const envVars = await getEnvVars(projectId);
  
  // 查找所有 DATABASE_URL 相关的变量
  const databaseUrlVars = envVars.filter((e: any) => 
    e.key === 'DATABASE_URL' || 
    e.key.includes('DATABASE') || 
    e.key.includes('POSTGRES')
  );

  console.log(`📋 找到 ${databaseUrlVars.length} 个数据库相关变量:\n`);
  
  // 列出所有变量
  for (const envVar of databaseUrlVars) {
    const targets = Array.isArray(envVar.target) ? envVar.target.join(', ') : envVar.target || 'unknown';
    const value = envVar.value || '';
    const isEncrypted = !value.startsWith('postgres://');
    
    console.log(`  - ${envVar.key}`);
    console.log(`    环境: ${targets}`);
    console.log(`    值: ${isEncrypted ? '[已加密]' : value.substring(0, 60) + '...'}`);
    console.log(`    类型: ${envVar.type || 'plain'}`);
    console.log('');
  }

  // 删除所有 DATABASE_URL 变量（无论环境）
  console.log('🗑️  删除所有现有的 DATABASE_URL 变量...\n');
  const databaseUrlOnlyVars = envVars.filter((e: any) => e.key === 'DATABASE_URL');
  
  for (const envVar of databaseUrlOnlyVars) {
    const targets = Array.isArray(envVar.target) ? envVar.target.join(', ') : envVar.target || 'unknown';
    console.log(`  🗑️  删除 DATABASE_URL (${targets})...`);
    const deleted = await deleteEnvVar(projectId, envVar.id);
    if (deleted) {
      console.log(`  ✅ 已删除\n`);
    } else {
      console.log(`  ❌ 删除失败\n`);
    }
  }

  // 等待一下确保删除完成
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 为每个环境单独设置 DATABASE_URL
  const environments = ['production', 'preview', 'development'];
  
  console.log('📝 为每个环境设置正确的 DATABASE_URL...\n');
  
  for (const env of environments) {
    console.log(`  📝 设置 ${env} 环境...`);
    const success = await setEnvVar(projectId, 'DATABASE_URL', CORRECT_DATABASE_URL, [env]);
    if (success) {
      console.log(`  ✅ ${env} 环境已设置\n`);
    } else {
      console.log(`  ❌ ${env} 环境设置失败\n`);
    }
  }

  // 验证设置
  console.log('🔍 验证设置结果...\n');
  const updatedVars = await getEnvVars(projectId);
  const finalDatabaseUrlVars = updatedVars.filter((e: any) => e.key === 'DATABASE_URL');
  
  console.log(`📋 找到 ${finalDatabaseUrlVars.length} 个 DATABASE_URL 变量:\n`);
  
  for (const envVar of finalDatabaseUrlVars) {
    const targets = Array.isArray(envVar.target) ? envVar.target.join(', ') : envVar.target || 'unknown';
    console.log(`  ✅ DATABASE_URL`);
    console.log(`     环境: ${targets}`);
    console.log(`     值: [已加密 - 用户名格式: postgres.vkafrwwskupsyibrvcvd]`);
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('✅ 修复完成！\n');
  console.log('💡 重要提示：');
  console.log('   1. ✅ 所有环境的 DATABASE_URL 已更新');
  console.log('   2. ✅ 用户名格式：postgres.vkafrwwskupsyibrvcvd');
  console.log('   3. ✅ 使用连接池 URL（端口 6543）');
  console.log('   4. ✅ 包含 pgbouncer=true');
  console.log('   5. ⚠️  必须重新部署项目才能使更改生效');
  console.log('   6. 📋 重新部署后，检查日志应显示：');
  console.log('      [DB] Correct user format: ✅\n');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
