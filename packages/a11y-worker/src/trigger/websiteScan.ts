import { logger, task } from "@trigger.dev/sdk";

export const websiteScanTask = task({
  id: "website-scan",
  maxDuration: 300, // 5 minutes max
  run: async (payload: { url: string }, { ctx }) => {
    logger.log("Starting website scan", { url: payload.url, ctx });

    try {
      // Step 1: Fetch the website
      logger.log("Fetching website...", { url: payload.url });
      const startTime = Date.now();3

      const response = await fetch(payload.url, {
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
          url: payload.url,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
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

      logger.log("Website scan completed", {
        url: payload.url,
        fetchTime: `${fetchTime}ms`,
        analysis
      });

      return {
        success: true,
        url: payload.url,
        timestamp: new Date().toISOString(),
        performance: {
          fetchTime,
          contentLength: contentLength ? parseInt(contentLength) : html.length,
          contentType,
        },
        analysis,
        summary: `Scanned ${payload.url} - Found ${analysis.imageCount} images, ${analysis.linkCount} links`,
      };

    } catch (error) {
      logger.error("Error during website scan", {
        url: payload.url,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        url: payload.url,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      };
    }
  },
});
