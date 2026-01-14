/**
 * 全面修复 Vercel 环境变量问题
 * 删除错误的变量名，确保所有必需变量正确设置
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
  console.error('�?错误: VERCEL_TOKEN 环境变量未设�?);
  process.exit(1);
}

const VERCEL_API_URL = 'https://api.vercel.com';
const PROJECT_NAME = 'digital-heirloom-c';

// 需要删除的错误变量�?
const WRONG_VAR_NAMES = [
  'NEXT_PUBLIC_digital_heirloomSUPABASE_ANON_KEY',
  'NEXT_PUBLIC_digital_heirloomSUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_digital_heirloomSUPABASE_URL',
];

// 必需的环境变�?
const REQUIRED_VARS: Record<string, string> = {
  DATABASE_URL: 'postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
  NEXT_PUBLIC_SUPABASE_URL: 'https://vkafrwwskupsyibrvcvd.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDE0NTcsImV4cCI6MjA4MzUxNzQ1N30.mpur4h25R891qzycu9A38QIveUCHMigEM3yPLx8EmMg',
  SUPABASE_URL: 'https://vkafrwwskupsyibrvcvd.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk0MTQ1NywiZXhwIjoyMDgzNTE3NDU3fQ.g-zsgOAF5R8w5IQQWUbrGohyfbN1opZWYBDjlq-hgE8',
  AUTH_URL: 'https://www.digitalheirloom.app',
  NEXT_PUBLIC_APP_URL: 'https://www.digitalheirloom.app',
};

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

async function getEnvVars(projectId: string): Promise<any[]> {
  try {
    const response = await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/env`, {
      headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` },
    });
    const data = await response.json();
    return data.envs || [];
  } catch (error) {
    console.error('�?获取环境变量失败:', error);
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
        type: key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'encrypted',
        target: targets,
      }),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔧 全面修复 Vercel 环境变量问题...\n');

  const projectId = await getProjectId(PROJECT_NAME);
  if (!projectId) {
    console.error(`�?未找到项�? ${PROJECT_NAME}`);
    process.exit(1);
  }

  console.log(`�?找到项目 ID: ${projectId}\n`);

  const envVars = await getEnvVars(projectId);
  console.log(`📋 找到 ${envVars.length} 个环境变量\n`);

  // 1. 删除错误的变量名
  console.log('🗑�? 删除错误的变量名...\n');
  let deletedCount = 0;
  for (const wrongName of WRONG_VAR_NAMES) {
    const wrongVars = envVars.filter((e: any) => e.key === wrongName);
    if (wrongVars.length > 0) {
      console.log(`  �?发现错误的变量名: ${wrongName} (${wrongVars.length} �?`);
      for (const envVar of wrongVars) {
        const deleted = await deleteEnvVar(projectId, envVar.id);
        if (deleted) {
          console.log(`  �?已删�? ${wrongName} (${envVar.target?.join(', ') || 'unknown'})`);
          deletedCount++;
        }
      }
    }
  }
  if (deletedCount > 0) {
    console.log(`\n�?已删�?${deletedCount} 个错误的变量\n`);
  } else {
    console.log('�?未发现错误的变量名\n');
  }

  // 2. 检查并设置必需变量
  console.log('🔍 检查必需的环境变�?..\n');
  const targets = ['production', 'preview', 'development'];
  let fixedCount = 0;

  for (const [key, value] of Object.entries(REQUIRED_VARS)) {
    const existingVars = envVars.filter((e: any) => e.key === key);
    
    if (existingVars.length === 0) {
      console.log(`  �?缺失: ${key}`);
      console.log(`  📝 设置 ${key}...`);
      const success = await setEnvVar(projectId, key, value, targets);
      if (success) {
        console.log(`  �?${key} 设置成功\n`);
        fixedCount++;
      } else {
        console.log(`  �?${key} 设置失败\n`);
      }
    } else {
      // 检查是否在所有环境中都存�?
      const existingTargets = existingVars.flatMap((e: any) => e.target || []);
      const missingTargets = targets.filter(t => !existingTargets.includes(t));
      
      if (missingTargets.length > 0) {
        console.log(`  ⚠️  ${key}: 缺少环境 ${missingTargets.join(', ')}`);
        console.log(`  📝 补充设置...`);
        const success = await setEnvVar(projectId, key, value, missingTargets);
        if (success) {
          console.log(`  �?${key} 补充成功\n`);
          fixedCount++;
        }
      } else {
        console.log(`  �?${key}: 已设置\n`);
      }
    }
  }

  // 3. 特别处理 DATABASE_URL - 确保使用连接�?URL
  console.log('🔍 特别检�?DATABASE_URL...\n');
  const dbUrlVars = envVars.filter((e: any) => e.key === 'DATABASE_URL');
  if (dbUrlVars.length > 0) {
    const productionVar = dbUrlVars.find((e: any) => e.target?.includes('production'));
    if (productionVar) {
      const currentValue = productionVar.value || '';
      // 如果值被加密，我们无法检查，但可以确保使用正确的值更�?
      if (!currentValue.startsWith('postgres://') || 
          !currentValue.includes('pooler') || 
          !currentValue.includes(':6543') || 
          !currentValue.includes('pgbouncer=true')) {
        console.log(`  ⚠️  DATABASE_URL 格式可能不正确，将更新为连接�?URL`);
        // 删除旧的并设置新�?
        for (const envVar of dbUrlVars) {
          await deleteEnvVar(projectId, envVar.id);
        }
        const success = await setEnvVar(projectId, 'DATABASE_URL', REQUIRED_VARS.DATABASE_URL, targets);
        if (success) {
          console.log(`  �?DATABASE_URL 已更新为连接�?URL\n`);
          fixedCount++;
        }
      } else {
        console.log(`  �?DATABASE_URL 格式正确\n`);
      }
    }
  } else {
    console.log(`  �?DATABASE_URL 未设置，将创�?..`);
    const success = await setEnvVar(projectId, 'DATABASE_URL', REQUIRED_VARS.DATABASE_URL, targets);
    if (success) {
      console.log(`  �?DATABASE_URL 设置成功\n`);
      fixedCount++;
    }
  }

  // 4. 总结
  console.log('='.repeat(60));
  console.log('📊 修复总结');
  console.log('='.repeat(60));
  console.log(`�?已删除错误变�? ${deletedCount} 个`);
  console.log(`�?已修�?设置变量: ${fixedCount} 个`);
  console.log('\n💡 建议：重新部署项目以使环境变量生�?);
  console.log('   vercel --prod 或通过 Vercel Dashboard 触发部署\n');
}

main().catch(console.error);
