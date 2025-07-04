"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  User,
  Mail,
  Phone,
  Lock,
  Link2,
} from "lucide-react";
import { toast } from "sonner";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referrerCode: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [settings, setSettings] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        setSettings(data.settings);
        // console.log(data.settings);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) return <p>Loading...</p>;

  // if (!settings?.enableRegistration) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
  //       <Card className="max-w-md w-full shadow-md">
  //         <CardHeader>
  //           <CardTitle className="text-center text-red-600">
  //             Registration Disabled
  //           </CardTitle>
  //         </CardHeader>
  //         <CardContent className="text-center space-y-4">
  //           <p className="text-gray-700">
  //             User registration is currently disabled. Please check back later.
  //           </p>
  //           <Link
  //             href="/"
  //             className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
  //           >
  //             Back to Home
  //           </Link>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Check username availability
    if (name === "username" && value.length >= 3) {
      checkUsernameAvailability(value);
    } else if (name === "username") {
      setUsernameStatus({ checking: false, available: null, message: "" });
    }
  };

  const checkUsernameAvailability = async (username) => {
    setUsernameStatus({ checking: true, available: null, message: "" });

    try {
      const response = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      setUsernameStatus({
        checking: false,
        available: data.available,
        message: data.message,
      });
    } catch (error) {
      setUsernameStatus({
        checking: false,
        available: null,
        message: "Error checking username",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    } else if (!usernameStatus.available) {
      newErrors.username = "Username is not available";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^[+]?[1-9][\d]{0,15}$/.test(
        formData.phone.replace(/[\s\-Ksh$Ksh$]/g, "")
      )
    ) {
      newErrors.phone = "Invalid phone number format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/auth/signup${ref ? `?ref=${ref}` : ""}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            username: formData.username.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),

            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to login with success message
        router.push("/?signup=success");
      } else {
        setErrors({ submit: data.error });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getUsernameStatusIcon = () => {
    if (usernameStatus.checking) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    }
    if (usernameStatus.available === true) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (usernameStatus.available === false) {
      return <X className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={settings?.logo} alt="Company logo" className="w-[40%] mx-auto rounded-full" />

          <CardTitle className="text-2xl font-bold mb-5">
            {settings?.siteName}
          </CardTitle>
          <CardTitle className="text-xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Sign up to get started with your investment journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`pl-10 ${errors.fullName ? "border-red-500" : ""}`}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a unique username"
                  className={`pl-10 pr-10 ${
                    errors.username
                      ? "border-red-500"
                      : usernameStatus.available === true
                      ? "border-green-500"
                      : ""
                  }`}
                />
                <div className="absolute right-3 top-3">
                  {getUsernameStatusIcon()}
                </div>
              </div>
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
              {usernameStatus.message && !errors.username && (
                <p
                  className={`text-sm ${
                    usernameStatus.available ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {usernameStatus.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className={`pl-10 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`pl-10 pr-10 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !usernameStatus.available}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
