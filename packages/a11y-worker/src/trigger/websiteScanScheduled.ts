import { logger, schedules } from "@trigger.dev/sdk";

export const websiteScanScheduledTask = schedules.task({
  id: "website-scan-scheduled",

  run: async (payload: any, { ctx }) => {
    logger.log("Starting scheduled website scan task", { payload, ctx });

    // Get the URL from the payload.externalId (set when creating the schedule)
    const url: string = payload.externalId || "";

    logger.log("Starting scheduled website scan", {
      url,
      ctx
    });

    try {
      // Step 1: Fetch the website
      logger.log("Fetching website...", { url });
      const startTime = Date.now();

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'TriggerIQ-Scanner/1.0'
        }
      });

      const fetchTime = Date.now() - startTime;

      if (!response.ok) {
        logger.error("Failed to fetch website", {
          status: response.status,
          statusText: response.statusText
        });

        return {
          success: false,
          url: url,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
          scheduled: true,
        };
      }

      // Step 2: Get basic information
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      const html = await response.text();

      // Step 3: Basic analysis
      const analysis = {
        title: html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'No title found',
        metaDescription: html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || 'No description',
        hasH1: /<h1/i.test(html),
        imageCount: (html.match(/<img/gi) || []).length,
        linkCount: (html.match(/<a/gi) || []).length,
        scriptCount: (html.match(/<script/gi) || []).length,
        hasViewport: /<meta[^>]*name=["']viewport["']/i.test(html),
      };

      logger.log("Scheduled website scan completed", {
        url: url,
        fetchTime: `${fetchTime}ms`,
        analysis
      });

      return {
        success: true,
        url: url,
        timestamp: new Date().toISOString(),
        scheduled: true,
        performance: {
          fetchTime,
          contentLength: contentLength ? parseInt(contentLength) : html.length,
          contentType,
        },
        analysis,
        summary: `Scheduled scan of ${url} - Found ${analysis.imageCount} images, ${analysis.linkCount} links`,
      };

    } catch (error) {
      logger.error("Error during scheduled website scan", {
        url: url,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        url: url,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        scheduled: true,
      };
  }
}});