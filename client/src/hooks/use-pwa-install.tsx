import { useState, useEffect } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Detect iOS
  useEffect(() => {
    // Check if the user is on iOS
    const iosDeviceRegex = /iPad|iPhone|iPod/;
    if (iosDeviceRegex.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches) {
      setIsIOS(true);
      // iOS doesn't support beforeinstallprompt, but we can show install instructions
      setIsInstallable(true);
    }
  }, []);

  // Save the install prompt event when it occurs (for non-iOS devices)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Update UI to show install button
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Function to prompt user to install the app
  const promptInstall = async () => {
    // For iOS, show instructions instead of programmatic install
    if (isIOS) {
      alert('To install GrowWise on your iOS device: \n\n1. Tap the Share button in Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the upper-right corner');
      return;
    }

    if (!installPrompt) {
      console.log('No installation prompt available');
      return;
    }

    // Show the installation prompt
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;

    // Reset the deferred prompt variable, since prompt() can only be called once
    setInstallPrompt(null);

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstallable(false);
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  return { isInstallable, promptInstall, isIOS };
}