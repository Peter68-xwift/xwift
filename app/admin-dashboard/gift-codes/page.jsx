"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import AdminSidebar from "../../../components/AdminSidebar";
import {
  Gift,
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  Trash2,
  RefreshCw,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function GiftCodesPage() {
  const [giftCodes, setGiftCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCodes: 0,
    activeCodes: 0,
    redeemedCodes: 0,
    totalValue: 0,
    redeemedValue: 0,
  });

  // Form state for creating gift codes
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    quantity: 1,
    expiresAt: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch gift codes
  const fetchGiftCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/gift-codes");
      if (response.ok) {
        const data = await response.json();
        setGiftCodes(data.giftCodes || []);
        console.log(data.giftCodes);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error("Error fetching gift codes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftCodes();
  }, []);

  // Create gift codes
  const handleCreateGiftCodes = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/gift-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(formData.amount),
          description: formData.description,
          quantity: Number.parseInt(formData.quantity),
          expiresAt: formData.expiresAt || null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully created ${result.codes.length} gift code(s)!`);
        setIsCreateDialogOpen(false);
        setFormData({
          amount: "",
          description: "",
          quantity: 1,
          expiresAt: "",
        });
        fetchGiftCodes();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create gift codes");
      }
    } catch (error) {
      console.error("Error creating gift codes:", error);
      alert("Failed to create gift codes");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle gift code status
  const toggleGiftCodeStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/gift-codes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        fetchGiftCodes();
      } else {
        alert("Failed to update gift code status");
      }
    } catch (error) {
      console.error("Error updating gift code:", error);
      alert("Failed to update gift code status");
    }
  };

  // Delete gift code
  const deleteGiftCode = async (id) => {
    if (!confirm("Are you sure you want to delete this gift code?")) return;

    try {
      const response = await fetch(`/api/admin/gift-codes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchGiftCodes();
      } else {
        alert("Failed to delete gift code");
      }
    } catch (error) {
      console.error("Error deleting gift code:", error);
      alert("Failed to delete gift code");
    }
  };

  // Copy code to clipboard
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert("Gift code copied to clipboard!");
  };

  // Filter gift codes based on search
  const filteredGiftCodes =
    Array.isArray(giftCodes) && giftCodes.length > 0
      ? giftCodes.filter((code) =>
          // code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          code.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const formatCurrency = (amount) => {
    return Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (code) => {
    if (code.isRedeemed) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Redeemed
        </Badge>
      );
    }
    if (!code.isActive) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Inactive
        </Badge>
      );
    }
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Expired
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        Active
      </Badge>
    );
  };

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gift Codes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and generate gift codes for users
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchGiftCodes} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Gift Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Gift Codes</DialogTitle>
                  <DialogDescription>
                    Generate new gift codes with specified amounts
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateGiftCodes} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (Ksh)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Number of codes to generate"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Purpose or description of the gift code"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData({ ...formData, expiresAt: e.target.value })
                      }
                    />
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
                      {isSubmitting ? "Creating..." : "Create Codes"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCodes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Codes
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeCodes}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redeemed</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.redeemedCodes}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalValue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Redeemed Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.redeemedValue)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Gift Codes Management</CardTitle>
            <CardDescription>
              View and manage all generated gift codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search gift codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading gift codes...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Redeemed By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGiftCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No gift codes found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredGiftCodes.map((code) => (
                        <TableRow key={code._id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                                {code.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(code.code)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(code.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(code)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {code.description || (
                              <span className="text-gray-400">
                                No description
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(code.createdAt)}</TableCell>
                          <TableCell>
                            {code.expiresAt ? (
                              formatDate(code.expiresAt)
                            ) : (
                              <span className="text-gray-400">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {code.redeemedBy ? (
                              <span className="text-green-600">
                                User #{code.redeemedBy.slice(-6)}
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                Not redeemed
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => copyToClipboard(code.code)}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Code
                                </DropdownMenuItem>
                                {!code.isRedeemed && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleGiftCodeStatus(
                                        code._id,
                                        code.isActive
                                      )
                                    }
                                  >
                                    {code.isActive ? (
                                      <>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => deleteGiftCode(code._id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
}
