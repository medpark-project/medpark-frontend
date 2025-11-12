"use client"
import { useState } from "react"
import { Search, Plus, Check, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { ReviewApplicationModal } from "@/components/review-application-modal"
import { MonthlyParkerDetailsModal } from "@/components/monthly-parker-details-modal"

// Mock data for monthly parkers
const monthlyParkers = [
  {
    id: 1,
    fullName: "Maria Silva Santos",
    licensePlate: "ABC-1234",
    currentPlan: "Plano Integral 24h",
    status: "Active" as const,
  },
  {
    id: 2,
    fullName: "João Pedro Oliveira",
    licensePlate: "XYZ-5678",
    currentPlan: "Plano Diurno",
    status: "Active" as const,
  },
  {
    id: 3,
    fullName: "Ana Carolina Costa",
    licensePlate: "DEF-9012",
    currentPlan: "Plano Noturno",
    status: "Inactive" as const,
  },
  {
    id: 4,
    fullName: "Carlos Eduardo Lima",
    licensePlate: "GHI-3456",
    currentPlan: "Plano Integral 24h",
    status: "Active" as const,
  },
]

// Mock data for pending applications
const pendingApplications = [
  {
    id: 1,
    applicantName: "Roberto Silva Mendes",
    requestedPlan: "Plano Integral 24h",
    dateOfRequest: "2025-01-08",
  },
  {
    id: 2,
    applicantName: "Fernanda Costa Lima",
    requestedPlan: "Plano Diurno",
    dateOfRequest: "2025-01-07",
  },
  {
    id: 3,
    applicantName: "Paulo Eduardo Santos",
    requestedPlan: "Plano Noturno",
    dateOfRequest: "2025-01-06",
  },
]

export default function MonthlyParkersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [applications, setApplications] = useState(pendingApplications)
  const [registeredParkers, setRegisteredParkers] = useState(monthlyParkers)
  const [selectedApplication, setSelectedApplication] = useState<(typeof pendingApplications)[0] | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedParker, setSelectedParker] = useState<(typeof monthlyParkers)[0] | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const userRole = "Admin" // This would come from auth context in real app

  const filteredParkers = registeredParkers.filter(
    (parker) =>
      parker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parker.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleApprove = (applicationId: number) => {
    const application = applications.find((app) => app.id === applicationId)
    if (application) {
      setApplications((prev) => prev.filter((app) => app.id !== applicationId))
      const newParker = {
        id: Math.max(...registeredParkers.map((p) => p.id)) + 1,
        fullName: application.applicantName,
        licensePlate: "NEW-" + String(applicationId).padStart(3, "0"),
        currentPlan: application.requestedPlan,
        status: "Active" as const,
      }
      setRegisteredParkers((prev) => [...prev, newParker])
    }
  }

  const handleDecline = (applicationId: number) => {
    setApplications((prev) => prev.filter((app) => app.id !== applicationId))
  }

  const handleViewDetails = (application: (typeof pendingApplications)[0]) => {
    setSelectedApplication(application)
    setIsReviewModalOpen(true)
  }

  const handleViewParkerDetails = (parker: (typeof monthlyParkers)[0]) => {
    setSelectedParker(parker)
    setIsDetailsModalOpen(true)
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monthly Parkers</h1>
          <p className="text-muted-foreground mt-2">Search and manage registered subscribers</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or license plate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {userRole === "Admin" && (
                <Link href="/monthly-parkers/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Parker
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Requested Plan</TableHead>
                  <TableHead>Date of Request</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.applicantName}</TableCell>
                    <TableCell>{application.requestedPlan}</TableCell>
                    <TableCell>{new Date(application.dateOfRequest).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 bg-transparent"
                          onClick={() => handleViewDetails(application)}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(application.id)}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDecline(application.id)}
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {applications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No pending applications at this time.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Monthly Parkers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParkers.map((parker) => (
                  <TableRow key={parker.id}>
                    <TableCell className="font-medium">{parker.fullName}</TableCell>
                    <TableCell>{parker.licensePlate}</TableCell>
                    <TableCell>{parker.currentPlan}</TableCell>
                    <TableCell>
                      <Badge
                        variant={parker.status === "Active" ? "default" : "destructive"}
                        className={
                          parker.status === "Active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {parker.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                        onClick={() => handleViewParkerDetails(parker)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredParkers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No monthly parkers found matching your search.
              </div>
            )}
          </CardContent>
        </Card>

        {selectedApplication && (
          <ReviewApplicationModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            application={selectedApplication}
            onApprove={handleApprove}
            onDecline={handleDecline}
          />
        )}

        {selectedParker && (
          <MonthlyParkerDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            parker={selectedParker}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
