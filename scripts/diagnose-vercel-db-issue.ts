/**
 * 诊断 Vercel 上的数据库连接问题
 * 检查实际部署环境中的配置和可能的问题
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
  console.error('❌ 错误: VERCEL_TOKEN 环境变量未设置');
  process.exit(1);
}

const VERCEL_API_URL = 'https://api.vercel.com';
const PROJECT_NAME = 'shipany-digital-heirloom';

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

async function getDeployments(projectId: string): Promise<any[]> {
  try {
    const response = await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/deployments?limit=5`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
    });
    const data = await response.json();
    return data.deployments || [];
  } catch (error) {
    console.error('❌ 获取部署信息失败:', error);
    return [];
  }
}

async function main() {
  console.log('🔍 诊断 Vercel 生产环境数据库连接问题...\n');

  const projectId = await getProjectId(PROJECT_NAME);
  if (!projectId) {
    console.error(`❌ 未找到项目: ${PROJECT_NAME}`);
    process.exit(1);
  }

  console.log(`✅ 项目 ID: ${projectId}\n`);

  // 1. 检查环境变量
  console.log('📋 1. 检查 Production 环境变量...\n');
  const envVars = await getEnvVars(projectId);
  const productionVars = envVars.filter((e: any) => 
    Array.isArray(e.target) && e.target.includes('production')
  );

  const dbUrlVar = productionVars.find((e: any) => e.key === 'DATABASE_URL');
  if (dbUrlVar) {
    const value = dbUrlVar.value || '';
    const isEncrypted = !value.startsWith('postgres://');
    
    console.log(`  DATABASE_URL:`);
    console.log(`    状态: ${isEncrypted ? '已加密（正常）' : '未加密（可能有问题）'}`);
    
    if (!isEncrypted) {
      // 可以检查格式
      const hasPooler = value.includes('pooler');
      const hasPort6543 = value.includes(':6543');
      const hasPgbouncer = value.includes('pgbouncer=true');
      
      console.log(`    包含 pooler: ${hasPooler ? '✅' : '❌'}`);
      console.log(`    端口 6543: ${hasPort6543 ? '✅' : '❌'}`);
      console.log(`    pgbouncer=true: ${hasPgbouncer ? '✅' : '❌'}`);
      
      if (!hasPooler || !hasPort6543 || !hasPgbouncer) {
        console.log(`    ⚠️  格式不正确！应使用连接池 URL`);
      }
    } else {
      console.log(`    ✅ 已加密，无法直接检查格式`);
      console.log(`    💡 如果仍有问题，请确认使用的是连接池 URL（端口 6543）`);
    }
  } else {
    console.log(`  ❌ DATABASE_URL 未在 Production 环境中设置！`);
  }

  // 2. 检查最近的部署
  console.log('\n📋 2. 检查最近的部署...\n');
  const deployments = await getDeployments(projectId);
  if (deployments.length > 0) {
    const latest = deployments[0];
    console.log(`  最新部署:`);
    console.log(`    URL: ${latest.url || 'N/A'}`);
    console.log(`    状态: ${latest.readyState || 'N/A'}`);
    console.log(`    时间: ${latest.createdAt ? new Date(latest.createdAt).toLocaleString() : 'N/A'}`);
    
    if (latest.readyState === 'ERROR') {
      console.log(`    ⚠️  部署失败！请检查部署日志`);
    }
  }

  // 3. 检查其他关键变量
  console.log('\n📋 3. 检查其他关键变量...\n');
  const criticalVars = [
    'AUTH_SECRET',
    'AUTH_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  for (const key of criticalVars) {
    const var_ = productionVars.find((e: any) => e.key === key);
    if (var_) {
      console.log(`  ✅ ${key}: 已设置`);
    } else {
      console.log(`  ❌ ${key}: 未设置`);
    }
  }

  // 4. 诊断建议
  console.log('\n' + '='.repeat(60));
  console.log('🔧 诊断建议');
  console.log('='.repeat(60));
  
  console.log('\n如果仍然出现 "Tenant or user not found" 错误：');
  console.log('\n1. 检查 Supabase 项目：');
  console.log('   - 登录 https://app.supabase.com');
  console.log('   - 确认项目状态为 Active（不是 Paused）');
  console.log('   - 检查数据库是否正常运行');
  
  console.log('\n2. 验证 DATABASE_URL：');
  console.log('   - 在 Supabase Dashboard → Settings → Database');
  console.log('   - 选择 "Connection pooling" → "Transaction mode"');
  console.log('   - 复制连接字符串（应包含 pooler.supabase.com:6543）');
  console.log('   - 确认密码为: tQbCJXRaLlABMRE6');
  
  console.log('\n3. 检查数据库表：');
  console.log('   - 在 Supabase Dashboard → Table Editor');
  console.log('   - 确认以下表存在：user, config, session');
  console.log('   - 如果不存在，运行: pnpm db:push');
  
  console.log('\n4. 查看 Vercel 函数日志：');
  console.log('   - Vercel Dashboard → Deployments → 最新部署 → Functions');
  console.log('   - 查找 [DB Error] 或 [Config] 开头的日志');
  console.log('   - 查看详细的错误信息');
  
  console.log('\n5. 重新部署：');
  console.log('   - 在 Vercel Dashboard 中触发重新部署');
  console.log('   - 或运行: vercel --prod');
  
  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(console.error);
