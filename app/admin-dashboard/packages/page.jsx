"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AdminSidebar from "../../../components/AdminSidebar"
import { Plus, MoreHorizontal, Edit, Trash2, Eye, Package, DollarSign, Users, TrendingUp } from "lucide-react"

export default function PackageManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: "Starter Package",
      price: 99,
      duration: 30,
      roi: 15,
      description: "Perfect for beginners looking to start their investment journey",
      features: ["Basic support", "Daily updates", "Mobile access"],
      status: "active",
      subscribers: 156,
      totalRevenue: 15444,
      createdDate: "2024-01-01",
    },
    {
      id: 2,
      name: "Premium Package",
      price: 299,
      duration: 60,
      roi: 25,
      description: "Advanced package with premium features and higher returns",
      features: ["Priority support", "Real-time updates", "Advanced analytics", "Mobile access"],
      status: "active",
      subscribers: 89,
      totalRevenue: 26611,
      createdDate: "2024-01-01",
    },
    {
      id: 3,
      name: "VIP Package",
      price: 599,
      duration: 90,
      roi: 35,
      description: "Exclusive package with maximum returns and personal advisor",
      features: ["24/7 support", "Instant updates", "Premium analytics", "Personal advisor"],
      status: "active",
      subscribers: 34,
      totalRevenue: 20366,
      createdDate: "2024-01-01",
    },
    {
      id: 4,
      name: "Legacy Package",
      price: 199,
      duration: 45,
      roi: 20,
      description: "Discontinued package for existing users only",
      features: ["Standard support", "Weekly updates"],
      status: "inactive",
      subscribers: 12,
      totalRevenue: 2388,
      createdDate: "2023-12-01",
    },
  ])

  const [newPackage, setNewPackage] = useState({
    name: "",
    price: "",
    duration: "",
    roi: "",
    description: "",
    features: "",
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const handleAddPackage = () => {
    const packageData = {
      id: packages.length + 1,
      name: newPackage.name,
      price: Number.parseFloat(newPackage.price),
      duration: Number.parseInt(newPackage.duration),
      roi: Number.parseFloat(newPackage.roi),
      description: newPackage.description,
      features: newPackage.features.split(",").map((f) => f.trim()),
      status: "active",
      subscribers: 0,
      totalRevenue: 0,
      createdDate: new Date().toISOString().split("T")[0],
    }

    setPackages([...packages, packageData])
    setNewPackage({ name: "", price: "", duration: "", roi: "", description: "", features: "" })
    setIsAddDialogOpen(false)
  }

  const handlePackageAction = (packageId, action) => {
    setPackages(
      packages
        .map((pkg) => {
          if (pkg.id === packageId) {
            switch (action) {
              case "activate":
                return { ...pkg, status: "active" }
              case "deactivate":
                return { ...pkg, status: "inactive" }
              case "delete":
                return null
              default:
                return pkg
            }
          }
          return pkg
        })
        .filter(Boolean),
    )
  }

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Inactive</Badge>
    )
  }

  const totalStats = {
    totalPackages: packages.length,
    activePackages: packages.filter((p) => p.status === "active").length,
    totalSubscribers: packages.reduce((sum, p) => sum + p.subscribers, 0),
    totalRevenue: packages.reduce((sum, p) => sum + p.totalRevenue, 0),
  }

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Package Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage investment packages</p>
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
                <DialogDescription>Add a new investment package for users to purchase.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                    placeholder="e.g., Gold Package"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newPackage.price}
                      onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                      placeholder="299"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newPackage.duration}
                      onChange={(e) => setNewPackage({ ...newPackage, duration: e.target.value })}
                      placeholder="60"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roi">ROI (%)</Label>
                  <Input
                    id="roi"
                    type="number"
                    step="0.1"
                    value={newPackage.roi}
                    onChange={(e) => setNewPackage({ ...newPackage, roi: e.target.value })}
                    placeholder="25.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newPackage.description}
                    onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                    placeholder="Package description..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Textarea
                    id="features"
                    value={newPackage.features}
                    onChange={(e) => setNewPackage({ ...newPackage, features: e.target.value })}
                    placeholder="Priority support, Real-time updates, Advanced analytics"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddPackage} className="flex-1">
                    Create Package
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Packages</p>
                  <p className="text-2xl font-bold">{totalStats.totalPackages}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Packages</p>
                  <p className="text-2xl font-bold">{totalStats.activePackages}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Subscribers</p>
                  <p className="text-2xl font-bold">{totalStats.totalSubscribers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalStats.totalRevenue.toLocaleString()}</p>
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
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pkg.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{pkg.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>${pkg.price}</TableCell>
                      <TableCell>{pkg.duration} days</TableCell>
                      <TableCell>{pkg.roi}%</TableCell>
                      <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                      <TableCell>{pkg.subscribers}</TableCell>
                      <TableCell>${pkg.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Package
                            </DropdownMenuItem>
                            {pkg.status === "active" ? (
                              <DropdownMenuItem onClick={() => handlePackageAction(pkg.id, "deactivate")}>
                                <Package className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handlePackageAction(pkg.id, "activate")}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handlePackageAction(pkg.id, "delete")}
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
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  )
}
