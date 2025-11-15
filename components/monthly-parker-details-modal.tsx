"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Mail, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import api from "@/lib/api"

// Interface para o resumo que vem da página principal
interface ParkerSummary {
  id: number
  nome_completo: string
}

interface MonthlyParkerDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  parker: ParkerSummary | null
}

interface Assinatura {
  id: number
  data_inicio: string
  data_fim: string | null
  status: string
  mensalista_id: number
  plano: {
    id: number
    nome: string
    preco_mensal: number
    descricao: string
  }
}

interface ParkerDetails {
  nome_completo: string
  email: string
  telefone: string | null
  cpf: string
  rg: string
  veiculo: {
    placa: string
    modelo: string | null
    cor: string | null
  } | null
  assinatura: Assinatura | null
}

export function MonthlyParkerDetailsModal({ isOpen, onClose, parker }: MonthlyParkerDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const { toast } = useToast()

  const [detailedData, setDetailedData] = useState<ParkerDetails | null>(null)

  useEffect(() => {
    if (isOpen && parker) {
      const fetchDetails = async () => {
        setIsLoading(true)
        setDetailedData(null)
        
        try {
          // 1. Busca os dados "magros" do mensalista (pessoais + veículo)
          const mensalistaPromise = api.get(`/mensalistas/${parker.id}`)
          
          // 2. Busca a assinatura ativa (o endpoint que sabemos que funciona)
          const assinaturaPromise = api.get(`/assinaturas/mensalista/${parker.id}/ativa`)

          // 3. Executa as duas chamadas em paralelo
          const [mensalistaRes, assinaturaRes] = await Promise.all([
            mensalistaPromise,
            assinaturaPromise
          ])

          // 4. Combina os resultados!
          const dadosCompletos = mensalistaRes.data as MensalistaDetails
          dadosCompletos.assinatura = assinaturaRes.data // Sobrescreve o 'null' com os dados reais
          
          setDetailedData(dadosCompletos)

        } catch (error: any) {
          // Se a falha for 404 (assinatura não encontrada), ainda queremos mostrar o resto
          if (error.response && error.response.status === 404) {
            // A assinatura não foi encontrada, mas o mensalista sim (provavelmente)
            // Vamos tentar buscar apenas o mensalista
            try {
              const mensalistaRes = await api.get(`/mensalistas/${parker.id}`)
              setDetailedData(mensalistaRes.data) // Virá com 'assinatura: null'
            } catch (innerError) {
              setError("Não foi possível carregar os detalhes do mensalista.")
            }
          } else {
            console.error("Erro ao buscar detalhes do mensalista:", error)
            setError("Não foi possível carregar os detalhes.")
          }
        } finally {
          setIsLoading(false)
        }
      }
      fetchDetails()
    }
  }, [isOpen, parker])

  const [error, setError] = useState("")

  const handleSendPaymentHistory = async () => {
    if (!detailedData?.email) return
    setIsSendingEmail(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSendingEmail(false)
    toast({
      title: "Histórico enviado!",
      description: `Histórico de pagamento enviado para ${detailedData.email}`,
    })
  }

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // --- NOVA FUNÇÃO AUXILIAR ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Details for {parker?.nome_completo}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !detailedData ? (
          <div className="text-center h-64 text-red-600">
            Erro: Não foi possível carregar os dados. Por favor, tente novamente.
          </div>
        ) : (
          // --- CONTEÚDO CONECTADO ---
          <div className="space-y-6">
            {/* Personal Details - AGORA CONECTADO */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Personal Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="font-medium">{detailedData.nome_completo}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">RG</label>
                    <p className="font-medium">{detailedData.rg}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CPF</label>
                    <p className="font-medium">{detailedData.cpf}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="font-medium">{detailedData.telefone || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{detailedData.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Details - AGORA CONECTADO */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Vehicle Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">License Plate</label>
                    <p className="font-medium">{detailedData.veiculo?.placa || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Model</label>
                    <p className="font-medium">{detailedData.veiculo?.modelo || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Color</label>
                    <p className="font-medium">{detailedData.veiculo?.cor || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Details - CONECTADO (COM A GAMBIARRA) */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Subscription Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Plan</label>
                    <p className="font-medium">{detailedData.assinatura?.plano.nome || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={detailedData.assinatura?.status === "ATIVA" ? "default" : "destructive"}>
                      {detailedData.assinatura?.status || "N/A"}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="font-medium">{formatDate(detailedData.assinatura?.data_inicio)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Next Billing</label>
                    <p className="font-medium">{"N/A"}</p> {/* Este campo não está na nossa API ainda */}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Monthly Fee</label>
                    <p className="font-medium text-primary">
                      {formatCurrency(detailedData.assinatura?.plano.preco_mensal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons (Já estavam corretos) */}
            <div className="flex gap-3 pt-4">
              <Link href={`/monthly-parkers/${parker?.id}/edit`}>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Edit className="h-4 w-4" /> Edit Subscriber
                </Button>
              </Link>
              <Button
                className="gap-2 flex-1 bg-primary hover:bg-primary/90"
                onClick={handleSendPaymentHistory}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {isSendingEmail ? "Sending..." : "Send Payment History to Email"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}