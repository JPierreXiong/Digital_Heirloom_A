/**
 * 测试 Supabase 数据库连�?
 * 使用提供的环境变量测试连接是否正�?
 */

import postgres from 'postgres';

// 从用户提供的环境变量构建连接字符�?
const SUPABASE_PROJECT_REF = 'vkafrwwskupsyibrvcvd';
const SUPABASE_PASSWORD = 'tQbCJXRaLlABMRE6';
const SUPABASE_USER = `postgres.${SUPABASE_PROJECT_REF}`;

// 测试不同的连接字符串格式
const connectionStrings = {
  // 连接�?URL（推荐用�?Vercel�?
  pooler: `postgres://${SUPABASE_USER}:${SUPABASE_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`,
  
  // 直接连接 URL（用于迁移和一次性操作）
  direct: `postgres://${SUPABASE_USER}:${SUPABASE_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`,
  
  // 使用 postgres 作为用户名（可能不正确）
  postgresOnly: `postgres://postgres:${SUPABASE_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`,
};

async function testConnection(name: string, url: string) {
  console.log(`\n🔍 测试连接: ${name}`);
  console.log(`   URL: ${url.replace(/:[^:@]+@/, ':****@')}`);
  
  try {
    const sql = postgres(url, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 5,
    });
    
    // 尝试执行简单查�?
    const result = await sql`SELECT version() as version, current_database() as database, current_user as user`;
    
    console.log(`   �?连接成功！`);
    console.log(`   - 数据�? ${result[0].database}`);
    console.log(`   - 用户: ${result[0].user}`);
    console.log(`   - PostgreSQL 版本: ${result[0].version.split(' ')[0]}`);
    
    // 测试查询 config �?
    try {
      const configResult = await sql`SELECT COUNT(*) as count FROM config`;
      console.log(`   �?config 表查询成�? ${configResult[0].count} 条记录`);
    } catch (e: any) {
      console.log(`   ⚠️  config 表查询失�? ${e.message}`);
    }
    
    // 测试查询 user �?
    try {
      const userResult = await sql`SELECT COUNT(*) as count FROM "user"`;
      console.log(`   �?user 表查询成�? ${userResult[0].count} 条记录`);
    } catch (e: any) {
      console.log(`   ⚠️  user 表查询失�? ${e.message}`);
    }
    
    await sql.end();
    return true;
  } catch (error: any) {
    console.log(`   �?连接失败: ${error.message}`);
    if (error.cause) {
      console.log(`   - 原因: ${error.cause}`);
    }
    if (error.code) {
      console.log(`   - 错误代码: ${error.code}`);
    }
    return false;
  }
}

async function main() {
  console.log('🔍 测试 Supabase 数据库连�?..\n');
  console.log('='.repeat(60));
  
  const results: Record<string, boolean> = {};
  
  // 测试连接�?URL
  results.pooler = await testConnection('连接�?URL (推荐)', connectionStrings.pooler);
  
  // 如果连接池失败，测试直接连接
  if (!results.pooler) {
    console.log('\n⚠️  连接�?URL 失败，尝试直接连�?..');
    results.direct = await testConnection('直接连接 URL', connectionStrings.direct);
  }
  
  // 如果都失败，测试使用 postgres 作为用户�?
  if (!results.pooler && !results.direct) {
    console.log('\n⚠️  标准连接失败，尝试使�?postgres 作为用户�?..');
    results.postgresOnly = await testConnection('postgres 用户�?, connectionStrings.postgresOnly);
  }
  
  // 总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试总结');
  console.log('='.repeat(60));
  
  if (results.pooler) {
    console.log('\n�?推荐使用连接�?URL（已测试成功�?);
    console.log(`\n�?Vercel 中设�?DATABASE_URL �?`);
    console.log(connectionStrings.pooler);
  } else if (results.direct) {
    console.log('\n⚠️  连接�?URL 失败，但直接连接成功');
    console.log('注意：直接连接不适合 Vercel 生产环境，可能导致连接数超限');
    console.log(`\n临时解决方案：在 Vercel 中使用直接连�?URL:`);
    console.log(connectionStrings.direct);
  } else if (results.postgresOnly) {
    console.log('\n⚠️  标准连接失败，但使用 postgres 用户名成�?);
    console.log('这可能意味着 Supabase 项目配置有问�?);
  } else {
    console.log('\n�?所有连接测试都失败了！');
    console.log('\n可能的原因：');
    console.log('1. Supabase 项目密码已更�?);
    console.log('2. Supabase 项目被暂停或删除');
    console.log('3. 项目引用 ID 不正�?);
    console.log('4. 网络连接问题');
    console.log('\n建议�?);
    console.log('1. 登录 Supabase Dashboard 检查项目状�?);
    console.log('2. �?Settings �?Database 中重新生成连接字符串');
    console.log('3. 确认密码是否正确');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(console.error);
