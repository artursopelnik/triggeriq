"use client";

import { useState } from "react";
import { websiteScanTask } from "./api/actions";
import ScanScheduleForm from "./components/ScanScheduleForm";

export default function Home() {
  const [manualUrl, setManualUrl] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const validateUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleManualTrigger = async () => {
    setTriggerMessage(null);

    if (!manualUrl.trim()) {
      setTriggerMessage({ type: 'error', text: 'Please enter a website URL' });
      return;
    }

    if (!validateUrl(manualUrl)) {
      setTriggerMessage({ type: 'error', text: 'Please enter a valid URL (must start with http:// or https://)' });
      return;
    }

    setIsTriggering(true);

    try {
      const result = await websiteScanTask(manualUrl);

      if (result.error) {
        setTriggerMessage({ type: 'error', text: `Failed to trigger scan: ${result.error}` });
      } else {
        setTriggerMessage({ type: 'success', text: '✅ Scan triggered successfully! Check the Trigger.dev console.' });
      }
    } catch (error) {
      setTriggerMessage({ type: 'error', text: 'Error triggering scan' });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TriggerIQ</h1>
          <p className="text-gray-600">Queue-based task triggering system</p>
        </div>

        {/* Side-by-side sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual Trigger Section */}
          <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Website Scan</h2>
            <p className="text-gray-600 mb-4">Trigger a one-time website scan without scheduling.</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="manualUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="text"
                  id="manualUrl"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://www.google.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900"
                  disabled={isTriggering}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualTrigger();
                    }
                  }}
                />
              </div>

              {triggerMessage && (
                <div
                  className={`p-4 rounded-md ${
                    triggerMessage.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {triggerMessage.text}
                </div>
              )}

              <button
                onClick={handleManualTrigger}
                disabled={isTriggering}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isTriggering ? 'Triggering...' : 'Trigger Scan Now'}
              </button>
            </div>
          </section>

          {/* Scan Schedule Form */}
          <section>
            <ScanScheduleForm />
          </section>
        </div>
      </div>
    </main>
  );
}
