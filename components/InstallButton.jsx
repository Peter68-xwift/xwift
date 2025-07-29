"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
  };

  // Don't show if already installed or no prompt availabl
  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      className="fixed bottom-32 right-4 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      aria-label="Install Swift Investment App"
    >
      <Smartphone className="h-6 w-6" />
    </Button>
  );
}