"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Check, X } from "lucide-react"

interface ReviewApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  application: {
    id: number
    applicantName: string
    requestedPlan: string
    dateOfRequest: string
    email?: string
    phone?: string
    licensePlate?: string
    cpf?: string
    rg?: string
  }
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
  const handleApprove = () => {
    onApprove(application.id)
    onClose()
  }

  const handleDecline = () => {
    onDecline(application.id)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Application Details: {application.applicantName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submitted Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Submitted Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm">{application.applicantName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{application.email || "joao.silva@email.com"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <p className="text-sm">{application.phone || "(11) 99999-9999"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">CPF</label>
                <p className="text-sm">{application.cpf || "123.456.789-00"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">RG</label>
                <p className="text-sm">{application.rg || "12.345.678-9"}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Requested Plan</label>
                <p className="text-sm">
                  <Badge variant="outline" className="mt-1">
                    {application.requestedPlan}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">License Plate</label>
                <p className="text-sm">{application.licensePlate || "ABC-1234"}</p>
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
                  <p className="text-xs text-muted-foreground">ID_Roberto_Silva.pdf</p>
                </div>
                <Button variant="outline" size="sm">
                  View Document
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Proof of Employment</p>
                  <p className="text-xs text-muted-foreground">Employee_Badge_Roberto.jpg</p>
                </div>
                <Button variant="outline" size="sm">
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
