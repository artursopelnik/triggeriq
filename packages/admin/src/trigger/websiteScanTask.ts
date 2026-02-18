import { tasks } from "@trigger.dev/sdk";

/**
 * Triggers a one-time website scan task
 */
export async function websiteScanTask(url: string) {
  try {
    const handle = await tasks.trigger(
      "website-scan",
      { url }
    );

    return { handle };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to trigger website scan",
    };
  }
}