"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Check, X } from "lucide-react"

interface Application {
  id: number
  nome_completo: string
  email: string
  cpf: string
  rg: string
  telefone: string | null
  placa_veiculo: string
  plano_id: number // TODO: Precisaríamos buscar o nome do plano
  tipo_veiculo_id: number // TODO: Precisaríamos buscar o nome do tipo
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
}

export function ReviewApplicationModal({
  isOpen,
  onClose,
  application,
  onApprove,
  onDecline,
}: ReviewApplicationModalProps) {

  if (!application) return null

  const handleApprove = () => {
    onApprove(application.id)
    onClose()
  }

  const handleDecline = () => {
    onDecline(application.id)
    onClose()
  }

  // TODO: Criar função para abrir os documentos (path_doc_pessoal, path_doc_comprovante)
  const handleViewDocument = (path: string) => {
    // Em um sistema real, isso abriria a URL do documento (ex: de um S3)
    // Por enquanto, podemos apenas logar o caminho
    console.log("Visualizar documento em:", path)
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
                    {application.plano_id} {/* TODO: Idealmente, buscar o nome do plano */}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Document Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Uploaded Documents</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Personal Document</p>
                  <p className="text-xs text-muted-foreground">{application.path_doc_pessoal.split("/").pop()}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewDocument(application.path_doc_comprovante)}>
                  View Document
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Proof of Employment</p>
                  <p className="text-xs text-muted-foreground">{application.path_doc_comprovante.split("/").pop()}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewDocument(application.path_doc_comprovante)}>
                  View Document
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="destructive" onClick={handleDecline} className="gap-2">
            <X className="h-4 w-4" />
            Decline Application
          </Button>
          <Button onClick={handleApprove} className="gap-2 bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4" />
            Approve Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
