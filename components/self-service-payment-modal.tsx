"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, CreditCard, Copy, Loader2, CheckCircle } from "lucide-react"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface SelfServicePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  identifier: string 
  userType: "casual" | "monthly"
  licensePlateDisplay?: string
}

interface PaymentDetails {
  totalAmount: string
  description: string
  rawAmount: number
  licensePlate?: string 
  duration?: string
}

type PaymentView = "summary" | "pix" | "card" | "success"

export function SelfServicePaymentModal({ isOpen, onClose, identifier, userType, licensePlateDisplay }: SelfServicePaymentModalProps) {
  const [currentView, setCurrentView] = useState<PaymentView>("summary")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pixCopyFeedback, setPixCopyFeedback] = useState(false)
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiryDate: "",
    cvc: "",
  })
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [apiError, setApiError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setCurrentView("summary")
      setIsProcessing(false)
      setCardForm({ cardNumber: "", nameOnCard: "", expiryDate: "", cvc: "" })
      setPaymentDetails(null)

      if (identifier) {
        fetchPaymentData()
      }
    }
  }, [isOpen, identifier])

  const fetchPaymentData = async () => {
    setLoadingData(true)
    setApiError("")
    try {
      if (userType === "casual") {
        const response = await api.get(`/estacionamento/saida/calcular/${identifier}`)
        const data = response.data
      
        const entry = new Date(data.hora_entrada + "Z")
        const exit = new Date(data.hora_saida_calculada + "Z") 
        const diffMs = exit.getTime() - entry.getTime()
        const totalMinutes = Math.floor(diffMs / 60000)
        
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        setPaymentDetails({
          totalAmount: `R$ ${data.valor_pago.toFixed(2)}`,
          description: entry.toLocaleString(),
          rawAmount: data.valor_pago,
          licensePlate: data.veiculo_placa,
          duration: `${hours}h ${minutes}m`
        })
        
      } else {
        const response = await api.get(`/pagamentos/publico/${identifier}`)
        const fatura = response.data

        const valorCobrar = fatura.valor_cobranca || 0
        const formattedDate = formatMonthYear(fatura.mes_referencia);

        setPaymentDetails({
          totalAmount: `R$ ${valorCobrar.toFixed(2)}`,
          description: formattedDate,
          rawAmount: valorCobrar,
          licensePlate: licensePlateDisplay || "Subscriber"
        })
      }
    } catch (err) {
      console.error("Erro ao buscar dados de pagamento", err)
      setApiError("Could not load payment details. Please try again.")
    } finally {
      setLoadingData(false)
    }
  }

  const processPaymentInBackend = async () => {
      if (!paymentDetails) return

      if (userType === "casual") {
        await api.put(`/estacionamento/saida/${identifier}`, {
          valor_pago: paymentDetails.rawAmount
        })
      } else {
        const hoje = new Date().toISOString().split('T')[0]
        await api.put(`/pagamentos/publico/${identifier}/pagar`, {
          status: "PAGO",
          valor_pago: paymentDetails.rawAmount,
          data_pagamento: hoje
        })
      }
  }

  const handlePixPayment = async () => {
    setCurrentView("pix")
    
    setTimeout(async () => {
      try {
        await processPaymentInBackend() // Confirma no backend

        setCurrentView("success")
      } catch (err) {
        console.error("Erro ao confirmar PIX", err)
        alert("Payment confirmation failed.")
      }
    }, 4000)
  }

  const handleCardPayment = async () => {
    setIsProcessing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      await processPaymentInBackend()

      setCurrentView("success")
      
    } catch (err) {
      console.error("Erro ao processar cartão", err)
      alert("Card payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
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

  const formatMonthYear = (mesReferencia: string | number) => {

    const str = String(mesReferencia);
    
    const year = parseInt(str.substring(0, 4));
    const month = parseInt(str.substring(4, 6));

    const date = new Date(year, month - 1, 1);

    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
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
    setCardForm((prev) => ({ ...prev, [field]: formattedValue }))
  }

  const renderSummaryView = () => {
    if (loadingData) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /> Loading...</div>
    if (apiError) return <div className="p-8 text-center text-red-600">{apiError}</div>
    if (!paymentDetails) return null

    return (
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">License Plate:</span>
              <span className="font-medium">{paymentDetails.licensePlate}</span>
            </div>

            {paymentDetails.duration && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Duration:</span>
                <span className="font-medium">{paymentDetails.duration}</span>
              </div>
            )}
            {userType == "casual" && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Entry:</span>
                <span className="font-medium text-right text-sm">{paymentDetails.description}</span>
              </div>
            )}

            {userType == "monthly" && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly Bill Reference:</span>
                <span className="font-medium text-right text-sm">{paymentDetails.description}</span>
              </div>
            )}
            
          </div>

          <div className="text-center border-t pt-4">
            <div className="text-2xl font-bold text-primary">Total: {paymentDetails.totalAmount}</div>
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
  }

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
              `Pay ${paymentDetails?.totalAmount}`
            )}
          </Button>
        </div>
      </form>
    </div>
  )

  const renderSuccessView = () => (
    <div className="space-y-6 py-6">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        {userType == "casual" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
              Your payment for <strong>{paymentDetails?.licensePlate}</strong> has been processed. 
              You have 15 minutes to exit the parking lot. Thank you!
            </p>
          </div>
        )}

        {userType == "monthly" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
              Your payment has been processed. 
              Thank you!
            </p>
          </div>
        )}
      </div>

      <div className="pt-4">
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          onClick={onClose}
        >
          Return to Homepage
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {currentView === "summary" && renderSummaryView()}
        {currentView === "pix" && renderPixView()}
        {currentView === "card" && renderCardView()}
        {currentView === "success" && renderSuccessView()}
      </DialogContent>
    </Dialog>
  )
}