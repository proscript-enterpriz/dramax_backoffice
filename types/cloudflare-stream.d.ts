declare global {
  interface CloudflareStreamPlayer {
    play(): Promise<void> | void;
    pause(): void;
    currentTime?: number;
    duration?: number;
    addEventListener(event: string, listener: (event: Event) => void): void;
    removeEventListener(event: string, listener: (event: Event) => void): void;
    destroy?: () => void;
  }

  interface Window {
    Stream?: (
      element: HTMLIFrameElement | HTMLVideoElement | HTMLElement,
    ) => CloudflareStreamPlayer;
  }
}

export {};
