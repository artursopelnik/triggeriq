import { schedules } from "@trigger.dev/sdk";

/**
 * Note: The actual scheduled task is defined in packages/a11y/src/trigger/websiteScanScheduled.ts
 * This file only contains schedule management functions for the admin package.
 *
 * The admin package uses Trigger.dev SDK v3 beta which only supports creating schedules,
 * not defining scheduled tasks. Task definitions are handled by the a11y package (SDK v4).
 */

type PeriodType = '5min' | '15min' | '30min' | 'hourly' | 'daily' | 'weekly' | 'monthly';

/**
 * Converts a period type to a cron expression
 */
function periodToCron(period: PeriodType): string {
  switch (period) {
    case '5min':
      return '*/5 * * * *';  // Every 5 minutes
    case '15min':
      return '*/15 * * * *'; // Every 15 minutes
    case '30min':
      return '*/30 * * * *'; // Every 30 minutes
    case 'hourly':
      return '0 * * * *';    // Every hour
    case 'daily':
      return '0 0 * * *';    // Daily at midnight
    case 'weekly':
      return '0 0 * * 0';    // Weekly on Sunday at midnight
    case 'monthly':
      return '0 0 1 * *';    // Monthly on the 1st at midnight
    default:
      return '0 0 * * *';    // Default to daily
  }
}

/**
 * Creates, updates, or deletes a scheduled website scan
 */
export async function saveScheduledScan(url: string, period: PeriodType, enabled: boolean) {
  try {
    const scheduleId = 'website-scan-schedule';

    if (!enabled) {
      // Delete the schedule if disabled
      try {
        await schedules.del(scheduleId);
        return { success: true, message: 'Schedule disabled and removed' };
      } catch (error) {
        // Schedule might not exist, that's okay
        return { success: true, message: 'Schedule disabled' };
      }
    }

    // Create or update the schedule using the SDK
    // Note: The URL is passed via externalId, which the scheduled task can access via payload.externalId
    const schedule = await schedules.create({
      task: "website-scan-scheduled",
      cron: periodToCron(period),
      deduplicationKey: `scan-${url}`,
      externalId: url, // The scheduled task will receive this as payload.externalId
    });

    console.log('Schedule created:', {
      scheduleId,
      url,
      period,
      cron: periodToCron(period),
      schedule
    });

    return {
      success: true,
      message: 'Schedule created successfully',
      schedule
    };
  } catch (error) {
    console.error('Failed to create schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create schedule",
    };
  }
}

export type { PeriodType };