export interface ScanSettings {
  url: string;
  period: '5min' | '15min' | '30min' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
  // Note: lastRun and nextRun are managed by Trigger.dev server-side
  // These fields are only for UI display purposes
  lastRun?: string;
  nextRun?: string;
}

const STORAGE_KEY = 'website-scan-settings';

export const scanStorage = {
  get: (): ScanSettings | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load scan settings:', error);
      return null;
    }
  },

  set: (settings: ScanSettings): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save scan settings:', error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear scan settings:', error);
    }
  }
};