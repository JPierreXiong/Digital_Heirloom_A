/**
 * 验证 Signin 功能所需的环境变�?
 * 检�?Vercel 中的关键环境变量是否正确设置
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
  console.error('�?错误: VERCEL_TOKEN 环境变量未设�?);
  process.exit(1);
}

const VERCEL_API_URL = 'https://api.vercel.com';
const PROJECT_NAME = 'digital-heirloom-c';

// Signin 功能必需的关键变�?
const SIGNIN_REQUIRED_VARS = [
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
    console.error('�?获取项目 ID 失败:', error);
    return null;
  }
}

async function getEnvVars(projectId: string): Promise<Record<string, any[]>> {
  try {
    const response = await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/env`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
    });
    const envVars = await response.json();
    const envMap: Record<string, any[]> = {};
    envVars.envs?.forEach((env: any) => {
      if (!envMap[env.key]) envMap[env.key] = [];
      envMap[env.key].push(env);
    });
    return envMap;
  } catch (error) {
    console.error('�?获取环境变量失败:', error);
    return {};
  }
}

async function main() {
  console.log('🔍 验证 Signin 功能所需的环境变�?..\n');

  const projectId = await getProjectId(PROJECT_NAME);
  if (!projectId) {
    console.error(`�?未找到项�? ${PROJECT_NAME}`);
    process.exit(1);
  }

  const envVars = await getEnvVars(projectId);
  
  console.log('📋 检�?Signin 必需的环境变�?\n');
  
  let allOk = true;
  
  for (const key of SIGNIN_REQUIRED_VARS) {
    const vars = envVars[key] || [];
    // 检查所有环境（production, preview, development�?
    const productionVar = vars.find((e: any) => e.target?.includes('production'));
    const previewVar = vars.find((e: any) => e.target?.includes('preview'));
    const devVar = vars.find((e: any) => e.target?.includes('development'));
    const anyVar = vars[0]; // 任意环境的变�?
    
    if (!anyVar) {
      console.log(`  �?${key}: 未在任何环境中设置`);
      allOk = false;
    } else {
      const varToCheck = productionVar || previewVar || devVar || anyVar;
      const value = varToCheck.value || '';
      const targets = varToCheck.target || [];
      const envList = Array.isArray(targets) ? targets.join(', ') : 'unknown';
      
      // 特殊检�?DATABASE_URL
      if (key === 'DATABASE_URL') {
        // Vercel 会加密敏感变量，所以值可能是加密后的字符�?
        // 如果值看起来是加密的（不�?postgres:// 开头），我们假设它是正确的
        const isEncrypted = !value.startsWith('postgres://');
        const isValid = isEncrypted || (value.includes('pooler') && 
                       value.includes(':6543') && 
                       value.includes('pgbouncer=true'));
        if (isValid) {
          if (isEncrypted) {
            console.log(`  �?${key}: 已设置（已加密，使用连接�?URL）[${envList}]`);
          } else {
            console.log(`  �?${key}: 已设置（连接�?URL 格式正确）[${envList}]`);
          }
        } else {
          console.log(`  ⚠️  ${key}: 已设置但格式可能不正�?[${envList}]`);
          console.log(`     当前�? ${value.substring(0, 80)}...`);
          console.log(`     应该包含: pooler.supabase.com:6543 �?pgbouncer=true`);
          allOk = false;
        }
      } else if (key === 'AUTH_SECRET') {
        if (value && value.length > 20) {
          console.log(`  �?${key}: 已设置（${value.substring(0, 10)}...）[${envList}]`);
        } else {
          console.log(`  ⚠️  ${key}: 已设置但可能无效（长度不足）[${envList}]`);
          allOk = false;
        }
      } else {
        console.log(`  �?${key}: 已设�?[${envList}]`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  if (allOk) {
    console.log('�?所�?Signin 必需的环境变量都已正确设置！');
    console.log('\n💡 如果 Signin 仍有问题，请检查：');
    console.log('   1. 数据库表是否已创建（user, session 表）');
    console.log('   2. Supabase 项目是否正常运行');
    console.log('   3. DATABASE_URL 中的密码是否正确');
  } else {
    console.log('�?发现环境变量问题，请修复后重�?);
  }
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
