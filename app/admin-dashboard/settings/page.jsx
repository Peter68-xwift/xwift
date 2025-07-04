"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminSidebar from "../../../components/AdminSidebar";
import { Settings, Save, Shield, Bell, Database, Mail } from "lucide-react";

export default function AdminSettings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({
    key: "general",
    siteName: "Investment Platform",
    siteDescription: "Professional investment management platform",
    adminEmail: "admin@example.com",
    enableNotifications: true,
    enableRegistration: true,
    requireEmailVerification: false,
    maintenanceMode: false,
    minWithdrawalAmount: 100,
    maxWithdrawalAmount: 100000,
    platformFee: 2.5,
    mpesaNumber: "",
    mpesaName: "",
    logo: "", // 🆕 add this
  });
  

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
    if (!loading && user?.role === "admin") {
      fetchSettingsFromBackend();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const fetchSettingsFromBackend = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (data.success && data.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
        }));
      } else {
        console.warn("Failed to load settings from backend");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings), // includes enableRegistration
      });

      const data = await response.json();

      if (data.success) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSettings((prev) => ({
          ...prev,
          logo: data.url, // Set uploaded image URL
        }));
      } else {
        alert("Logo upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading logo.");
    }
  };
  

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6 bg-[#ffff00]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage platform configuration and preferences
            </p>
          </div>

          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) =>
                    handleInputChange("siteName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) =>
                    handleInputChange("siteDescription", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) =>
                    handleInputChange("adminEmail", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmail">Platform logo</Label>
                {settings.logo && (
                  <img
                    src={settings.logo}
                    alt="Logo Preview"
                    className="h-16 w-auto mb-2 rounded shadow"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Platform security and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable User Registration</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow new users to register accounts
                  </p>
                </div>
                <Switch
                  checked={settings.enableRegistration}
                  onCheckedChange={(checked) =>
                    handleInputChange("enableRegistration", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Users must verify email before accessing platform
                  </p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    handleInputChange("requireEmailVerification", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Temporarily disable platform access
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    handleInputChange("maintenanceMode", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Withdrawal Settings
              </CardTitle>
              <CardDescription>Configure withdrawal limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minWithdrawal">
                  Minimum Withdrawal Amount (Ksh)
                </Label>
                <Input
                  id="minWithdrawal"
                  type="number"
                  value={settings.minWithdrawalAmount}
                  onChange={(e) =>
                    handleInputChange(
                      "minWithdrawalAmount",
                      Number.parseInt(e.target.value)
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWithdrawal">
                  Maximum Withdrawal Amount (Ksh)
                </Label>
                <Input
                  id="maxWithdrawal"
                  type="number"
                  value={settings.maxWithdrawalAmount}
                  onChange={(e) =>
                    handleInputChange(
                      "maxWithdrawalAmount",
                      Number.parseInt(e.target.value)
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Admin Payment Settings
              </CardTitle>
              <CardDescription>
                Configure your Mpesa payment details
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mpesaName">Mpesa Name</Label>
                <Input
                  id="mpesaName"
                  value={settings.mpesaName}
                  onChange={(e) =>
                    handleInputChange("mpesaName", e.target.value)
                  }
                  placeholder="e.g. Kelvin Koech"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesaNumber">Mpesa Phone Number</Label>
                <Input
                  id="mpesaNumber"
                  value={settings.mpesaNumber}
                  onChange={(e) =>
                    handleInputChange("mpesaNumber", e.target.value)
                  }
                  placeholder="e.g. 0700123456"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
}
