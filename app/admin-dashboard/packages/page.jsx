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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminSidebar from "../../../components/AdminSidebar";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function PackageManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const [newPackage, setNewPackage] = useState({
    name: "",
    price: "",
    duration: "",
    roi: "",
    description: "",
    features: "",
  });

  const [editPackage, setEditPackage] = useState({
    name: "",
    price: "",
    duration: "",
    roi: "",
    description: "",
    features: "",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchPackages();
    }
  }, [user]);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/packages");
      const data = await response.json();

      if (data.success) {
        setPackages(data.packages);
      } else {
        console.error("Failed to fetch packages:", data.message);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPackage = async () => {
    if (
      !newPackage.name ||
      !newPackage.price ||
      !newPackage.duration ||
      !newPackage.roi ||
      !newPackage.description
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/admin/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPackage),
      });

      const data = await response.json();

      if (data.success) {
        setPackages([data.package, ...packages]);
        setNewPackage({
          name: "",
          price: "",
          duration: "",
          roi: "",
          description: "",
          features: "",
        });
        setIsAddDialogOpen(false);
        alert("Package created successfully!");
      } else {
        alert(data.message || "Failed to create package");
      }
    } catch (error) {
      console.error("Error creating package:", error);
      alert("Failed to create package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPackage = async () => {
    if (
      !editPackage.name ||
      !editPackage.price ||
      !editPackage.duration ||
      !editPackage.roi ||
      !editPackage.description
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/admin/packages/${editingPackage._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editPackage),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update the package in the local state
        setPackages(
          packages.map((pkg) =>
            pkg._id === editingPackage._id
              ? {
                  ...pkg,
                  ...editPackage,
                  features:
                    typeof editPackage.features === "string"
                      ? editPackage.features.split(",").map((f) => f.trim())
                      : editPackage.features,
                }
              : pkg
          )
        );
        setIsEditDialogOpen(false);
        setEditingPackage(null);
        alert("Package updated successfully!");
      } else {
        alert(data.message || "Failed to update package");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      alert("Failed to update package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePackageAction = async (packageId, action) => {
    if (action === "delete") {
      if (!confirm("Are you sure you want to delete this package?")) {
        return;
      }

      try {
        const response = await fetch(`/api/admin/packages/${packageId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          setPackages(packages.filter((pkg) => pkg._id !== packageId));
          alert("Package deleted successfully!");
        } else {
          alert(data.message || "Failed to delete package");
        }
      } catch (error) {
        console.error("Error deleting package:", error);
        alert("Failed to delete package");
      }
    } else if (action === "activate" || action === "deactivate") {
      try {
        const newStatus = action === "activate" ? "active" : "inactive";
        const response = await fetch(`/api/admin/packages/${packageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();

        if (data.success) {
          setPackages(
            packages.map((pkg) =>
              pkg._id === packageId ? { ...pkg, status: newStatus } : pkg
            )
          );
          alert(`Package ${action}d successfully!`);
        } else {
          alert(data.message || `Failed to ${action} package`);
        }
      } catch (error) {
        console.error(`Error ${action}ing package:`, error);
        alert(`Failed to ${action} package`);
      }
    } else if (action === "edit") {
      const packageToEdit = packages.find((pkg) => pkg._id === packageId);
      // console.log(packageToEdit);
      if (packageToEdit) {
        setEditingPackage(packageToEdit);
        setEditPackage({
          name: packageToEdit.name,
          price: packageToEdit.price.toString(),
          duration: packageToEdit.duration.toString(),
          roi: packageToEdit.roi.toString() || "",
          description: packageToEdit.description,
          features: Array.isArray(packageToEdit.features)
            ? packageToEdit.features.join(", ")
            : packageToEdit.features || "",
        });
        setIsEditDialogOpen(true);
      }
    }
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        Active
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
        Inactive
      </Badge>
    );
  };

  const totalStats = {
    totalPackages: packages.length,
    activePackages: packages.filter((p) => p.status === "active").length,
    totalSubscribers: packages.reduce(
      (sum, p) => sum + (p.subscribers || 0),
      0
    ),
    totalRevenue: packages.reduce((sum, p) => sum + (p.totalRevenue || 0), 0),
  };

  if (loading || isLoading) {
    return (
      <AdminSidebar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </AdminSidebar>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6 bg-blue-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Package Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage investment packages
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Package</DialogTitle>
                <DialogDescription>
                  Add a new investment package for users to purchase.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name *</Label>
                  <Input
                    id="name"
                    value={newPackage.name}
                    onChange={(e) =>
                      setNewPackage({ ...newPackage, name: e.target.value })
                    }
                    placeholder="e.g., Gold Package"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (Ksh) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newPackage.price}
                      onChange={(e) =>
                        setNewPackage({ ...newPackage, price: e.target.value })
                      }
                      placeholder="299"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newPackage.duration}
                      onChange={(e) =>
                        setNewPackage({
                          ...newPackage,
                          duration: e.target.value,
                        })
                      }
                      placeholder="60"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roi">ROI (%) *</Label>
                  <Input
                    id="roi"
                    type="number"
                    step="0.1"
                    value={newPackage.roi}
                    onChange={(e) =>
                      setNewPackage({ ...newPackage, roi: e.target.value })
                    }
                    placeholder="25.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newPackage.description}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        description: e.target.value,
                      })
                    }
                    placeholder="Package description..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Textarea
                    id="features"
                    value={newPackage.features}
                    onChange={(e) =>
                      setNewPackage({ ...newPackage, features: e.target.value })
                    }
                    placeholder="Priority support, Real-time updates, Advanced analytics"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAddPackage}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Package"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Package</DialogTitle>
              <DialogDescription>
                Update the package information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Package Name *</Label>
                <Input
                  id="edit-name"
                  value={editPackage.name}
                  onChange={(e) =>
                    setEditPackage({ ...editPackage, name: e.target.value })
                  }
                  placeholder="e.g., Gold Package"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (Ksh) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editPackage.price}
                    onChange={(e) =>
                      setEditPackage({ ...editPackage, price: e.target.value })
                    }
                    placeholder="299"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (days) *</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editPackage.duration}
                    onChange={(e) =>
                      setEditPackage({
                        ...editPackage,
                        duration: e.target.value,
                      })
                    }
                    placeholder="60"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-roi">ROI (%) *</Label>
                <Input
                  id="edit-roi"
                  type="number"
                  step="0.1"
                  value={editPackage.roi}
                  onChange={(e) =>
                    setEditPackage({ ...editPackage, roi: e.target.value })
                  }
                  placeholder="25.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={editPackage.description}
                  onChange={(e) =>
                    setEditPackage({
                      ...editPackage,
                      description: e.target.value,
                    })
                  }
                  placeholder="Package description..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-features">
                  Features (comma-separated)
                </Label>
                <Textarea
                  id="edit-features"
                  value={editPackage.features}
                  onChange={(e) =>
                    setEditPackage({ ...editPackage, features: e.target.value })
                  }
                  placeholder="Priority support, Real-time updates, Advanced analytics"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleEditPackage}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Package"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Packages
                  </p>
                  <p className="text-2xl font-bold">
                    {totalStats.totalPackages}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Packages
                  </p>
                  <p className="text-2xl font-bold">
                    {totalStats.activePackages}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Subscribers
                  </p>
                  <p className="text-2xl font-bold">
                    {totalStats.totalSubscribers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    Ksh{totalStats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Packages Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Packages</CardTitle>
            <CardDescription>Manage your investment packages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pkg.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {pkg.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>Ksh{pkg.price}</TableCell>
                      <TableCell>{pkg.duration} days</TableCell>
                      <TableCell>{pkg.roi}%</TableCell>
                      <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                      <TableCell>{pkg.subscribers || 0}</TableCell>
                      <TableCell>
                        Ksh{(pkg.totalRevenue || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handlePackageAction(pkg._id, "edit")
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Package
                            </DropdownMenuItem>
                            {pkg.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handlePackageAction(pkg._id, "deactivate")
                                }
                              >
                                <Package className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  handlePackageAction(pkg._id, "activate")
                                }
                              >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handlePackageAction(pkg._id, "delete")
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {packages.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No packages found. Create your first package to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
}
