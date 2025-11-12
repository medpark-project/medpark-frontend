"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MedParkLogo } from "@/components/medpark-logo"
import { CreditCard, Smartphone, ArrowLeft, CheckCircle } from "lucide-react"

interface ParkingInfo {
  licensePlate: string
  timeParked: string
  totalAmount: string
}

export default function PaymentPortalPage() {
  const [step, setStep] = useState<"input" | "payment" | "success">("input")
  const [licensePlate, setLicensePlate] = useState("")
  const [parkingInfo, setParkingInfo] = useState<ParkingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckAmount = async () => {
    if (!licensePlate.trim()) return

    setIsLoading(true)

    // Simulate API call to check parking info
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock parking data
    const mockInfo: ParkingInfo = {
      licensePlate: licensePlate.toUpperCase(),
      timeParked: "3h 45m",
      totalAmount: "35,00",
    }

    setParkingInfo(mockInfo)
    setStep("payment")
    setIsLoading(false)
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setStep("success")
    setIsProcessing(false)
  }

  const handleStartOver = () => {
    setStep("input")
    setLicensePlate("")
    setParkingInfo(null)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <MedParkLogo className="justify-center" />
        </div>

        {/* Main Card */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Parking Payment</CardTitle>
            <CardDescription>
              {step === "input" && "Enter your license plate to check the amount due"}
              {step === "payment" && "Review your parking details and complete payment"}
              {step === "success" && "Payment completed successfully"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: License Plate Input */}
            {step === "input" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publicLicensePlate" className="text-base">
                    Enter your license plate
                  </Label>
                  <Input
                    id="publicLicensePlate"
                    placeholder="ABC-1234"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="text-center text-lg uppercase h-12"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCheckAmount()
                      }
                    }}
                  />
                </div>

                <Button
                  onClick={handleCheckAmount}
                  disabled={!licensePlate.trim() || isLoading}
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Checking...
                    </div>
                  ) : (
                    "Check Amount Due"
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Payment Details */}
            {step === "payment" && parkingInfo && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">License Plate:</span>
                    <Badge variant="outline" className="text-base">
                      {parkingInfo.licensePlate}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Time in parking:</span>
                    <Badge variant="secondary" className="text-base">
                      {parkingInfo.timeParked}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Total Amount */}
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-2">Total</p>
                  <p className="text-5xl font-bold text-primary">R$ {parkingInfo.totalAmount}</p>
                </div>

                <Separator />

                {/* Payment Button */}
                <div className="space-y-3">
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Payment...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        Pay Now with Card or Pix
                        <Smartphone className="h-5 w-5" />
                      </div>
                    )}
                  </Button>

                  <Button variant="outline" onClick={handleStartOver} className="w-full bg-transparent">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to License Plate
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === "success" && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Payment Successful!</h3>
                  <p className="text-muted-foreground">
                    Your parking fee has been paid. You can now exit the parking lot.
                  </p>
                </div>

                {parkingInfo && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>License Plate:</span>
                      <span className="font-semibold">{parkingInfo.licensePlate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Amount Paid:</span>
                      <span className="font-semibold">R$ {parkingInfo.totalAmount}</span>
                    </div>
                  </div>
                )}

                <Button onClick={handleStartOver} variant="outline" className="w-full bg-transparent">
                  Pay for Another Vehicle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>MedPark Hospital Parking Management</p>
          <p>For assistance, contact the parking office</p>
        </div>
      </div>
    </div>
  )
}
