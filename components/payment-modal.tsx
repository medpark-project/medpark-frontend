"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Banknote, Smartphone, CheckCircle, QrCode } from "lucide-react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: {
    id: string
    licensePlate: string
    entryTime: Date
    duration: string
  } | null
  onPaymentComplete: (vehicleId: string) => void
}

export function PaymentModal({ isOpen, onClose, vehicle, onPaymentComplete }: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!vehicle) return null

  // Calculate fee based on duration (simplified calculation)
  const calculateFee = (duration: string) => {
    const hours = Number.parseFloat(duration.replace(/[^\d.]/g, "")) || 0
    const baseRate = 8.5 // R$ 8.50 per hour
    return (hours * baseRate).toFixed(2)
  }

  const totalFee = calculateFee(vehicle.duration)
  const currentTime = new Date()

  const formatDateTime = (date: Date) => {
    return (
      date.toLocaleDateString("pt-BR") +
      " " +
      date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  const handlePaymentComplete = async () => {
    if (!selectedPaymentMethod) return

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    onPaymentComplete(vehicle.id)
    setIsProcessing(false)
    setSelectedPaymentMethod(null)
    onClose()
  }

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: Banknote },
    { id: "credit", label: "Credit Card", icon: CreditCard },
    { id: "pix", label: "Pix", icon: Smartphone },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Process Payment & Exit</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">License Plate:</span>
              <Badge variant="outline" className="text-base">
                {vehicle.licensePlate}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Entry:</span>
              <span className="text-sm">{formatDateTime(vehicle.entryTime)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Exit:</span>
              <span className="text-sm">{formatDateTime(currentTime)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Duration:</span>
              <Badge variant="secondary">{vehicle.duration}</Badge>
            </div>
          </div>

          <Separator />

          {/* Total Amount */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">Total to Pay</p>
            <p className="text-4xl font-bold text-primary">R$ {totalFee}</p>
          </div>

          <Separator />

          {selectedPaymentMethod !== "pix" ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Select Payment Method:</p>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                    className="h-16 flex-col gap-2"
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <method.icon className="h-5 w-5" />
                    <span className="text-xs">{method.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-center">Customer PIX Payment</p>
              <div className="flex justify-center">
                <div className="w-40 h-40 bg-muted border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Show to Customer</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Button variant="outline" size="sm" onClick={() => setSelectedPaymentMethod(null)}>
                  Change Payment Method
                </Button>
              </div>
            </div>
          )}

          {/* Complete Payment Button */}
          <Button
            onClick={handlePaymentComplete}
            disabled={!selectedPaymentMethod || isProcessing}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Payment Received - Open Gate
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
