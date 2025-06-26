"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MobileHeader from "../../../components/MobileHeader";
import BottomNavigation from "../../../components/BottomNavigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  Camera,
  RefreshCw,
  AlertCircle,
  Copy,
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    joinDate: "",
  });

  const [profileStats, setProfileStats] = useState([
    { label: "Total Invested", value: "Ksh0.00", icon: "💰" },
    { label: "Active Packages", value: "0", icon: "📦" },
    { label: "Referrals", value: "0", icon: "👥" },
    { label: "Member Since", value: "Recently", icon: "📅" },
  ]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "user")) {
      router.push("/");
    }
    if (user && user.role === "user") {
      fetchProfileData();
    }
  }, [user, loading, router]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const userId = user?.id; // ← replace this with the actual ID from auth context or state
      // const response = await fetch(`/api/user/dashboard?userId=${userId}`);

      const response = await fetch(`/api/user/profile?userId=${userId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        const { user: userData, stats } = data.data;
        console.log(userData);
        setProfileData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          referralLink: userData.referralLink,
          joinDate: userData.joinDate,
        });

        setProfileStats([
          { label: "Total Invested", value: stats.totalInvested, icon: "💰" },
          { label: "Active Packages", value: stats.activePackages, icon: "📦" },
          { label: "Referrals", value: stats.referrals, icon: "👥" },
          { label: "Member Since", value: stats.memberSince, icon: "📅" },
        ]);
      } else {
        setError(data.error || "Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const referralLink = profileData?.referralLink || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");
      const userId = user?.id;
      const response = await fetch(`/api/user/profile?userId=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEditing(false);
        setSuccessMessage("Profile updated successfully!");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    fetchProfileData();
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-blue-300 pb-20">
        <MobileHeader title="Profile" />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!user || user.role !== "user") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Profile" />

      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {successMessage && (
          <Card className="mb-4 border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-600">
                <div className="h-4 w-4 rounded-full bg-green-600 flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
                <p className="text-sm">{successMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                  variant="secondary"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {profileData.name}
              </h2>
              <p className="text-sm text-gray-500">{profileData.email}</p>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                size="sm"
                className="mt-3"
                disabled={isSaving}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <p className="text-sm font-medium">Referral Link:</p>

                <a
                  href={referralLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline break-all text-sm"
                >
                  {referralLink}
                </a>

                {referralLink && (
                  <button
                    onClick={handleCopy}
                    className="text-xs text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 transition flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Stats - Real Data */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {profileStats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className="pl-10"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setError("");
                    setSuccessMessage("");
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Security Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Notification Preferences
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
