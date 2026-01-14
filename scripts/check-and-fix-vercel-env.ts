/**
 * 检查并修复 Vercel 环境变量脚本
 * 确保所有必需的环境变量都正确设置，特别是 signin 功能所需的变�?
 * 
 * 使用方法�?
 * VERCEL_TOKEN=your-token pnpm tsx scripts/check-and-fix-vercel-env.ts
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
  console.error('�?错误: VERCEL_TOKEN 环境变量未设�?);
  console.error('   请设置环境变�? VERCEL_TOKEN=your-token pnpm tsx scripts/check-and-fix-vercel-env.ts');
  process.exit(1);
}

const VERCEL_API_URL = 'https://api.vercel.com';
const PROJECT_NAME = 'digital-heirloom-c';

// Signin 功能必需的环境变�?
const REQUIRED_ENV_VARS = {
  // 数据库配置（最重要！）
  DATABASE_URL: {
    value: 'postgres://postgres.vkafrwwskupsyibrvcvd:tQbCJXRaLlABMRE6@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
    description: '数据库连�?URL（必须使用连接池 URL，端�?6543�?,
    critical: true,
    checkFormat: true, // 需要检查格�?
  },
  
  // 认证配置（Signin 必需�?
  AUTH_SECRET: {
    value: '', // 需要生�?
    description: '认证密钥（使�?openssl rand -base64 32 生成�?,
    critical: true,
    generate: true,
  },
  AUTH_URL: {
    value: 'https://www.digitalheirloom.app',
    description: '认证 URL',
    critical: true,
  },
  
  // Supabase 配置（Signin 必需�?
  NEXT_PUBLIC_SUPABASE_URL: {
    value: 'https://vkafrwwskupsyibrvcvd.supabase.co',
    description: 'Supabase 项目 URL',
    critical: true,
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDE0NTcsImV4cCI6MjA4MzUxNzQ1N30.mpur4h25R891qzycu9A38QIveUCHMigEM3yPLx8EmMg',
    description: 'Supabase 匿名密钥',
    critical: true,
  },
  SUPABASE_URL: {
    value: 'https://vkafrwwskupsyibrvcvd.supabase.co',
    description: 'Supabase 服务�?URL',
    critical: true,
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYWZyd3dza3Vwc3lpYnJ2Y3ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk0MTQ1NywiZXhwIjoyMDgzNTE3NDU3fQ.g-zsgOAF5R8w5IQQWUbrGohyfbN1opZWYBDjlq-hgE8',
    description: 'Supabase 服务端密�?,
    critical: true,
  },
  
  // 应用配置
  NEXT_PUBLIC_APP_URL: {
    value: 'https://www.digitalheirloom.app',
    description: '应用 URL',
    critical: true,
  },
  NEXT_PUBLIC_APP_NAME: {
    value: 'Digital Heirloom',
    description: '应用名称',
    critical: false,
  },
  
  // 数据库提供商
  DATABASE_PROVIDER: {
    value: 'postgresql',
    description: '数据库提供商',
    critical: false,
  },
  
  // Vercel Cron Secret（用于定时任务）
  VERCEL_CRON_SECRET: {
    value: 'super_secret_string_123',
    description: 'Vercel Cron Job 验证密钥',
    critical: false,
  },
};

// 需要删除的错误变量�?
const WRONG_VAR_NAMES = [
  'NEXT_PUBLIC_digital_heirloomSUPABASE_ANON_KEY',
  'NEXT_PUBLIC_digital_heirloomSUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_digital_heirloomSUPABASE_URL',
];

async function getProjectId(projectName: string): Promise<string | null> {
  try {
    const response = await fetch(`${VERCEL_API_URL}/v9/projects`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`获取项目列表失败: ${response.statusText}`);
    }

    const data = await response.json();
    const project = data.projects?.find((p: any) => p.name === projectName);
    return project?.id || null;
  } catch (error) {
    console.error('�?获取项目 ID 失败:', error);
    return null;
  }
}

async function getEnvVars(projectId: string): Promise<Record<string, any[]>> {
  try {
    const response = await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/env`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`获取环境变量失败: ${response.statusText}`);
    }

    const envVars = await response.json();
    const envMap: Record<string, any[]> = {};
    
    envVars.envs?.forEach((env: any) => {
      if (!envMap[env.key]) {
        envMap[env.key] = [];
      }
      envMap[env.key].push(env);
    });

    return envMap;
  } catch (error) {
    console.error('�?获取环境变量失败:', error);
    return {};
  }
}

async function deleteEnvVar(projectId: string, envId: string): Promise<boolean> {
  try {
    const response = await fetch(`${VERCEL_API_URL}/v9/projects/${projectId}/env/${envId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error(`�?删除环境变量失败:`, error);
    return false;
  }
}

async function setEnvVar(
  projectId: string,
  key: string,
  value: string,
  environments: string[] = ['production', 'preview', 'development']
): Promise<boolean> {
  try {
    for (const env of environments) {
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
          target: [env], // Vercel API requires target as array
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`  ⚠️  设置 ${key} (${env}) 失败: ${error}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`�?设置环境变量失败:`, error);
    return false;
  }
}

async function generateAuthSecret(): Promise<string> {
  // 生成一个随机的 base64 字符�?
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

async function main() {
  console.log('🔍 检�?Vercel 环境变量...\n');

  // 1. 获取项目 ID
  console.log(`📦 查找项目: ${PROJECT_NAME}`);
  const projectId = await getProjectId(PROJECT_NAME);
  if (!projectId) {
    console.error(`�?未找到项�? ${PROJECT_NAME}`);
    console.error('   请检查项目名称是否正�?);
    process.exit(1);
  }
  console.log(`�?找到项目 ID: ${projectId}\n`);

  // 2. 获取当前环境变量
  console.log('📋 获取当前环境变量...');
  const currentEnvVars = await getEnvVars(projectId);
  console.log(`�?找到 ${Object.keys(currentEnvVars).length} 个环境变量\n`);

  // 3. 检查并删除错误的变量名
  console.log('🗑�? 检查错误的变量�?..');
  let deletedCount = 0;
  for (const wrongName of WRONG_VAR_NAMES) {
    if (currentEnvVars[wrongName]) {
      console.log(`  �?发现错误的变量名: ${wrongName}`);
      for (const envVar of currentEnvVars[wrongName]) {
        const deleted = await deleteEnvVar(projectId, envVar.id);
        if (deleted) {
          console.log(`  �?已删�? ${wrongName} (${envVar.target})`);
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

  // 4. 检查必需变量
  console.log('🔍 检查必需的环境变�?..\n');
  const missing: string[] = [];
  const incorrect: Array<{ key: string; current: string; expected: string }> = [];

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const envVars = currentEnvVars[key] || [];
    
    if (envVars.length === 0) {
      missing.push(key);
      console.log(`  �?缺失: ${key} - ${config.description}`);
    } else {
      // 检查值是否正�?
      const productionVar = envVars.find((e: any) => e.target === 'production');
      if (productionVar) {
        let expectedValue = config.value;
        
        // 如果�?AUTH_SECRET 且为空，生成一�?
        if (key === 'AUTH_SECRET' && !expectedValue) {
          expectedValue = await generateAuthSecret();
          console.log(`  ⚠️  ${key}: 将生成新的密钥`);
        }
        
        // 对于 DATABASE_URL，检查格式是否正�?
        const config = REQUIRED_ENV_VARS[key as keyof typeof REQUIRED_ENV_VARS];
        if (config.checkFormat && key === 'DATABASE_URL') {
          const currentValue = productionVar.value || '';
          // Vercel 会加密敏感变量，所以值可能是加密后的字符�?
          // 如果值看起来是加密的（不�?postgres:// 开头），我们需要更新它
          if (!currentValue.startsWith('postgres://') || 
              !currentValue.includes('pooler') || 
              !currentValue.includes(':6543') || 
              !currentValue.includes('pgbouncer=true')) {
            incorrect.push({
              key,
              current: currentValue.substring(0, 50) + '...',
              expected: expectedValue.substring(0, 50) + '...',
            });
            console.log(`  ⚠️  格式错误或已加密: ${key}`);
            console.log(`     当前�? ${currentValue.substring(0, 80)}...`);
            console.log(`     将更新为正确的连接池 URL`);
          } else {
            console.log(`  �?${key}: 格式正确`);
          }
        } else {
          console.log(`  �?${key}: 已设置`);
        }
      }
    }
  }

  // 5. 修复缺失和错误的变量
  console.log('\n🔧 开始修复环境变�?..\n');
  
  let fixedCount = 0;
  
  // 修复缺失的变�?
  for (const key of missing) {
    const config = REQUIRED_ENV_VARS[key as keyof typeof REQUIRED_ENV_VARS];
    let value = config.value;
    
    // 如果�?AUTH_SECRET 且需要生�?
    if (key === 'AUTH_SECRET' && config.generate) {
      value = await generateAuthSecret();
      console.log(`  🔑 生成新的 AUTH_SECRET: ${value.substring(0, 20)}...`);
    }
    
    console.log(`  📝 设置 ${key}...`);
    const success = await setEnvVar(projectId, key, value);
    if (success) {
      console.log(`  �?${key} 设置成功`);
      fixedCount++;
    } else {
      console.log(`  �?${key} 设置失败`);
    }
  }
  
  // 修复格式错误�?DATABASE_URL
  for (const item of incorrect) {
    if (item.key === 'DATABASE_URL') {
      const config = REQUIRED_ENV_VARS.DATABASE_URL;
      console.log(`  📝 修复 ${item.key}...`);
      const success = await setEnvVar(projectId, item.key, config.value);
      if (success) {
        console.log(`  �?${item.key} 修复成功`);
        fixedCount++;
      } else {
        console.log(`  �?${item.key} 修复失败`);
      }
    }
  }

  // 6. 总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 修复总结');
  console.log('='.repeat(60));
  console.log(`�?已删除错误变�? ${deletedCount} 个`);
  console.log(`�?已修复缺�?错误变量: ${fixedCount} 个`);
  console.log(`�?仍需手动检�? ${missing.length - fixedCount} 个`);
  
  if (fixedCount > 0 || deletedCount > 0) {
    console.log('\n💡 建议：重新部署项目以使环境变量生�?);
    console.log('   vercel --prod 或通过 Vercel Dashboard 触发部署');
  }
  
  console.log('\n�?检查完成！\n');
}

main().catch(console.error);
