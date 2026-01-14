/**
 * Unified Cron Handler: 统一守卫任务
 * 每天 UTC 02:00 执行（北京时间 10:00）
 * 
 * 功能：按顺序执行三个核心任务
 * 1. Dead Man's Switch 检查（用户活跃度检测、资产释放、ShipAny 物流触发）
 * 2. 系统健康监控（业务指标异常检测）
 * 3. 成本监控（邮件、存储、物流成本监控）
 * 
 * 说明：
 * - 合并为单一 Cron 任务，符合 Vercel Hobby 计划限制（最多 2 个 Cron）
 * - 顺序执行确保逻辑正确：先检查用户状态，再监控系统健康，最后检查成本
 * - 对于数字遗产管理这种长周期场景，每天一次检查已足够
 * - 不改变 ShipAny 结构，保持原有调用方式
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  findVaultsNeedingWarning,
  findVaultsNeedingAssetRelease,
  updateDigitalVault,
  VaultStatus,
} from '@/shared/models/digital-vault';
import { getUuid } from '@/shared/lib/hash';
import {
  sendHeartbeatWarningEmail,
  sendHeartbeatReminderEmail,
  sendInheritanceNoticeEmail,
} from '@/shared/services/digital-heirloom/email-service';
import { logWarningSentEvent, logAssetsReleasedEvent } from '@/shared/models/dead-man-switch-event';
import { createLegacyAssetShipment } from '@/shared/services/shipany/shipment';
import { findBeneficiariesByVaultId } from '@/shared/models/beneficiary';
import { db } from '@/core/db';
import { shippingLogs, beneficiaries, digitalVaults, emailNotifications, systemAlerts } from '@/config/db/schema';
import { getUserByUserIds } from '@/shared/models/user';
import { eq, sql } from 'drizzle-orm';
import { getVaultPlanLevel } from '@/shared/lib/digital-heirloom-plan-limits';
import { respData, respErr } from '@/shared/lib/resp';
import { getEmailService } from '@/shared/services/email';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const overallResults = {
    task1_deadManSwitch: {
      warningsSent: 0,
      remindersSent: 0,
      triggersExecuted: 0,
      errors: [] as string[],
    },
    task2_systemHealth: {
      alertsFound: 0,
      criticalAlerts: 0,
      warningAlerts: 0,
      errors: [] as string[],
    },
    task3_costAlerts: {
      alertsFound: 0,
      criticalAlerts: 0,
      errors: [] as string[],
    },
  };

  try {
    // 验证请求来源（Vercel Cron Secret）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.VERCEL_CRON_SECRET || process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Unified Cron] Starting unified handler...');

    // ============================================
    // 任务 1: Dead Man's Switch 检查
    // ============================================
    console.log('[Unified Cron] ===== Task 1: Dead Man\'s Switch Check =====');
    try {
      await executeDeadManSwitchCheck(overallResults.task1_deadManSwitch);
    } catch (error: any) {
      console.error('[Unified Cron] Task 1 failed:', error);
      overallResults.task1_deadManSwitch.errors.push(`Task 1 fatal error: ${error.message}`);
    }

    // ============================================
    // 任务 2: 系统健康监控
    // ============================================
    console.log('[Unified Cron] ===== Task 2: System Health Check =====');
    try {
      await executeSystemHealthCheck(overallResults.task2_systemHealth);
    } catch (error: any) {
      console.error('[Unified Cron] Task 2 failed:', error);
      overallResults.task2_systemHealth.errors.push(`Task 2 fatal error: ${error.message}`);
    }

    // ============================================
    // 任务 3: 成本监控
    // ============================================
    console.log('[Unified Cron] ===== Task 3: Cost Alerts Check =====');
    try {
      await executeCostAlertsCheck(overallResults.task3_costAlerts);
    } catch (error: any) {
      console.error('[Unified Cron] Task 3 failed:', error);
      overallResults.task3_costAlerts.errors.push(`Task 3 fatal error: ${error.message}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[Unified Cron] All tasks completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      duration,
      timestamp: new Date().toISOString(),
      results: overallResults,
    });
  } catch (error: any) {
    console.error('[Unified Cron] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        results: overallResults,
      },
      { status: 500 }
    );
  }
}

// ============================================
// 任务 1: Dead Man's Switch 检查
// ============================================
async function executeDeadManSwitchCheck(results: {
  warningsSent: number;
  remindersSent: number;
  triggersExecuted: number;
  errors: string[];
}) {
  // 阶段 1: 发送预警邮件（ACTIVE -> PENDING_VERIFICATION）
  console.log('[Task 1] Scanning vaults needing warning...');
  const vaultsNeedingWarning = await findVaultsNeedingWarning();
  console.log(`[Task 1] Found ${vaultsNeedingWarning.length} vaults needing warning`);

  for (const vault of vaultsNeedingWarning) {
    try {
      const planLevel = await getVaultPlanLevel(vault.id);
      if (planLevel === 'free') {
        console.log(`[Task 1] Vault ${vault.id} is Free plan, skipping automated check`);
        continue;
      }

      if (vault.warningEmailCount && vault.warningEmailCount >= 3) {
        console.log(`[Task 1] Vault ${vault.id} already sent 3 warning emails, skipping`);
        continue;
      }

      if (vault.warningEmailSentAt) {
        const lastSent = new Date(vault.warningEmailSentAt);
        const hoursSinceLastSent = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSent < 24) {
          console.log(`[Task 1] Vault ${vault.id} sent warning email less than 24h ago, skipping`);
          continue;
        }
      }

      const verificationToken = getUuid();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const users = await getUserByUserIds([vault.userId]);
      const user = users[0];
      if (!user || !user.email) {
        console.error(`[Task 1] User ${vault.userId} not found or no email`);
        results.errors.push(`User ${vault.userId} not found`);
        continue;
      }

      const lastSeenDate = new Date(vault.lastSeenAt!);
      const daysSinceLastSeen = Math.floor(
        (Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const emailResult = await sendHeartbeatWarningEmail(
        vault.id,
        user.email,
        user.name || user.email,
        daysSinceLastSeen,
        vault.heartbeatFrequency || 90,
        vault.gracePeriod || 7,
        verificationToken,
        (user.language as any) || 'en'
      );

      if (emailResult.success) {
        await updateDigitalVault(vault.id, {
          status: VaultStatus.PENDING_VERIFICATION,
          verificationToken,
          verificationTokenExpiresAt: expiresAt,
          warningEmailSentAt: new Date(),
          warningEmailCount: (vault.warningEmailCount || 0) + 1,
        });

        await logWarningSentEvent(vault.id, {
          userId: vault.userId,
          emailSent: true,
          verificationToken,
        });

        results.warningsSent++;
        console.log(`[Task 1] Warning email sent for vault ${vault.id}`);
      } else {
        results.errors.push(`Failed to send warning email for vault ${vault.id}: ${emailResult.error}`);
      }
    } catch (error: any) {
      console.error(`[Task 1] Error processing vault ${vault.id}:`, error);
      results.errors.push(`Vault ${vault.id}: ${error.message}`);
    }
  }

  // 阶段 2: 发送二次提醒邮件（宽限期倒计时）
  console.log('[Task 1] Scanning vaults needing reminder...');
  const vaultsNeedingReminder = await findVaultsNeedingWarning();
  
  for (const vault of vaultsNeedingReminder) {
    try {
      if (!vault.lastSeenAt) continue;
      
      const lastSeenDate = new Date(vault.lastSeenAt);
      const heartbeatFrequencyDays = vault.heartbeatFrequency || 90;
      const gracePeriodDays = vault.gracePeriod || 7;
      
      const deadlineDate = new Date(
        lastSeenDate.getTime() + heartbeatFrequencyDays * 24 * 60 * 60 * 1000
      );
      const gracePeriodEndDate = new Date(
        deadlineDate.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000
      );
      
      const hoursRemaining = Math.floor(
        (gracePeriodEndDate.getTime() - Date.now()) / (1000 * 60 * 60)
      );
      
      if (hoursRemaining > 0 && hoursRemaining <= 24 && !vault.reminderEmailSentAt) {
        const users = await getUserByUserIds([vault.userId]);
        const user = users[0];
        if (!user || !user.email) continue;
        
        const daysSinceLastSeen = Math.floor(
          (Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const emailResult = await sendHeartbeatReminderEmail(
          vault.id,
          user.email,
          user.name || user.email,
          daysSinceLastSeen,
          hoursRemaining,
          vault.verificationToken || getUuid(),
          (user.language as any) || 'en'
        );
        
        if (emailResult.success) {
          await updateDigitalVault(vault.id, {
            reminderEmailSentAt: new Date(),
          });
          results.remindersSent++;
        }
      }
    } catch (error: any) {
      console.error(`[Task 1] Error sending reminder for vault ${vault.id}:`, error);
      results.errors.push(`Reminder ${vault.id}: ${error.message}`);
    }
  }

  // 阶段 3: 触发 Dead Man's Switch（PENDING_VERIFICATION -> TRIGGERED）
  console.log('[Task 1] Scanning vaults needing asset release...');
  const vaultsNeedingRelease = await findVaultsNeedingAssetRelease();
  console.log(`[Task 1] Found ${vaultsNeedingRelease.length} vaults needing release`);

  for (const vault of vaultsNeedingRelease) {
    try {
      const planLevel = await getVaultPlanLevel(vault.id);
      if (planLevel === 'free') {
        console.log(`[Task 1] Vault ${vault.id} is Free plan, skipping automated trigger`);
        continue;
      }

      await updateDigitalVault(vault.id, {
        status: VaultStatus.TRIGGERED,
        deadManSwitchActivatedAt: new Date(),
      });

      const beneficiariesList = await findBeneficiariesByVaultId(vault.id);
      if (beneficiariesList.length === 0) {
        console.warn(`[Task 1] Vault ${vault.id} has no beneficiaries`);
        results.errors.push(`Vault ${vault.id} has no beneficiaries`);
        continue;
      }

      const users = await getUserByUserIds([vault.userId]);
      const user = users[0];

      for (const beneficiary of beneficiariesList) {
        try {
          const releaseToken = getUuid();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 90);

          await db()
            .update(beneficiaries)
            .set({
              releaseToken,
              releaseTokenExpiresAt: expiresAt,
              status: 'notified',
            })
            .where(eq(beneficiaries.id, beneficiary.id));

          let shippingTrackingNumber: string | undefined;
          let shippingCarrier: string | undefined;

          const hasValidAddress =
            beneficiary.receiverName &&
            beneficiary.receiverName.trim() !== '' &&
            beneficiary.addressLine1 &&
            beneficiary.addressLine1.trim() !== '' &&
            beneficiary.city &&
            beneficiary.city.trim() !== '' &&
            beneficiary.zipCode &&
            beneficiary.zipCode.trim() !== '' &&
            beneficiary.countryCode &&
            beneficiary.countryCode.trim() !== '' &&
            beneficiary.phone &&
            beneficiary.phone.trim() !== '';

          if (hasValidAddress) {
            try {
              // ShipAny 调用保持不变，不改变 ShipAny 结构
              const shipmentResult = await createLegacyAssetShipment(
                beneficiary,
                beneficiary.physicalAssetDescription || 'Legacy Asset: Encrypted Recovery Kit'
              );

              shippingTrackingNumber = shipmentResult.tracking_number;
              shippingCarrier = shipmentResult.status;

              const shippingLogId = getUuid();
              await db()
                .insert(shippingLogs)
                .values({
                  id: shippingLogId,
                  vaultId: vault.id,
                  beneficiaryId: beneficiary.id,
                  receiverName: beneficiary.receiverName,
                  receiverPhone: beneficiary.phone,
                  addressLine1: beneficiary.addressLine1,
                  city: beneficiary.city,
                  zipCode: beneficiary.zipCode,
                  countryCode: beneficiary.countryCode,
                  trackingNumber: shippingTrackingNumber,
                  carrier: shippingCarrier,
                  status: 'shipped',
                  shippedAt: new Date(),
                });
            } catch (shipmentError: any) {
              console.error(`[Task 1] Failed to create shipment for beneficiary ${beneficiary.id}:`, shipmentError);
              results.errors.push(`Shipment ${beneficiary.id}: ${shipmentError.message}`);
            }
          } else {
            console.warn(`[Task 1] Beneficiary ${beneficiary.id} has incomplete address, skipping shipment`);
            results.errors.push(`Beneficiary ${beneficiary.id}: Incomplete address information`);
          }

          const emailResult = await sendInheritanceNoticeEmail(
            vault.id,
            beneficiary.email,
            beneficiary.name,
            user?.name || user?.email || 'Unknown',
            releaseToken,
            shippingTrackingNumber,
            shippingCarrier,
            (beneficiary.language as any) || 'en'
          );

          if (!emailResult.success) {
            results.errors.push(`Inheritance email ${beneficiary.id}: ${emailResult.error}`);
          }
        } catch (error: any) {
          console.error(`[Task 1] Error processing beneficiary ${beneficiary.id}:`, error);
          results.errors.push(`Beneficiary ${beneficiary.id}: ${error.message}`);
        }
      }

      await logAssetsReleasedEvent(vault.id, {
        userId: vault.userId,
        beneficiariesCount: beneficiariesList.length,
        timestamp: new Date().toISOString(),
      });

      results.triggersExecuted++;
      console.log(`[Task 1] Dead Man's Switch triggered for vault ${vault.id}`);
    } catch (error: any) {
      console.error(`[Task 1] Error triggering vault ${vault.id}:`, error);
      results.errors.push(`Trigger ${vault.id}: ${error.message}`);
    }
  }
}

// ============================================
// 任务 2: 系统健康监控
// ============================================
async function executeSystemHealthCheck(results: {
  alertsFound: number;
  criticalAlerts: number;
  warningAlerts: number;
  errors: string[];
}) {
  const alerts: Array<{
    level: 'info' | 'warning' | 'critical';
    type: 'business' | 'resource';
    category: string;
    message: string;
    data: any;
  }> = [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. 检查单日 TRIGGERED 状态用户异常激增
  const triggeredTodayResult = await db()
    .select({ count: sql<number>`count(*)` })
    .from(digitalVaults)
    .where(
      sql`${digitalVaults.status} = 'triggered' AND ${digitalVaults.deadManSwitchActivatedAt} >= ${today}`
    );
  
  const triggeredToday = Number(triggeredTodayResult[0]?.count || 0);
  const TRIGGERED_SPIKE_THRESHOLD = 50;

  if (triggeredToday > TRIGGERED_SPIKE_THRESHOLD) {
    alerts.push({
      level: 'critical',
      type: 'business',
      category: 'triggered_spike',
      message: `单日 TRIGGERED 状态用户异常激增：${triggeredToday} > ${TRIGGERED_SPIKE_THRESHOLD}`,
      data: {
        triggeredToday,
        threshold: TRIGGERED_SPIKE_THRESHOLD,
      },
    });
  }

  // 2. 检查邮件发送量和失败率
  const emailStatsResult = await db()
    .select({
      sentToday: sql<number>`count(*) filter (where ${emailNotifications.status} = 'sent' and ${emailNotifications.sentAt} >= ${today})`,
      failedToday: sql<number>`count(*) filter (where ${emailNotifications.status} = 'failed' and ${emailNotifications.sentAt} >= ${today})`,
      totalToday: sql<number>`count(*) filter (where ${emailNotifications.sentAt} >= ${today})`,
    })
    .from(emailNotifications);

  const emailStats = emailStatsResult[0] || {
    sentToday: 0,
    failedToday: 0,
    totalToday: 0,
  };

  const sentToday = Number(emailStats.sentToday || 0);
  const failedToday = Number(emailStats.failedToday || 0);
  const totalToday = Number(emailStats.totalToday || 0);
  const failureRate = totalToday > 0 ? failedToday / totalToday : 0;

  const EMAIL_DAILY_LIMIT = 1000;
  const EMAIL_FAILURE_RATE_THRESHOLD = 0.05;

  if (sentToday > EMAIL_DAILY_LIMIT) {
    alerts.push({
      level: 'critical',
      type: 'business',
      category: 'email_limit',
      message: `Resend 邮件发送量超过每日上限：${sentToday} > ${EMAIL_DAILY_LIMIT}`,
      data: {
        sentToday,
        threshold: EMAIL_DAILY_LIMIT,
      },
    });
  }

  if (failureRate > EMAIL_FAILURE_RATE_THRESHOLD) {
    alerts.push({
      level: 'warning',
      type: 'business',
      category: 'email_failure_rate',
      message: `邮件失败率超过阈值：${(failureRate * 100).toFixed(2)}% > ${(EMAIL_FAILURE_RATE_THRESHOLD * 100)}%`,
      data: {
        failureRate,
        failedToday,
        totalToday,
        threshold: EMAIL_FAILURE_RATE_THRESHOLD,
      },
    });
  }

  // 3. 记录报警到数据库
  if (alerts.length > 0) {
    for (const alert of alerts) {
      try {
        await db().insert(systemAlerts).values({
          id: getUuid(),
          level: alert.level,
          type: alert.type,
          category: alert.category,
          message: alert.message,
          alertData: alert.data,
          createdAt: now,
        });
      } catch (error: any) {
        console.error(`[Task 2] Failed to log alert (${alert.category}):`, error.message);
        results.errors.push(`Alert log ${alert.category}: ${error.message}`);
      }
    }
  }

  // 4. 发送通知（如果有严重报警）
  const criticalAlerts = alerts.filter(a => a.level === 'critical');
  if (criticalAlerts.length > 0) {
    await sendAlertNotifications(criticalAlerts, 'critical');
  }

  const warningAlerts = alerts.filter(a => a.level === 'warning');
  if (warningAlerts.length > 0) {
    await sendAlertNotifications(warningAlerts, 'warning');
  }

  results.alertsFound = alerts.length;
  results.criticalAlerts = criticalAlerts.length;
  results.warningAlerts = warningAlerts.length;
}

async function sendAlertNotifications(
  alerts: Array<{ level: string; category: string; message: string; data: any }>,
  severity: 'critical' | 'warning'
) {
  const alertMessages = alerts.map(alert => 
    `[${alert.level.toUpperCase()}] ${alert.category}\n${alert.message}\n数据: ${JSON.stringify(alert.data, null, 2)}`
  ).join('\n\n');

  const fullMessage = `[Digital Heirloom] 系统健康监控报警 - ${alerts.length} 个${severity === 'critical' ? '严重' : '警告'}问题\n\n${alertMessages}`;

  // 发送邮件
  try {
    const emailService = await getEmailService();
    const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL || 'admin@example.com';
    const subject = `[Digital Heirloom] ${severity === 'critical' ? '严重' : '警告'}报警 - ${alerts.length} 个问题`;
    const html = `
      <h2>系统健康监控报警</h2>
      <p>检测到以下${severity === 'critical' ? '严重' : '警告'}问题：</p>
      <ul>
        ${alerts.map(alert => `
          <li>
            <strong>[${alert.level.toUpperCase()}] ${alert.category}</strong><br>
            ${alert.message}<br>
            <pre>${JSON.stringify(alert.data, null, 2)}</pre>
          </li>
        `).join('')}
      </ul>
      <p>请及时处理。</p>
    `;

    await emailService.sendEmail({
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (error: any) {
    console.error('[Task 2] Failed to send alert email:', error.message);
  }

  // 发送到 Slack（如果配置）
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (SLACK_WEBHOOK_URL) {
    try {
      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullMessage,
          attachments: [{
            color: severity === 'critical' ? '#ff0000' : '#ffa500',
            text: '详情请登录 Admin Dashboard 查看',
            footer: 'Digital Heirloom Admin',
            ts: Math.floor(Date.now() / 1000),
          }],
        }),
      });
    } catch (error: any) {
      console.error('[Task 2] Failed to send Slack alert:', error.message);
    }
  }

  // 发送到 Telegram（如果配置）
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `🚨 *${severity.toUpperCase()} ALERT*\n\n${fullMessage}`,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error: any) {
      console.error('[Task 2] Failed to send Telegram alert:', error.message);
    }
  }
}

// ============================================
// 任务 3: 成本监控
// ============================================
async function executeCostAlertsCheck(results: {
  alertsFound: number;
  criticalAlerts: number;
  errors: string[];
}) {
  const alerts: Array<{
    level: 'info' | 'warning' | 'critical';
    type: 'email' | 'storage' | 'shipping';
    message: string;
    data: any;
  }> = [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate());

  // 1. 检查邮件发送量
  const emailStats = await db()
    .select({
      sentToday: sql<number>`count(*) filter (where ${emailNotifications.status} = 'sent' and ${emailNotifications.sentAt} >= ${today})`,
      sentThisWeek: sql<number>`count(*) filter (where ${emailNotifications.status} = 'sent' and ${emailNotifications.sentAt} >= ${weekAgo})`,
      sentThisMonth: sql<number>`count(*) filter (where ${emailNotifications.status} = 'sent' and ${emailNotifications.sentAt} >= ${monthAgo})`,
      failedToday: sql<number>`count(*) filter (where ${emailNotifications.status} = 'failed' and ${emailNotifications.sentAt} >= ${today})`,
    })
    .from(emailNotifications);

  const stats = emailStats[0] || {
    sentToday: 0,
    sentThisWeek: 0,
    sentThisMonth: 0,
    failedToday: 0,
  };

  const ALERT_THRESHOLDS = {
    email: {
      daily: 500,
      weekly: 3000,
      monthly: 10000,
      warning: 0.8,
      critical: 0.9,
    },
    storage: {
      percentage: 90,
    },
    shipping: {
      daily: 10,
    },
  };

  if (Number(stats.sentToday || 0) > ALERT_THRESHOLDS.email.daily) {
    alerts.push({
      level: 'critical',
      type: 'email',
      message: `今日邮件发送量超过阈值：${stats.sentToday} > ${ALERT_THRESHOLDS.email.daily}`,
      data: stats,
    });
  } else if (Number(stats.sentToday || 0) > ALERT_THRESHOLDS.email.daily * ALERT_THRESHOLDS.email.warning) {
    alerts.push({
      level: 'warning',
      type: 'email',
      message: `今日邮件发送量接近阈值：${stats.sentToday} / ${ALERT_THRESHOLDS.email.daily}`,
      data: stats,
    });
  }

  if (Number(stats.sentThisMonth || 0) > ALERT_THRESHOLDS.email.monthly * ALERT_THRESHOLDS.email.critical) {
    alerts.push({
      level: 'critical',
      type: 'email',
      message: `本月邮件发送量超过严重阈值：${stats.sentThisMonth} > ${ALERT_THRESHOLDS.email.monthly * ALERT_THRESHOLDS.email.critical}`,
      data: stats,
    });
  }

  // 2. 检查存储使用量
  const storageStats = await db()
    .select({
      totalSize: sql<number>`sum(length(${digitalVaults.encryptedData}))`,
      vaultCount: sql<number>`count(*)`,
    })
    .from(digitalVaults);

  const storage = storageStats[0] || { totalSize: 0, vaultCount: 0 };
  const totalSizeMB = Number(storage.totalSize || 0) / (1024 * 1024);
  const STORAGE_LIMIT_MB = 10 * 1024; // 10GB
  const storagePercentage = (totalSizeMB / STORAGE_LIMIT_MB) * 100;

  if (storagePercentage > ALERT_THRESHOLDS.storage.percentage) {
    alerts.push({
      level: 'critical',
      type: 'storage',
      message: `存储使用率超过阈值：${storagePercentage.toFixed(2)}% > ${ALERT_THRESHOLDS.storage.percentage}%`,
      data: {
        totalSizeMB,
        storagePercentage,
        vaultCount: storage.vaultCount,
      },
    });
  }

  // 3. 检查 ShipAny 物流订单
  const shippingStats = await db()
    .select({
      ordersToday: sql<number>`count(*) filter (where ${shippingLogs.createdAt} >= ${today})`,
      ordersThisWeek: sql<number>`count(*) filter (where ${shippingLogs.createdAt} >= ${weekAgo})`,
    })
    .from(shippingLogs);

  const shipping = shippingStats[0] || { ordersToday: 0, ordersThisWeek: 0 };

  if (Number(shipping.ordersToday || 0) > ALERT_THRESHOLDS.shipping.daily) {
    alerts.push({
      level: 'warning',
      type: 'shipping',
      message: `今日物流订单超过阈值：${shipping.ordersToday} > ${ALERT_THRESHOLDS.shipping.daily}`,
      data: shipping,
    });
  }

  // 4. 记录报警到数据库
  if (alerts.length > 0) {
    for (const alert of alerts) {
      try {
        await db().insert(systemAlerts).values({
          id: getUuid(),
          level: alert.level,
          type: 'cost',
          category: alert.type,
          message: alert.message,
          alertData: alert.data,
          createdAt: now,
        });
      } catch (error: any) {
        console.error(`[Task 3] Failed to log alert (${alert.type}):`, error.message);
        results.errors.push(`Alert log ${alert.type}: ${error.message}`);
      }
    }
  }

  // 5. 发送报警通知（如果有严重报警）
  const criticalAlerts = alerts.filter(a => a.level === 'critical');
  if (criticalAlerts.length > 0) {
    await sendCostAlertEmail(criticalAlerts);
  }

  results.alertsFound = alerts.length;
  results.criticalAlerts = criticalAlerts.length;
}

async function sendCostAlertEmail(alerts: Array<{ level: string; type: string; message: string; data: any }>) {
  const alertMessages = alerts.map(alert => 
    `[${alert.level.toUpperCase()}] ${alert.type}\n${alert.message}\n数据: ${JSON.stringify(alert.data, null, 2)}`
  ).join('\n\n');

  const fullMessage = `[Digital Heirloom] 成本监控报警 - ${alerts.length} 个严重问题\n\n${alertMessages}`;

  // 1. 发送邮件
  try {
    const emailService = await getEmailService();
    const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL || 'admin@example.com';
    const subject = `[Digital Heirloom] 成本监控报警 - ${alerts.length} 个严重问题`;
    const html = `
      <h2>成本监控报警</h2>
      <p>检测到以下严重问题：</p>
      <ul>
        ${alerts.map(alert => `
          <li>
            <strong>[${alert.level.toUpperCase()}] ${alert.type}</strong><br>
            ${alert.message}<br>
            <pre>${JSON.stringify(alert.data, null, 2)}</pre>
          </li>
        `).join('')}
      </ul>
      <p>请及时处理。</p>
    `;

    await emailService.sendEmail({
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (error: any) {
    console.error('[Task 3] Failed to send alert email:', error.message);
  }

  // 2. 发送到 Slack（如果配置）
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (SLACK_WEBHOOK_URL) {
    try {
      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullMessage,
          attachments: [{
            color: '#ff0000',
            text: '详情请登录 Admin Dashboard 查看',
            footer: 'Digital Heirloom Admin',
            ts: Math.floor(Date.now() / 1000),
          }],
        }),
      });
    } catch (error: any) {
      console.error('[Task 3] Failed to send Slack alert:', error.message);
    }
  }

  // 3. 发送到 Telegram（如果配置）
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `🚨 *CRITICAL ALERT*\n\n${fullMessage}`,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error: any) {
      console.error('[Task 3] Failed to send Telegram alert:', error.message);
    }
  }
}
