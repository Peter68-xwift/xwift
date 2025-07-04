"use client";

import { useEffect, useState } from "react";

export default function MaintenancePage() {
  const [siteName, setSiteName] = useState("Our site");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success) {
          setSiteName(data.settings.siteName || "Our site");
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-100 flex items-center justify-center p-6">
      <div className="max-w-md text-center bg-white shadow-lg p-8 rounded-xl">
        <h1 className="text-3xl font-bold text-yellow-600 mb-4">
          We'll be back soon!
        </h1>
        <p className="text-gray-700 mb-4">
          <strong>{siteName}</strong> is currently undergoing maintenance.
        </p>
        <p className="text-sm text-gray-500">
          We’re working on updates to improve your experience. Please check back
          later.
        </p>
        {!loading && (
          <p className="mt-6 text-xs text-gray-400">
            Thank you for your patience
          </p>
        )}
      </div>
    </div>
  );
}
