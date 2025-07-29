"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Add meta tags for PWA
    const addMetaTags = () => {
      // Check if meta tags already exist
      if (document.querySelector('meta[name="theme-color"]')) {
        return;
      }

      // Add theme-color meta tag
      const themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      themeColorMeta.content = '#2563eb';
      document.head.appendChild(themeColorMeta);

      // Add apple-mobile-web-app-capable meta tag
      const appleMeta = document.createElement('meta');
      appleMeta.name = 'apple-mobile-web-app-capable';
      appleMeta.content = 'yes';
      document.head.appendChild(appleMeta);

      // Add apple-mobile-web-app-status-bar-style meta tag
      const appleStatusBarMeta = document.createElement('meta');
      appleStatusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
      appleStatusBarMeta.content = 'default';
      document.head.appendChild(appleStatusBarMeta);

      // Add apple-touch-icon
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = '/logo.png';
      document.head.appendChild(appleTouchIcon);

      // Add manifest link if not already present
      if (!document.querySelector('link[rel="manifest"]')) {
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = '/manifest.json';
        document.head.appendChild(manifestLink);
      }
    };

    addMetaTags();
  }, []);

  return null; // This component doesn't render anything
}