"use client"
import { useState } from "react"
import type React from "react"
import { ArrowLeft, Eye, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout" // Import DashboardLayout
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

// Mock data - in real app this would come from API
const mockParker = {
  id: 1,
  fullName: "Maria Silva Santos",
  email: "maria.santos@email.com",
  phone: "(11) 99999-9999",
  licensePlate: "ABC-1234",
  vehicleModel: "Honda Civic",
  vehicleColor: "White",
  parkingPlan: "integral",
  startDate: "2024-01-15",
  status: "Active",
  documents: {
    personalDocument: "documento_maria.pdf",
    proofOfEmployment: "comprovante_trabalho_maria.pdf",
  },
}

export default function EditMonthlyParkerPage() {
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState(mockParker)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically update in database
    console.log("Updating monthly parker:", formData)
    router.push("/monthly-parkers")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleViewDocument = (documentType: string) => {
    // In a real app, this would open the document in a new tab or modal
    console.log(`Viewing ${documentType}:`, formData.documents[documentType as keyof typeof formData.documents])
    alert(`Opening ${formData.documents[documentType as keyof typeof formData.documents]}`)
  }

  const handleChangeDocument = (documentType: string) => {
    // In a real app, this would open file upload dialog
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".pdf,.jpg,.jpeg,.png"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Update the document name in state
        setFormData((prev) => ({
          ...prev,
          documents: {
            ...prev.documents,
            [documentType]: file.name,
          },
        }))
      }
    }
    input.click()
  }

  return (
    <DashboardLayout userRole="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/monthly-parkers">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editing Details for {formData.fullName}</h1>
            <p className="text-muted-foreground mt-2">Update subscriber information and settings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => handleInputChange("licensePlate", e.target.value)}
                    placeholder="ABC-1234"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Vehicle Model</Label>
                  <Input
                    id="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                    placeholder="Honda Civic"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleColor">Vehicle Color</Label>
                  <Input
                    id="vehicleColor"
                    value={formData.vehicleColor}
                    onChange={(e) => handleInputChange("vehicleColor", e.target.value)}
                    placeholder="White"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Plan & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parkingPlan">Parking Plan</Label>
                  <Select
                    value={formData.parkingPlan}
                    onValueChange={(value) => handleInputChange("parkingPlan", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diurno">Plano Diurno</SelectItem>
                      <SelectItem value="noturno">Plano Noturno</SelectItem>
                      <SelectItem value="integral">Plano Integral 24h</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Subscription Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Personal Document</Label>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{formData.documents.personalDocument}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument("personalDocument")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeDocument("personalDocument")}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Change File
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Proof of Employment</Label>
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{formData.documents.proofOfEmployment}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument("proofOfEmployment")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeDocument("proofOfEmployment")}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Change File
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Link href="/monthly-parkers">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
