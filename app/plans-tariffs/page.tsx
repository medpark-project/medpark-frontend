"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react"
import { AddEditPlanModal } from "@/components/add-edit-plan-modal"
import api from "@/lib/api" // Importa nosso "gerente" de API
import { useToast } from "@/hooks/use-toast"

interface TipoVeiculo {
  id: number
  nome: string
  tarifa_hora: number
}

interface Plano {
  id: number
  nome: string
  preco_mensal: number
  descricao: string
}

export default function PlansTariffsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingRates, setIsSavingRates] = useState(false)
  
  // Nossos estados agora são para os objetos da API
  const [tiposVeiculo, setTiposVeiculo] = useState<TipoVeiculo[]>([])
  const [monthlyPlans, setMonthlyPlans] = useState<Plano[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plano | null>(null)

  const fetchPageData = async () => {
    setIsLoading(true)
    try {
      // Busca as duas listas em paralelo (são rotas públicas)
      const [tiposRes, planosRes] = await Promise.all([
        api.get("/tipos-veiculo/"),
        api.get("/planos-mensalista/")
      ])
      setTiposVeiculo(tiposRes.data)
      setMonthlyPlans(planosRes.data)
    } catch (error) {
      console.error("Erro ao buscar dados da página:", error)
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os dados." })
    } finally {
      setIsLoading(false)
    }
  }

  // --- MUDANÇA: Busca os dados quando a página carrega ---
  useEffect(() => {
    fetchPageData()
  }, []) // O array vazio [] faz isso rodar uma vez

  // --- MUDANÇA: Lógica de salvar Tarifas conectada ---
  const handleRateChange = (id: number, value: string) => {
    // Converte a string (ex: "12,00") para um número
    const tarifa = parseFloat(value.replace(",", ".")) || 0
    setTiposVeiculo((prev) =>
      prev.map((tipo) => (tipo.id === id ? { ...tipo, tarifa_hora: tarifa } : tipo))
    )
  }

  const handleSaveRates = async () => {
    setIsSavingRates(true)
    try {
      // Cria um array de promessas, uma para cada PUT
      const updatePromises = tiposVeiculo.map((tipo) =>
        api.put(`/tipos-veiculo/${tipo.id}`, {
          nome: tipo.nome, // O PUT do tipo_veiculo espera o nome
          tarifa_hora: tipo.tarifa_hora
        })
      )
      // Executa todas as atualizações em paralelo
      await Promise.all(updatePromises)
      
      toast({ title: "Sucesso!", description: "Tarifas por hora atualizadas." })
    } catch (error) {
      console.error("Erro ao salvar tarifas:", error)
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar as tarifas." })
    } finally {
      setIsSavingRates(false)
    }
  }

  // --- MUDANÇA: Lógica de CRUD de Planos conectada ---
  const handleEditPlan = (plan: Plano) => { // Recebe o objeto 'plano'
    setEditingPlan(plan)
    setIsModalOpen(true)
  }

  const handleDeletePlan = async (planId: number) => {
    if (confirm("Tem certeza que deseja deletar este plano?")) {
      try {
        await api.delete(`/planos-mensalista/${planId}`)
        toast({ title: "Sucesso!", description: "Plano deletado." })
        // Atualiza a lista removendo o item deletado
        setMonthlyPlans((prev) => prev.filter((p) => p.id !== planId))
      } catch (error) {
        console.error("Erro ao deletar plano:", error)
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível deletar o plano." })
      }
    }
  }

  const handleAddNewPlan = () => {
    setEditingPlan(null)
    setIsModalOpen(true)
  }

  const handleSavePlan = async (planData: Omit<Plano, "id"> & { id?: number }) => {
    try {
      if (planData.id) {
        // Editando plano existente
        await api.put(`/planos-mensalista/${planData.id}`, planData)
      } else {
        // Adicionando novo plano
        await api.post("/planos-mensalista/", planData)
      }
      
      toast({ title: "Sucesso!", description: `Plano ${planData.id ? 'atualizado' : 'criado'}.` })
      fetchPageData() // Recarrega todos os dados
      
    } catch (error) {
      console.error("Erro ao salvar plano:", error)
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o plano." })
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPlan(null)
  }

  const formatRate = (rate: number) => {
    return rate.toFixed(2).replace(".", ",")
  }
  
  // Função para formatar o preço para a tabela (ex: 180.0 -> "R$ 180,00")
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <DashboardLayout userRole="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Plans & Tariffs</h1>
          <p className="text-muted-foreground">
            Manage hourly rates for casual users and subscription plans for monthly parkers.
          </p>
        </div>

        {/* Hourly Rates Card */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {isLoading ? (
                <p className="text-muted-foreground">Carregando tarifas...</p>
              ) : (
                tiposVeiculo.map((tipo) => (
                  <div className="space-y-2" key={tipo.id}>
                    <Label htmlFor={`rate-${tipo.id}`}>{tipo.nome} Rate (/hr)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                      <Input
                        id={`rate-${tipo.id}`}
                        type="text"
                        value={formatRate(tipo.tarifa_hora)}
                        onChange={(e) => handleRateChange(tipo.id, e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button onClick={handleSaveRates} disabled={isSavingRates}>
              {isSavingRates ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Plans Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Monthly Subscription Plans</CardTitle>
            <Button onClick={handleAddNewPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Plan
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                {/* ... (Cabeçalho da Tabela) ... */}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Carregando planos...</TableCell>
                  </TableRow>
                ) : monthlyPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No monthly plans created yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  monthlyPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.nome}</TableCell>
                      <TableCell>{formatCurrency(plan.preco_mensal)}</TableCell>
                      <TableCell className="max-w-md">{plan.descricao}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)} className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
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

        <AddEditPlanModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSavePlan}
          editingPlan={editingPlan}
        />
      </div>
    </DashboardLayout>
  )
}
