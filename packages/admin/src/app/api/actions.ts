"use server";

import { websiteScanTask } from "@/trigger/websiteScanTask";
import { saveScheduledScan, type PeriodType } from "@/trigger/websiteScanScheduledTask";

export { websiteScanTask, saveScheduledScan };
export type { PeriodType };