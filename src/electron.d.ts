export {};

declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      send: (channel: string, ...args: unknown[]) => void;
      on: (channel: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
