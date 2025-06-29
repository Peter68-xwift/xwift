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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminSidebar from "../../../components/AdminSidebar";
import {
  Search,
  MoreHorizontal,
  UserPlus,
  Filter,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Wallet,
  DollarSign,
  Users,
  UserCheck,
  UserX,
  Loader2,
  Package,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function UserManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [isPackagesDialogOpen, setIsPackagesDialogOpen] = useState(false);
  const [isReferralsDialogOpen, setIsReferralsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    role: "user",
    isActive: true,
    bio: "",
    location: "",
  });

  const [createForm, setCreateForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    walletBalance: 0,
  });

  const [walletForm, setWalletForm] = useState({
    action: "credit",
    amount: "",
    description: "",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user, currentPage, searchTerm, filterStatus]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        status: filterStatus,
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        // console.log(data.data);
        setTotalUsers(data.data.total);
        setTotalPages(data.data.totalPages);
      } else {
        console.error("Failed to fetch users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        setIsCreateDialogOpen(false);
        setCreateForm({
          fullName: "",
          username: "",
          email: "",
          phone: "",
          password: "",
          role: "user",
          walletBalance: 0,
        });
        fetchUsers();
        alert("User created successfully!");
      } else {
        alert(data.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      const userId = user.id;

      const response = await fetch(
        `/api/admin/users/${selectedUser._id}?userId=${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editForm,
            profile: {
              bio: editForm.bio,
              location: editForm.location,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
        alert("User updated successfully!");
      } else {
        alert(data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletUpdate = async (e) => {
    e.preventDefault();
    if (!selectedUser || !walletForm.amount) return;

    setIsSubmitting(true);

    try {
      const userId = user.id;

      const response = await fetch(
        `/api/admin/users/${selectedUser._id}/wallet?userId=${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: walletForm.action,
            amount: Number.parseFloat(walletForm.amount),
            description: walletForm.description,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsWalletDialogOpen(false);
        setWalletForm({ action: "credit", amount: "", description: "" });
        setSelectedUser(null);
        fetchUsers();
        alert(`Wallet ${walletForm.action} successful!`);
      } else {
        alert(data.message || "Failed to update wallet");
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
      alert("Failed to update wallet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
        alert("User deleted successfully!");
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
        alert(
          `User ${!currentStatus ? "activated" : "deactivated"} successfully!`
        );
      } else {
        alert(data.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status");
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
      isActive: user.isActive !== undefined ? user.isActive : true,
      bio: user.profile?.bio || "",
      location: user.profile?.location || "",
    });
    setIsEditDialogOpen(true);
  };

  const openWalletDialog = (user) => {
    setSelectedUser(user);
    setIsWalletDialogOpen(true);
  };

  const openPackagesDialog = (user) => {
    setSelectedUser(user);
    setIsPackagesDialogOpen(true);
  };

  const openReferralsDialog = (user) => {
    setSelectedUser(user);
    setIsReferralsDialogOpen(true);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return null;
  }

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
        Inactive
      </Badge>
    );
  };

  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => u.isActive === false).length;

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6 bg-blue-300">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all users and their accounts
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-fit">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the platform
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={createForm.fullName}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={createForm.username}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          username: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={createForm.phone}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={createForm.role}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, role: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="walletBalance">
                      Initial Wallet Balance
                    </Label>
                    <Input
                      id="walletBalance"
                      type="number"
                      min="0"
                      step="0.01"
                      value={createForm.walletBalance}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          walletBalance: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Create User
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Inactive Users
                  </p>
                  <p className="text-2xl font-bold">{inactiveUsers}</p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Wallet Balance
                  </p>
                  <p className="text-2xl font-bold">
                    $
                    {users
                      .reduce(
                        (sum, user) => sum + (user.wallet?.balance || 0),
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>Search and filter users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter:{" "}
                    {filterStatus === "all"
                      ? "All"
                      : filterStatus === "active"
                      ? "Active"
                      : "Inactive"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Wallet Balance</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Refered By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              @{user.username}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.phone}
                        </TableCell>
                        <TableCell>
                          ${(user.wallet?.balance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user.referrer?.username || "none"}
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
                                onClick={() => openEditDialog(user)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openWalletDialog(user)}
                              >
                                <Wallet className="h-4 w-4 mr-2" />
                                Manage Wallet
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openPackagesDialog(user)}
                              >
                                <Package className="h-4 w-4 mr-2" />
                                View Packages
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openReferralsDialog(user)}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                View Referrals
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusToggle(user._id, user.isActive)
                                }
                              >
                                {user.isActive ? (
                                  <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user._id)}
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFullName">Full Name</Label>
                  <Input
                    id="editFullName"
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editUsername">Username</Label>
                  <Input
                    id="editUsername"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editRole">Role</Label>
                  <select
                    id="editRole"
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="editBio">Bio</Label>
                <Textarea
                  id="editBio"
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="editLocation">Location</Label>
                <Input
                  id="editLocation"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isActive: e.target.checked })
                  }
                />
                <Label htmlFor="editIsActive">Active User</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Update User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Wallet Management Dialog */}
        <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Wallet</DialogTitle>
              <DialogDescription>
                {selectedUser && (
                  <>
                    Current Balance: $
                    {(selectedUser.wallet?.balance || 0).toLocaleString()}
                    <br />
                    User: {selectedUser.fullName}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleWalletUpdate} className="space-y-4">
              <div>
                <Label htmlFor="walletAction">Action</Label>
                <select
                  id="walletAction"
                  value={walletForm.action}
                  onChange={(e) =>
                    setWalletForm({ ...walletForm, action: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="credit">Credit (Add Money)</option>
                  <option value="debit">Debit (Remove Money)</option>
                  <option value="set">
                    Set Balance (Override Current Balance)
                  </option>
                </select>
              </div>
              <div>
                <Label htmlFor="walletAmount">Amount</Label>
                <Input
                  id="walletAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={walletForm.amount}
                  onChange={(e) =>
                    setWalletForm({ ...walletForm, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="walletDescription">
                  Description (Optional)
                </Label>
                <Textarea
                  id="walletDescription"
                  value={walletForm.description}
                  onChange={(e) =>
                    setWalletForm({
                      ...walletForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Reason for wallet update..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsWalletDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {walletForm.action === "credit"
                    ? "Add Money"
                    : walletForm.action === "debit"
                    ? "Remove Money"
                    : "Set Balance"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isPackagesDialogOpen}
          onOpenChange={setIsPackagesDialogOpen}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Subscribed Packages</DialogTitle>
              <DialogDescription>
                A list of all active or completed packages by the user
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              {selectedUser?.packagesSubscribed?.length > 0 ? (
                <ul className="space-y-4">
                  {selectedUser.packagesSubscribed.map((pkg, i) => (
                    <li key={i} className="border rounded-md p-3">
                      <div className="font-semibold">{pkg.packageName}</div>
                      <div className="text-sm text-muted-foreground">
                        Amount: Ksh{pkg.amount} <br />
                        Start: {new Date(
                          pkg.startDate
                        ).toLocaleDateString()}{" "}
                        <br />
                        End: {new Date(pkg.endDate).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground">
                  No packages found.
                </p>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isReferralsDialogOpen}
          onOpenChange={setIsReferralsDialogOpen}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>User Referrals</DialogTitle>
              <DialogDescription>
                Users who were referred by {selectedUser?.fullName}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-96">
              {selectedUser?.referrals?.length > 0 ? (
                <ul className="space-y-3">
                  {selectedUser.referrals.map((ref, i) => (
                    <li key={i} className="border rounded-md p-3">
                      <div className="font-medium">{ref.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        Username: {ref.username} <br />
                        Email: {ref.email}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground">
                  No referrals found.
                </p>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  );
}
