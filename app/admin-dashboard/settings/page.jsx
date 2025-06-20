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
    siteName: "Investment Platform",
    siteDescription: "Professional investment management platform",
    adminEmail: "admin@example.com",
    enableNotifications: true,
    enableRegistration: true,
    requireEmailVerification: false,
    maintenanceMode: false,
    maxInvestmentAmount: 100000,
    minInvestmentAmount: 100,
    platformFee: 2.5,
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
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

  const handleSave = () => {
    // Save settings logic here
    console.log("Saving settings:", settings);
  };

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6">
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

          {/* Investment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Investment Settings
              </CardTitle>
              <CardDescription>Configure investment parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minInvestment">
                  Minimum Investment Amount ($)
                </Label>
                <Input
                  id="minInvestment"
                  type="number"
                  value={settings.minInvestmentAmount}
                  onChange={(e) =>
                    handleInputChange(
                      "minInvestmentAmount",
                      Number.parseInt(e.target.value)
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxInvestment">
                  Maximum Investment Amount ($)
                </Label>
                <Input
                  id="maxInvestment"
                  type="number"
                  value={settings.maxInvestmentAmount}
                  onChange={(e) =>
                    handleInputChange(
                      "maxInvestmentAmount",
                      Number.parseInt(e.target.value)
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformFee">Platform Fee (%)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  step="0.1"
                  value={settings.platformFee}
                  onChange={(e) =>
                    handleInputChange(
                      "platformFee",
                      Number.parseFloat(e.target.value)
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
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send system notifications to users
                  </p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) =>
                    handleInputChange("enableNotifications", checked)
                  }
                />
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Email Templates
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Welcome Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Investment Confirmation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Withdrawal Notification
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
}
