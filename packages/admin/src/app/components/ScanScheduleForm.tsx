"use client";

import { useState, useEffect } from "react";
import { scanStorage, type ScanSettings } from "@/lib/storage";
import { saveScheduledScan } from "../api/actions";

const PERIOD_OPTIONS = [
  { value: '5min', label: 'Every 5 minutes' },
  { value: '15min', label: 'Every 15 minutes' },
  { value: '30min', label: 'Every 30 minutes' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

export default function ScanScheduleForm() {
  const [url, setUrl] = useState('');
  const [period, setPeriod] = useState<ScanSettings['period']>('daily');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<ScanSettings | null>(null);

  // Load existing settings on mount
  useEffect(() => {
    setMounted(true);
    const settings = scanStorage.get();
    setCurrentSettings(settings);
    if (settings) {
      setUrl(settings.url);
      setPeriod(settings.period);
    }
  }, []);

  const validateUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    // Validate URL
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'Please enter a website URL' });
      setIsLoading(false);
      return;
    }

    if (!validateUrl(url)) {
      setMessage({ type: 'error', text: 'Please enter a valid URL (must start with http:// or https://)' });
      setIsLoading(false);
      return;
    }

    try {
      // Save to localStorage for UI display
      const settings: ScanSettings = {
        url,
        period,
        enabled: true,
      };
      scanStorage.set(settings);
      setCurrentSettings(settings);

      // Create/update Trigger.dev schedule (always enabled)
      const result = await saveScheduledScan(url, period, true);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `✅ Schedule created! Website will be scanned ${PERIOD_OPTIONS.find(o => o.value === period)?.label.toLowerCase()}`
        });
      } else {
        setMessage({
          type: 'error',
          text: `Failed to create schedule: ${result.error}`
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Schedule Website Scan</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.google.de"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
            disabled={isLoading}
          />
        </div>

        {/* Period Select */}
        <div>
          <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
            Scan Frequency
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as ScanSettings['period'])}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
            disabled={isLoading}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            ℹ️ When you save, Trigger.dev will schedule your website scan to run {PERIOD_OPTIONS.find(o => o.value === period)?.label.toLowerCase()} in the background.
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </form>

      {/* Current Settings Display */}
      {mounted && currentSettings && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Settings</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">URL:</span> {currentSettings.url}</p>
            <p><span className="font-medium">Frequency:</span> {PERIOD_OPTIONS.find(o => o.value === currentSettings.period)?.label}</p>
            <p><span className="font-medium">Status:</span> ✅ Active</p>
          </div>
        </div>
      )}
    </div>
  );
}