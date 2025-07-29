"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Smartphone, Share, Menu } from "lucide-react";

export default function ManualInstallButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  // Detect device type
  if (typeof window !== 'undefined') {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setIsIOS(true);
    } else if (/android/i.test(userAgent)) {
      setIsAndroid(true);
    }
  }

  const handleInstallClick = () => {
    // Try to trigger the install prompt
    if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
      // The browser will show the install prompt automatically
      console.log('Install prompt should appear');
    } else {
      // Show manual instructions
      setIsOpen(true);
    }
  };

  return (
    <>
      <Button onClick={handleInstallClick} variant="outline" className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Install App
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Install AI Zoo
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isIOS && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">For iPhone/iPad:</h3>
                <ol className="text-sm space-y-2 text-gray-600">
                  <li>
                    1. Tap the <Share className="inline h-4 w-4" /> Share button
                    in Safari
                  </li>
                  <li>2. Scroll down and tap "Add to Home Screen"</li>
                  <li>3. Tap "Add" to install the app</li>
                </ol>
              </div>
            )}

            {isAndroid && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">For Android:</h3>
                <ol className="text-sm space-y-2 text-gray-600">
                  <li>
                    1. Tap the <Menu className="inline h-4 w-4" /> Menu button
                    in Chrome
                  </li>
                  <li>2. Tap "Add to Home screen" or "Install app"</li>
                  <li>3. Tap "Add" or "Install" to confirm</li>
                </ol>
              </div>
            )}

            {!isIOS && !isAndroid && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">For Desktop:</h3>
                <p className="text-sm text-gray-600">
                  Look for the install icon in your browser's address bar or
                  menu.
                </p>
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 Tip: After installation, the app will appear on your home
                screen and work like a native mobile app!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}