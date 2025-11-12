"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Mail, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface MonthlyParkerDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  parker: {
    id: number
    fullName: string
    licensePlate: string
    currentPlan: string
    status: string
  }
}

export function MonthlyParkerDetailsModal({ isOpen, onClose, parker }: MonthlyParkerDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Mock detailed data - in real app this would come from API
  const detailedData = {
    personal: {
      fullName: parker.fullName,
      email: `${parker.fullName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: "(11) 99999-9999",
      cpf: "123.456.789-00",
      rg: "12.345.678-9",
    },
    vehicle: {
      licensePlate: parker.licensePlate,
      model: "Honda Civic",
      color: "Branco",
    },
    subscription: {
      currentPlan: parker.currentPlan,
      status: parker.status,
      startDate: "15/08/2024",
      nextBilling: "15/01/2025",
      monthlyFee: "R$ 150,00",
    },
  }

  const handleSendPaymentHistory = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)

    toast({
      title: "History sent successfully!",
      description: `Payment history sent to ${detailedData.personal.email}`,
      duration: 4000,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Details for {parker.fullName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="font-medium">{detailedData.personal.fullName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">RG</label>
                  <p className="font-medium">{detailedData.personal.rg}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CPF</label>
                  <p className="font-medium">{detailedData.personal.cpf}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="font-medium">{detailedData.personal.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-medium">{detailedData.personal.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">License Plate</label>
                  <p className="font-medium">{detailedData.vehicle.licensePlate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Model</label>
                  <p className="font-medium">{detailedData.vehicle.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Color</label>
                  <p className="font-medium">{detailedData.vehicle.color}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Plan</label>
                  <p className="font-medium">{detailedData.subscription.currentPlan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge
                    variant={parker.status === "Active" ? "default" : "destructive"}
                    className={
                      parker.status === "Active"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {detailedData.subscription.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p className="font-medium">{detailedData.subscription.startDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Next Billing</label>
                  <p className="font-medium">{detailedData.subscription.nextBilling}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Monthly Fee</label>
                  <p className="font-medium text-primary">{detailedData.subscription.monthlyFee}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link href={`/monthly-parkers/${parker.id}/edit`}>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Edit className="h-4 w-4" />
                Edit Subscriber
              </Button>
            </Link>
            <Button
              className="gap-2 flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSendPaymentHistory}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {isLoading ? "Sending..." : "Send Payment History to Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
