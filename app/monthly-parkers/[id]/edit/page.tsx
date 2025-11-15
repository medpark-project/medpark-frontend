"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { ArrowLeft, Eye, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns" // Usaremos para formatar a data

// --- Interfaces para os dados ---
interface Plano {
  id: number
  nome: string
}
interface TipoVeiculo {
  id: number
  nome: string
}

interface Assinatura {
  id: number
  data_inicio: string
  status: string
  plano: { id: number; nome: string; preco_mensal: number }
}

// Interface para o estado do formulário
interface FormData {
  nome_completo: string
  email: string
  telefone: string | null
  cpf: string
  rg: string
  placa_veiculo: string
  modelo_veiculo: string | null
  cor_veiculo: string | null
  tipo_veiculo_id: string
  // Dados da assinatura
  assinatura_id: number | null
  plano_id: string // O ID do plano ATUAL ou NOVO
  data_inicio_assinatura: string
  status_assinatura: string
}

export default function EditMonthlyParkerPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  
  const mensalistaId = params.id as string
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const [originalPlanoId, setOriginalPlanoId] = useState<string | null>(null) // Para comparar se o plano mudou
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const [planos, setPlanos] = useState<Plano[]>([])
  const [tiposVeiculo, setTiposVeiculo] = useState<TipoVeiculo[]>([])

  // --- EFEITO PARA BUSCAR DADOS (Usando a "gambiarra elegante") ---
  useEffect(() => {
    if (!mensalistaId) return;

    const fetchPageData = async () => {
      setIsLoading(true)
      try {
        const [planosRes, tiposVeiculoRes, mensalistaRes] = await Promise.all([
          api.get("/planos-mensalista/"),
          api.get("/tipos-veiculo/"),
          api.get(`/mensalistas/${mensalistaId}`),
        ]);

        setPlanos(planosRes.data);
        setTiposVeiculo(tiposVeiculoRes.data);
        
        const mensalista = mensalistaRes.data
        
        // Tenta buscar a assinatura ativa separadamente
        let assinatura: Assinatura | null = null
        try {
          const assinaturaRes = await api.get(`/assinaturas/mensalista/${mensalistaId}/ativa`)
          assinatura = assinaturaRes.data
        } catch (e) {
          // Ignora o erro 404 (sem assinatura ativa)
        }

        // Preenche o formulário com todos os dados
        const planoIdString = String(assinatura?.plano?.id || "")
        setFormData({
          nome_completo: mensalista.nome_completo,
          email: mensalista.email,
          telefone: mensalista.telefone || "",
          cpf: mensalista.cpf,
          rg: mensalista.rg,
          placa_veiculo: mensalista.veiculo?.placa || "",
          modelo_veiculo: mensalista.veiculo?.modelo || "",
          cor_veiculo: mensalista.veiculo?.cor || "",
          tipo_veiculo_id: String(mensalista.veiculo?.tipo?.id || ""),
          assinatura_id: assinatura?.id || null,
          plano_id: planoIdString,
          status_assinatura: assinatura?.status || "INATIVA",
          data_inicio_assinatura: assinatura?.data_inicio || "",
        })
        
        setOriginalPlanoId(planoIdString) // Salva o plano original

      } catch (err) {
        console.error("Falha ao buscar dados:", err)
        setError("Não foi possível carregar os dados. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPageData()
  }, [mensalistaId])

  // --- LÓGICA DE SUBMISSÃO ATUALIZADA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.plano_id) {
        setError("O plano de estacionamento é obrigatório.")
        return
    }
    
    setIsSaving(true)
    setError("")

    try {
      // 1. Atualiza o Mensalista (nome, email, telefone)
      await api.put(`/mensalistas/${mensalistaId}`, {
        nome_completo: formData.nome_completo,
        email: formData.email,
        telefone: formData.telefone,
      })

      // 2. Atualiza o Veículo (modelo, cor)
      if (formData.placa_veiculo) {
        await api.put(`/veiculos/${formData.placa_veiculo}`, {
          modelo: formData.modelo_veiculo,
          cor: formData.cor_veiculo,
        })
      }

      // 3. LÓGICA DE MUDANÇA DE PLANO
      const planoMudou = String(formData.plano_id) !== String(originalPlanoId)
      
      if (planoMudou && formData.assinatura_id) {
        // 3a. Cancela a assinatura antiga
        await api.put(`/assinaturas/${formData.assinatura_id}`, {
          status: "CANCELADA",
          data_fim: format(new Date(), "yyyy-MM-dd"), // Data de hoje
        })
        
        // 3b. Cria a nova assinatura
        await api.post("/assinaturas/", {
          mensalista_id: parseInt(mensalistaId),
          plano_id: parseInt(formData.plano_id),
          data_inicio: format(new Date(), "yyyy-MM-dd"), // Data de hoje
        })
        
      } else if (planoMudou && !formData.assinatura_id) {
         // 3c. Se não tinha assinatura, apenas cria a nova
         await api.post("/assinaturas/", {
          mensalista_id: parseInt(mensalistaId),
          plano_id: parseInt(formData.plano_id),
          data_inicio: format(new Date(), "yyyy-MM-dd"),
        })
      } else if (!planoMudou && formData.assinatura_id) {
        // 3d. Se não mudou o plano, só atualiza o status (Ex: Ativa/Inativa)
        await api.put(`/assinaturas/${formData.assinatura_id}`, {
          status: formData.status_assinatura,
        })
      }

      toast({ title: "Sucesso!", description: "Dados do mensalista atualizados." })
      router.push("/monthly-parkers")

    } catch (err: any) {
      console.error("Erro ao salvar mensalista:", err)
      setError(err.response?.data?.detail || "Ocorreu um erro desconhecido.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "cpf" || field === "rg") return;
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  
  // (Lógica de documentos não está aqui, pois foi feita na solicitação)

  if (isLoading) {
    return (
      <DashboardLayout userRole="Admin">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4">Carregando dados do mensalista...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="Admin">
      {/* ... (Header) ... */}
      
        {/* Card de Subscriber Details (campos de nome, email, tel, cpf, rg) */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader><CardTitle>Subscriber Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={formData.nome_completo || ""} onChange={(e) => handleInputChange("nome_completo", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email || ""} onChange={(e) => handleInputChange("email", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={formData.telefone || ""} onChange={(e) => handleInputChange("telefone", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF (Não editável)</Label>
                  <Input id="cpf" value={formData.cpf || ""} readOnly disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg">RG (Não editável)</Label>
                  <Input id="rg" value={formData.rg || ""} readOnly disabled className="bg-muted/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        
        {/* Card de Vehicle (Placa, Modelo, Cor, Tipo) */}
        <Card>
          <CardHeader><CardTitle>Primary Vehicle</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate (Não editável)</Label>
                <Input id="licensePlate" value={formData.placa_veiculo || ""} readOnly disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Vehicle Model</Label>
                <Input id="vehicleModel" value={formData.modelo_veiculo || ""} onChange={(e) => handleInputChange("modelo_veiculo", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleColor">Vehicle Color</Label>
                <Input id="vehicleColor" value={formData.cor_veiculo || ""} onChange={(e) => handleInputChange("cor_veiculo", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <Label htmlFor="tipo_veiculo_id">Vehicle Type (Não editável)</Label>
              <Select value={formData.tipo_veiculo_id || ""} disabled>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {tiposVeiculo.map((tipo) => (
                    <SelectItem key={tipo.id} value={String(tipo.id)}>{tipo.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Card de Subscription Plan (AGORA EDITÁVEL) */}
        <Card>
          <CardHeader><CardTitle>Plan & Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parkingPlan">Parking Plan</Label>
                <Select
                  value={formData.plano_id || ""}
                  onValueChange={(value) => handleInputChange("plano_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {planos.map((plano) => (
                      <SelectItem key={plano.id} value={String(plano.id)}>{plano.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Subscription Start Date (Não editável)</Label>
                <Input id="startDate" type="date" value={formData.data_inicio_assinatura ? format(new Date(formData.data_inicio_assinatura), "yyyy-MM-dd") : ""} readOnly disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status_assinatura || ""} onValueChange={(value) => handleInputChange("status_assinatura", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVA">Ativa</SelectItem>
                    <SelectItem value="INATIVA">Inativa</SelectItem>
                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Link href="/monthly-parkers">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  )
}