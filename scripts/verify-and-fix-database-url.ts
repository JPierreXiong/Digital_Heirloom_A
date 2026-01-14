/**
 * 验证并修复 DATABASE_URL
 * 确保用户名格式正确：postgres.vkafrwwskupsyibrvcvd
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

// 验证连接字符串格式
function validateDatabaseUrl(url: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!url.includes('pooler.supabase.com')) {
    issues.push('缺少 pooler.supabase.com');
  }
  
  if (!url.includes(':6543')) {
    issues.push('端口不是 6543');
  }
  
  if (!url.includes('pgbouncer=true')) {
    issues.push('缺少 pgbouncer=true');
  }
  
  // 关键检查：用户名格式
  if (!url.includes('postgres.vkafrwwskupsyibrvcvd')) {
    if (url.includes('postgres://postgres@')) {
      issues.push('用户名格式错误：使用了 "postgres" 而不是 "postgres.vkafrwwskupsyibrvcvd"');
    } else {
      issues.push('用户名格式可能不正确');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
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
  console.log('🔍 验证并修复 DATABASE_URL...\n');

  // 验证正确的连接字符串格式
  const validation = validateDatabaseUrl(CORRECT_DATABASE_URL);
  if (!validation.valid) {
    console.error('❌ 正确的 DATABASE_URL 格式验证失败:');
    validation.issues.forEach(issue => console.error(`   - ${issue}`));
    process.exit(1);
  }
  console.log('✅ 正确的 DATABASE_URL 格式验证通过\n');

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
    
    // 检查每个变量的值（如果未加密）
    let needsUpdate = false;
    for (const envVar of databaseUrlVars) {
      const value = envVar.value || '';
      const isEncrypted = !value.startsWith('postgres://');
      
      if (isEncrypted) {
        console.log(`  📝 DATABASE_URL (${envVar.target?.join(', ') || 'unknown'}): 已加密，无法直接验证`);
        console.log(`     ⚠️  由于已加密，无法确认用户名格式是否正确`);
        console.log(`     💡 将强制更新以确保格式正确\n`);
        needsUpdate = true;
      } else {
        // 可以检查格式
        const validation = validateDatabaseUrl(value);
        if (!validation.valid) {
          console.log(`  ❌ DATABASE_URL (${envVar.target?.join(', ') || 'unknown'}): 格式不正确`);
          validation.issues.forEach(issue => console.log(`     - ${issue}`));
          needsUpdate = true;
        } else {
          console.log(`  ✅ DATABASE_URL (${envVar.target?.join(', ') || 'unknown'}): 格式正确`);
        }
      }
    }
    
    if (needsUpdate || databaseUrlVars.length > 0) {
      console.log('\n🗑️  删除所有现有的 DATABASE_URL 变量...');
      for (const envVar of databaseUrlVars) {
        console.log(`  🗑️  删除 DATABASE_URL (${envVar.target?.join(', ') || 'unknown'})...`);
        const deleted = await deleteEnvVar(projectId, envVar.id);
        if (deleted) {
          console.log(`  ✅ 已删除`);
        } else {
          console.log(`  ❌ 删除失败`);
        }
      }
      console.log('');
    }
  }

  // 在所有环境中设置正确的 DATABASE_URL
  const targets = ['production', 'preview', 'development'];
  console.log(`📝 设置新的 DATABASE_URL（连接池 URL，用户名格式正确）...`);
  console.log(`   值: ${CORRECT_DATABASE_URL.substring(0, 80)}...`);
  console.log(`   用户名: postgres.vkafrwwskupsyibrvcvd ✅`);
  console.log(`   端口: 6543 ✅`);
  console.log(`   pgbouncer: true ✅`);
  console.log(`   环境: ${targets.join(', ')}\n`);

  const success = await setEnvVar(projectId, 'DATABASE_URL', CORRECT_DATABASE_URL, targets);
  
  if (success) {
    console.log('✅ DATABASE_URL 已成功更新！\n');
    console.log('💡 重要提示：');
    console.log('   1. ✅ 用户名格式已更正：postgres.vkafrwwskupsyibrvcvd');
    console.log('   2. ✅ 使用连接池 URL（端口 6543）');
    console.log('   3. ✅ 包含 pgbouncer=true 参数');
    console.log('   4. ⚠️  必须重新部署项目才能使更改生效');
    console.log('   5. 📋 重新部署后，检查日志应显示：');
    console.log('      [DB] Correct user format: ✅\n');
  } else {
    console.log('❌ DATABASE_URL 更新失败\n');
    process.exit(1);
  }
}

main().catch(console.error);
