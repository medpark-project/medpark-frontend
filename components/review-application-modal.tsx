"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2 } from "lucide-react"

interface Application {
  id: number
  nome_completo: string
  email: string
  cpf: string
  rg: string
  telefone: string | null
  placa_veiculo: string
  plano_id: number
  tipo_veiculo_id: number
  path_doc_pessoal: string
  path_doc_comprovante: string
  status: string
  created_at: string
}

interface ReviewApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application | null
  onApprove: (id: number) => void
  onDecline: (id: number) => void
  isLoading?: boolean
  planName: string
}

export function ReviewApplicationModal({
  isOpen,
  onClose,
  application,
  onApprove,
  onDecline,
  isLoading = false,
  planName
}: ReviewApplicationModalProps) {

  if (!application) return null

  const handleApprove = () => {
    onApprove(application.id)
  }

  const handleDecline = () => {
    onDecline(application.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Application Details: {application.nome_completo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submitted Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Submitted Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm">{application.nome_completo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{application.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <p className="text-sm">{application.telefone || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">CPF</label>
                <p className="text-sm">{application.cpf}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">RG</label>
                <p className="text-sm">{application.rg}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">License Plate</label>
                <p className="text-sm">{application.placa_veiculo}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Requested Plan</label>
                <p className="text-sm">
                  <Badge variant="outline" className="mt-1">
                    {planName}
                  </Badge>
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button onClick={handleApprove} className="gap-2 bg-green-600 hover:bg-green-700">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />}
            Approve
          </Button>
          <Button variant="destructive" onClick={handleDecline} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4" />}
            Decline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
