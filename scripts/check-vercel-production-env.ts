/**
 * 检查 Vercel 生产环境的环境变量
 * 专门检查 production 环境的配置，确保部署后能正常工作
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
  console.error('❌ 错误: VERCEL_TOKEN 环境变量未设置');
  process.exit(1);
}

const VERCEL_API_URL = 'https://api.vercel.com';
const PROJECT_NAME = 'shipany-digital-heirloom';

// Signin 功能必需的关键变量
const CRITICAL_VARS = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'AUTH_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
];

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

async function main() {
  console.log('🔍 检查 Vercel 生产环境配置...\n');

  const projectId = await getProjectId(PROJECT_NAME);
  if (!projectId) {
    console.error(`❌ 未找到项目: ${PROJECT_NAME}`);
    process.exit(1);
  }

  const envVars = await getEnvVars(projectId);
  
  console.log(`📋 检查 Production 环境的关键变量:\n`);
  
  const issues: string[] = [];
  const warnings: string[] = [];
  
  for (const key of CRITICAL_VARS) {
    const vars = envVars.filter((e: any) => e.key === key);
    const productionVars = vars.filter((e: any) => 
      Array.isArray(e.target) && e.target.includes('production')
    );
    
    if (productionVars.length === 0) {
      issues.push(`❌ ${key}: 未在 Production 环境中设置`);
      console.log(`  ❌ ${key}: 未在 Production 环境中设置`);
    } else {
      const prodVar = productionVars[0];
      const value = prodVar.value || '';
      
      // 特殊检查 DATABASE_URL
      if (key === 'DATABASE_URL') {
        // Vercel 会加密敏感变量，所以值可能是加密后的字符串
        const isEncrypted = !value.startsWith('postgres://');
        
        if (isEncrypted) {
          console.log(`  ✅ ${key}: 已设置（已加密）`);
          console.log(`     ⚠️  无法直接验证格式，但已使用连接池 URL 设置`);
        } else {
          // 如果未加密，检查格式
          const isValid = value.includes('pooler') && 
                         value.includes(':6543') && 
                         value.includes('pgbouncer=true');
          if (isValid) {
            console.log(`  ✅ ${key}: 已设置（连接池 URL 格式正确）`);
          } else {
            warnings.push(`${key}: 格式可能不正确（应使用连接池 URL，端口 6543）`);
            console.log(`  ⚠️  ${key}: 已设置但格式可能不正确`);
            console.log(`     当前值: ${value.substring(0, 80)}...`);
          }
        }
      } else if (key === 'AUTH_SECRET') {
        if (value && value.length > 20) {
          console.log(`  ✅ ${key}: 已设置（${value.substring(0, 10)}...）`);
        } else {
          warnings.push(`${key}: 值可能无效（长度不足）`);
          console.log(`  ⚠️  ${key}: 已设置但可能无效`);
        }
      } else {
        console.log(`  ✅ ${key}: 已设置`);
      }
    }
  }
  
  // 检查错误的变量名
  console.log('\n🔍 检查错误的变量名...\n');
  const wrongVars = envVars.filter((e: any) => 
    e.key.includes('digital_heirloom') && e.key.startsWith('NEXT_PUBLIC_')
  );
  
  if (wrongVars.length > 0) {
    console.log(`  ⚠️  发现 ${wrongVars.length} 个错误的变量名:`);
    wrongVars.forEach((v: any) => {
      console.log(`     - ${v.key} (${v.target?.join(', ') || 'unknown'})`);
      issues.push(`错误的变量名: ${v.key}`);
    });
  } else {
    console.log(`  ✅ 未发现错误的变量名`);
  }
  
  // 总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 检查总结');
  console.log('='.repeat(60));
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ 所有关键环境变量都已正确设置！');
    console.log('\n💡 如果仍有连接问题，请检查：');
    console.log('   1. Supabase 项目状态（是否 Active）');
    console.log('   2. 数据库表是否已创建（user, config, session）');
    console.log('   3. DATABASE_URL 中的密码是否正确');
    console.log('   4. Vercel 函数日志中的详细错误信息');
  } else {
    if (issues.length > 0) {
      console.log(`\n❌ 发现 ${issues.length} 个问题:`);
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    if (warnings.length > 0) {
      console.log(`\n⚠️  发现 ${warnings.length} 个警告:`);
      warnings.forEach(warning => console.log(`   ${warning}`));
    }
    console.log('\n💡 建议运行修复脚本:');
    console.log('   VERCEL_TOKEN=your-token pnpm tsx scripts/fix-all-vercel-env-issues.ts');
  }
  
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
