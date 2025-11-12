"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { PaymentConfirmationModal, PaymentConfirmationMessages } from "@/components/payment-confirmation-modal"
import { QrCode, CreditCard, Copy, Loader2, CheckCircle } from "lucide-react"

interface PaymentData {
  licensePlate: string
  duration?: string
  totalAmount: string
  description?: string
}

interface SelfServicePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentData: PaymentData
  userType: "casual" | "monthly"
}

type PaymentView = "summary" | "pix" | "card" | "success"

export function SelfServicePaymentModal({ isOpen, onClose, paymentData, userType }: SelfServicePaymentModalProps) {
  const [currentView, setCurrentView] = useState<PaymentView>("summary")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [pixCopyFeedback, setPixCopyFeedback] = useState(false)
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiryDate: "",
    cvc: "",
  })

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentView("summary")
      setIsProcessing(false)
      setCardForm({
        cardNumber: "",
        nameOnCard: "",
        expiryDate: "",
        cvc: "",
      })
    }
  }, [isOpen])

  const handlePixPayment = () => {
    setCurrentView("pix")
    // Simulate PIX payment confirmation after 4 seconds
    setTimeout(() => {
      const message =
        userType === "casual"
          ? PaymentConfirmationMessages.casualUser(paymentData.licensePlate)
          : PaymentConfirmationMessages.monthlyParker("September")
      setSuccessMessage(message)
      setShowSuccessModal(true)
      onClose()
    }, 4000)
  }

  const handleCardPayment = async () => {
    setIsProcessing(true)
    // Simulate card payment processing
    setTimeout(() => {
      setIsProcessing(false)
      const message =
        userType === "casual"
          ? PaymentConfirmationMessages.casualUser(paymentData.licensePlate)
          : PaymentConfirmationMessages.monthlyParker("September")
      setSuccessMessage(message)
      setShowSuccessModal(true)
      onClose()
    }, 3000)
  }

  const copyPixCode = () => {
    const pixCode =
      "00020126580014br.gov.bcb.pix013636c4e1c8-7e4a-4c3a-9f2a-8b5d7e9f1a2b52040000530398654041850620240101MedPark6304A1B2"
    navigator.clipboard.writeText(pixCode)

    setPixCopyFeedback(true)
    setTimeout(() => {
      setPixCopyFeedback(false)
    }, 2500)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value
    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value)
    } else if (field === "expiryDate") {
      formattedValue = formatExpiryDate(value)
    } else if (field === "cvc") {
      formattedValue = value.replace(/[^0-9]/gi, "").substring(0, 3)
    }

    setCardForm((prev) => ({
      ...prev,
      [field]: formattedValue,
    }))
  }

  const renderSummaryView = () => (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center">Payment</DialogTitle>
      </DialogHeader>

      {/* Payment Summary */}
      <div className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">License Plate:</span>
            <span className="font-medium">{paymentData.licensePlate}</span>
          </div>
          {paymentData.duration && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="font-medium">{paymentData.duration}</span>
            </div>
          )}
          {paymentData.description && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Description:</span>
              <span className="font-medium">{paymentData.description}</span>
            </div>
          )}
        </div>

        <div className="text-center border-t pt-4">
          <div className="text-2xl font-bold text-primary">Total to Pay: {paymentData.totalAmount}</div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-center">Select Your Payment Method</h3>

        <div className="grid gap-3">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={handlePixPayment}>
            <CardContent className="flex items-center justify-center p-4">
              <QrCode className="h-6 w-6 mr-3 text-primary" />
              <span className="font-medium">PIX</span>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setCurrentView("card")}>
            <CardContent className="flex items-center justify-center p-4">
              <CreditCard className="h-6 w-6 mr-3 text-primary" />
              <span className="font-medium">Credit / Debit Card</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderPixView = () => (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center">Pay with PIX</DialogTitle>
      </DialogHeader>

      <div className="text-center space-y-6">
        {/* QR Code Placeholder */}
        <div className="flex justify-center">
          <div className="w-48 h-48 bg-muted border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <QrCode className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">QR Code</p>
            </div>
          </div>
        </div>

        {/* PIX Code */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Or use the code below:</p>
          <div className="flex gap-2">
            <Input
              value="00020126580014br.gov.bcb.pix013636c4e1c8-7e4a-4c3a-9f2a-8b5d7e9f1a2b52040000530398654041850620240101MedPark6304A1B2"
              readOnly
              className="text-xs bg-muted"
            />
            <Button variant="outline" size="sm" onClick={copyPixCode}>
              {pixCopyFeedback ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span className="ml-1 text-xs">Copied!</span>
                </>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Awaiting Payment */}
        <div className="flex items-center justify-center gap-2 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Awaiting payment confirmation...</span>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={() => setCurrentView("summary")}>
          Back to Payment Methods
        </Button>
      </div>
    </div>
  )

  const renderCardView = () => (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center">Enter Card Details</DialogTitle>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleCardPayment()
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            placeholder="XXXX XXXX XXXX XXXX"
            value={cardForm.cardNumber}
            onChange={(e) => handleCardInputChange("cardNumber", e.target.value)}
            maxLength={19}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nameOnCard">Name on Card</Label>
          <Input
            id="nameOnCard"
            placeholder="Full name as shown on card"
            value={cardForm.nameOnCard}
            onChange={(e) => handleCardInputChange("nameOnCard", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              placeholder="MM/YY"
              value={cardForm.expiryDate}
              onChange={(e) => handleCardInputChange("expiryDate", e.target.value)}
              maxLength={5}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              placeholder="XXX"
              value={cardForm.cvc}
              onChange={(e) => handleCardInputChange("cvc", e.target.value)}
              maxLength={3}
              required
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => setCurrentView("summary")}
            disabled={isProcessing}
          >
            Back
          </Button>
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${paymentData.totalAmount}`
            )}
          </Button>
        </div>
      </form>
    </div>
  )

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          {currentView === "summary" && renderSummaryView()}
          {currentView === "pix" && renderPixView()}
          {currentView === "card" && renderCardView()}
        </DialogContent>
      </Dialog>

      <PaymentConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </>
  )
}
