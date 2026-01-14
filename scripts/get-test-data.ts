/**
 * 获取测试数据脚本
 * 用于从数据库获取测试所需�?Vault ID �?Release Token
 * 
 * 使用方法�? * npx tsx scripts/get-test-data.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env.development') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/core/db';
import { digitalVaults, beneficiaries } from '@/config/db/schema';
import { eq, and, isNotNull, or, gt } from 'drizzle-orm';

async function getTestData() {
  console.log('🔍 正在从数据库获取测试数据...\n');

  try {
    // 1. 获取 Free 用户�?Vault ID
    console.log('1️⃣ 查找 Free 用户�?Vault...');
    const freeVaults = await db()
      .select({
        id: digitalVaults.id,
        planLevel: digitalVaults.planLevel,
        userId: digitalVaults.userId,
        currentPeriodEnd: digitalVaults.currentPeriodEnd,
      })
      .from(digitalVaults)
      .where(eq(digitalVaults.planLevel, 'free'))
      .limit(1);

    if (freeVaults.length > 0) {
      const vault = freeVaults[0];
      console.log('   �?找到 Free Vault:');
      console.log(`      ID: ${vault.id}`);
      console.log(`      计划等级: ${vault.planLevel}`);
      console.log(`      用户 ID: ${vault.userId}`);
      console.log(`      到期时间: ${vault.currentPeriodEnd || 'N/A'}\n`);

      // 2. 获取�?Vault 的受益人 Release Token
      console.log('2️⃣ 查找受益人的 Release Token...');
      const vaultBeneficiaries = await db()
        .select({
          id: beneficiaries.id,
          name: beneficiaries.name,
          email: beneficiaries.email,
          releaseToken: beneficiaries.releaseToken,
          releaseTokenExpiresAt: beneficiaries.releaseTokenExpiresAt,
          decryptionCount: beneficiaries.decryptionCount,
          decryptionLimit: beneficiaries.decryptionLimit,
        })
        .from(beneficiaries)
        .where(
          and(
            eq(beneficiaries.vaultId, vault.id),
            isNotNull(beneficiaries.releaseToken)
          )
        )
        .limit(1);

      if (vaultBeneficiaries.length > 0) {
        const beneficiary = vaultBeneficiaries[0];
        console.log('   �?找到受益�?');
        console.log(`      受益�?ID: ${beneficiary.id}`);
        console.log(`      姓名: ${beneficiary.name}`);
        console.log(`      邮箱: ${beneficiary.email}`);
        console.log(`      Release Token: ${beneficiary.releaseToken}`);
        console.log(`      Token 过期时间: ${beneficiary.releaseTokenExpiresAt || '永不过期'}`);
        console.log(`      解密次数: ${beneficiary.decryptionCount || 0} / ${beneficiary.decryptionLimit || 1}\n`);

        // 3. 输出 PowerShell 命令
        console.log('📋 请复制以下命令到 PowerShell 设置环境变量:\n');
        console.log(`$env:TEST_VAULT_ID="${vault.id}"`);
        console.log(`$env:TEST_RELEASE_TOKEN="${beneficiary.releaseToken}"\n`);

        // 4. 输出验证命令
        console.log('📋 验证环境变量:\n');
        console.log('echo "Vault ID: $env:TEST_VAULT_ID"');
        console.log('echo "Token: $env:TEST_RELEASE_TOKEN"\n');

        // 5. 输出运行测试命令
        console.log('📋 运行测试:\n');
        console.log('npx tsx scripts/test-phase-4-7.ts\n');

        return {
          vaultId: vault.id,
          releaseToken: beneficiary.releaseToken,
        };
      } else {
        console.log('   ⚠️  未找到有效的 Release Token');
        console.log('   💡 提示：需要先触发 Dead Man\'s Switch 或手动创建受益人并生�?Token\n');
      }
    } else {
      console.log('   ⚠️  未找�?Free 用户�?Vault');
      console.log('   💡 提示：需要先创建一�?Free 用户�?Vault\n');

      // 尝试查找任何 Vault
      console.log('3️⃣ 查找任何 Vault...');
      const anyVaults = await db()
        .select({
          id: digitalVaults.id,
          planLevel: digitalVaults.planLevel,
        })
        .from(digitalVaults)
        .limit(1);

      if (anyVaults.length > 0) {
        const vault = anyVaults[0];
        console.log(`   �?找到 Vault (计划: ${vault.planLevel}):`);
        console.log(`      ID: ${vault.id}\n`);
        console.log(`$env:TEST_VAULT_ID="${vault.id}"\n`);
      }
    }

    // 6. 查找任何有效�?Release Token
    console.log('4️⃣ 查找任何有效�?Release Token...');
    const anyBeneficiaries = await db()
      .select({
        id: beneficiaries.id,
        vaultId: beneficiaries.vaultId,
        name: beneficiaries.name,
        releaseToken: beneficiaries.releaseToken,
        releaseTokenExpiresAt: beneficiaries.releaseTokenExpiresAt,
      })
      .from(beneficiaries)
      .where(
        and(
          isNotNull(beneficiaries.releaseToken),
          or(
            eq(beneficiaries.releaseTokenExpiresAt, null),
            gt(beneficiaries.releaseTokenExpiresAt, new Date())
          )
        )
      )
      .limit(1);

    if (anyBeneficiaries.length > 0) {
      const beneficiary = anyBeneficiaries[0];
      console.log('   �?找到有效�?Release Token:');
      console.log(`      受益�?ID: ${beneficiary.id}`);
      console.log(`      Vault ID: ${beneficiary.vaultId}`);
      console.log(`      姓名: ${beneficiary.name}`);
      console.log(`      Release Token: ${beneficiary.releaseToken}\n`);
      console.log(`$env:TEST_RELEASE_TOKEN="${beneficiary.releaseToken}"\n`);
    } else {
      console.log('   ⚠️  未找到有效的 Release Token\n');
    }

  } catch (error: any) {
    console.error('�?获取测试数据失败:', error.message);
    console.error('   堆栈:', error.stack);
    process.exit(1);
  }
}

// 运行
getTestData()
  .then(() => {
    console.log('�?测试数据获取完成�?);
  })
  .catch(console.error);
