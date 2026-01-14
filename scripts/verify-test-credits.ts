/**
 * Verify Test Credits
 * 
 * This script verifies the credits balance for specified users.
 * 
 * Usage:
 *   npx tsx scripts/verify-test-credits.ts
 */

import { eq } from 'drizzle-orm';
import { db } from '@/core/db';
import { user } from '@/config/db/schema';
import { getRemainingCredits } from '@/shared/models/credit';

async function verifyTestCredits() {
  console.log('üîç Verifying test credits...\n');

  const testEmails = [
    'xiongjp_fr@163.com',
    'xiongjp_fr@hotmail.com',
  ];

  try {
    for (const email of testEmails) {
      console.log(`\nüìß Checking user: ${email}`);

      const [foundUser] = await db()
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (!foundUser) {
        console.log(`   ‚ö†Ô∏è  User not found: ${email}`);
        continue;
      }

      const remainingCredits = await getRemainingCredits(foundUser.id);
      
      console.log(`   ‚ú?User: ${foundUser.name || 'N/A'} (${foundUser.id})`);
      console.log(`   üí∞ Remaining Credits: ${remainingCredits}`);
    }

    console.log('\n‚ú?Verification completed!');
  } catch (error: any) {
    console.error('\n‚ù?Error verifying credits:', error);
    process.exit(1);
  }
}

verifyTestCredits()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n‚ù?Script failed:', error);
    process.exit(1);
  });

