"use client"
import { useState,useEffect } from "react"
import { Search, Plus, Check, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { ReviewApplicationModal } from "@/components/review-application-modal"
import { MonthlyParkerDetailsModal } from "@/components/monthly-parker-details-modal"
import api from "@/lib/api"

interface Application {
  id: number
  nome_completo: string
  plano_id: number
  created_at: string
  status: string
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

interface Parker {
  id: number
  nome_completo: string
  veiculo: { placa: string } | null
  assinatura: Assinatura | null
}

export default function MonthlyParkersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [registeredParkers, setRegisteredParkers] = useState<Parker[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedParker, setSelectedParker] = useState<Parker | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const userRole = "Admin" // TODO: Isso deve vir de um Contexto de Autenticação

  const fetchPageData = async () => {
    setIsLoading(true)
    try {
      // 1. Busca as solicitações (isso já funciona)
      const solRes = await api.get("/solicitacoes-mensalista/")
      setApplications(solRes.data.filter((app: Application) => app.status === "PENDENTE"))

      // 2. Busca a lista "magra" de mensalistas
      const menRes = await api.get("/mensalistas/")
      const mensalistasMagros: Parker[] = menRes.data
      
      // 3. "Enriquece" cada mensalista buscando sua assinatura ativa
      const mensalistasEnriquecidos = await Promise.all(
        mensalistasMagros.map(async (mensalista) => {
          try {
            // Tenta buscar a assinatura ativa que funciona
            const assinaturaRes = await api.get(`/assinaturas/mensalista/${mensalista.id}/ativa`)
            // Anexa a assinatura encontrada ao objeto do mensalista
            return { ...mensalista, assinatura: assinaturaRes.data }
          } catch (error) {
            // Se der 404 (sem assinatura ativa), só retorna o mensalista "magro"
            // (que já tem 'assinatura: null' do backend)
            return mensalista
          }
        })
      )

      setRegisteredParkers(mensalistasEnriquecidos)

    } catch (error) {
      console.error("Erro ao buscar dados da página:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPageData()
  }, [])

  const filteredParkers = registeredParkers.filter(
    (parker) =>
      parker.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parker.veiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleApprove = async (applicationId: number) => {
    try {
      await api.put(`/solicitacoes-mensalista/${applicationId}`, { status: "APROVADO" })
      await fetchPageData()
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error)
    }
    setIsReviewModalOpen(false) // Fecha o modal
  }

  const handleDecline = async (applicationId: number) => {
    try {
      await api.put(`/solicitacoes-mensalista/${applicationId}`, { status: "RECUSADO" })
      await fetchPageData()
    } catch (error) {
      console.error("Erro ao recusar solicitação:", error)
    }
    setIsReviewModalOpen(false)
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setIsReviewModalOpen(true)
  }

  const handleViewParkerDetails = (parker: Parker) => {
    setSelectedParker(parker)
    setIsDetailsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monthly Parkers</h1>
          <p className="text-muted-foreground mt-2">Search and manage registered subscribers</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or license plate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {userRole === "Admin" && (
                <Link href="/monthly-parkers/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Parker
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Requested Plan</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
            
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No pending applications at this time.
                    </TableCell>
                  </TableRow>
                ) : (
                applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.nome_completo}</TableCell>
                    <TableCell>{application.plano_id}</TableCell>{/* TODO: Buscar nome do plano */}
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 bg-transparent"
                          onClick={() => handleViewDetails(application)}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(application.id)}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDecline(application.id)}
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Monthly Parkers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell>
                  </TableRow>
                ) : filteredParkers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No monthly parkers found.
                    </TableCell>
                  </TableRow>
                ) : (
                filteredParkers.map((parker) => (
                  <TableRow key={parker.id}>
                    <TableCell className="font-medium">{parker.nome_completo}</TableCell>
                    <TableCell>{parker.veiculo?.placa || "N/A"}</TableCell>
                    {/* --- AGORA VAI FUNCIONAR --- */}
                    <TableCell>{parker.assinatura?.plano.nome || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                          variant={parker.assinatura?.status === "ATIVA" ? "default" : "destructive"}
                          className={
                            parker.assinatura?.status === "ATIVA"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                      >
                        {parker.assinatura?.status || "Sem Assinatura"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                        onClick={() => handleViewParkerDetails(parker)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedApplication && (
          <ReviewApplicationModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            application={selectedApplication}
            onApprove={handleApprove}
            onDecline={handleDecline}
          />
        )}

        {selectedParker && (
          <MonthlyParkerDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            parker={selectedParker}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
