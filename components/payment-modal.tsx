"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Banknote, Smartphone, CheckCircle, QrCode, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ParkedVehicle {
  id: number
  veiculo_placa: string
  hora_entrada: string
}

// Interface para a RESPOSTA DO CÁLCULO
interface ExitDetails {
  hora_entrada: string
  hora_saida_calculada: string // O backend nos diz a hora do cálculo
  valor_pago: number
  veiculo_placa: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: ParkedVehicle | null
  onPaymentComplete: (vehicleId: string) => void
  toast: (options: { title: string, description: string, variant?: "default" | "destructive" }) => void
}

export function PaymentModal({ isOpen, onClose, vehicle, onPaymentComplete }: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [exitDetails, setExitDetails] = useState<ExitDetails | null>(null)
  const [error, setError] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    if (vehicle && isOpen) {
      calculateFee(vehicle.veiculo_placa)
    }
  }, [vehicle, isOpen])

  const calculateFee = async (placa: string) => {
    setIsCalculating(true)
    setError("")
    setExitDetails(null)

    try {
      const response = await api.get(`/estacionamento/saida/calcular/${placa}`)
      const details: ExitDetails = response.data

      if (details.valor_pago === 0) {
        await handlePaymentReceived(0.0) // Passa 0.0 como valor
        toast({
          title: "Saída de Mensalista Registrada",
          description: `Veículo ${placa} liberado.`,
        })
      } else {
        // É avulso! Salva os detalhes para mostrar no modal.
        setExitDetails(details)
      }

    } catch (err: any) {
      console.error("Erro ao calcular valor:", err)
      setError(err.response?.data?.detail || "Não foi possível calcular o valor.")
    } finally {
      setIsCalculating(false) // Termina o loading inicial
    }
  }

  
  const handleClose = () => {
    setExitDetails(null)
    setSelectedPaymentMethod("cash")
    setError("")
    onClose()
  }

  const handlePaymentReceived = async (valor?: number) => {
    // Se o valor não foi passado, pega o dos detalhes
    const valorFinal = valor !== undefined ? valor : exitDetails?.valor_pago
    
    if (!vehicle || valorFinal === undefined) return
    
    setIsSaving(true)
    setError("")
    
    try {
        await api.put(`/estacionamento/saida/${vehicle.veiculo_placa}`, {
           valor_pago: valorFinal
        })
        
        onPaymentComplete(vehicle.id.toString())
        handleClose()
        
    } catch (err: any) {
        console.error("Erro ao registrar saída:", err)
        setError(err.response?.data?.detail || "Não foi possível processar a saída.")
    } finally {
        setIsSaving(false)
    }
  }

  const formatDateTime = (isoString: string | undefined) => {
    if (!isoString) return "N/A"
    const date = new Date(isoString + "Z"); // Força UTC
    return date.toLocaleString("pt-BR", {
      hour: "2-digit", minute: "2-digit"
    })
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
                {vehicle?.veiculo_placa}
              </Badge>
            </div>

            {exitDetails && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Entry:</span>
                  <span className="text-sm">{formatDateTime(exitDetails.hora_entrada)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Exit:</span>
                  <span className="text-sm">{formatDateTime(exitDetails.hora_saida_calculada)}</span>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Total Amount */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">Total to Pay</p>
            {isCalculating && <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />}
            {error && <p className="text-lg font-bold text-red-600">{error}</p>}
            {exitDetails && (
              <p className="text-4xl font-bold text-primary">
                R$ {exitDetails.valor_pago.toFixed(2)}
              </p>
            )}
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

          <Button
            onClick={() => handlePaymentReceived()} // Chama sem argumentos
            disabled={isCalculating || isSaving || !exitDetails || !selectedPaymentMethod}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
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
