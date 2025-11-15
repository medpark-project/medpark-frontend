"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout" // Import DashboardLayout

import { ArrowLeft, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Plano {
  id: number
  nome: string
}
interface TipoVeiculo {
  id: number
  nome: string
}

export default function NewMonthlyParkerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [planos, setPlanos] = useState<Plano[]>([])
  const [tiposVeiculo, setTiposVeiculo] = useState<TipoVeiculo[]>([])

  const [formData, setFormData] = useState({
    nome_completo: "",
    email: "",
    telefone: "",
    cpf: "",
    rg: "",
    placa_veiculo: "",
    modelo_veiculo: "",
    cor_veiculo: "",
    plano_id: "",
    tipo_veiculo_id: "",
  })

  const [personalDocument, setPersonalDocument] = useState<File | null>(null)
  const [proofOfEmployment, setProofOfEmployment] = useState<File | null>(null)

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [planosRes, tiposVeiculoRes] = await Promise.all([
          api.get("/planos-mensalista/"), // Lembre-se que esta rota é pública
          api.get("/tipos-veiculo/")     // E esta também
        ]);
        setPlanos(planosRes.data);
        setTiposVeiculo(tiposVeiculoRes.data);
      } catch (err) {
        console.error("Falha ao buscar planos ou tipos de veículo", err)
        setError("Não foi possível carregar os dados. Tente novamente.")
      }
    }
    fetchPrerequisites()
  }, [])

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // 1. Validação Simples (Arquivos)
    if (!personalDocument || !proofOfEmployment) {
      setError("Ambos os documentos são obrigatórios.")
      setIsLoading(false)
      return
    }
    
    // 2. Monta o FormData para a API de Solicitação
    const apiFormData = new FormData();
    // Adiciona todos os campos de texto
    Object.entries(formData).forEach(([key, value]) => {
      if (value) apiFormData.append(key, value);
    });
    // Adiciona os arquivos
    apiFormData.append("doc_pessoal", personalDocument);
    apiFormData.append("doc_comprovante", proofOfEmployment);

    try {
      // 3. PASSO 1: Cria a Solicitação Pendente
      const responseCreate = await api.post("/solicitacoes-mensalista/", apiFormData, {
        headers: {
          // O Axios define o Content-Type como multipart/form-data automaticamente
          // mas o token de autenticação é necessário!
          Authorization: `Bearer ${localStorage.getItem("medpark_token")}`
        }
      })
      
      const solicitacaoCriada = responseCreate.data;

      // 4. PASSO 2: Aprova a Solicitação Imediatamente
      const responseApprove = await api.put(
        `/solicitacoes-mensalista/${solicitacaoCriada.id}`,
        { status: "APROVADO" }
      )
      
      // 5. Sucesso!
      toast({
        title: "Mensalista Registrado!",
        description: `${responseApprove.data.nome_completo} foi criado com sucesso.`
      })
      router.push("/monthly-parkers")

    } catch (err: any) {
      console.error("Erro ao registrar mensalista:", err)
      if (err.response?.data?.detail) {
        setError(Array.isArray(err.response.data.detail) ? err.response.data.detail[0].msg : err.response.data.detail);
      } else {
        setError("Ocorreu um erro desconhecido.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "cpf") {
      value = formatCPF(value)
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePersonalDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPersonalDocument(file)
    }
  }

  const handleProofOfEmploymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofOfEmployment(file)
    }
  }

  return (
    <DashboardLayout userRole="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/monthly-parkers">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Register New Monthly Parker</h1>
            <p className="text-muted-foreground mt-2">Add a new subscriber to the monthly parking system</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.nome_completo}
                    onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    maxLength={14}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    type="text"
                    placeholder="Enter RG number"
                    value={formData.rg}
                    onChange={(e) => handleInputChange("rg", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Campo Placa */}
                <div className="space-y-2">
                  <Label htmlFor="placa_veiculo">License Plate</Label>
                  <Input
                    id="placa_veiculo"
                    value={formData.placa_veiculo}
                    onChange={(e) => handleInputChange("placa_veiculo", e.target.value)}
                    placeholder="ABC-1234"
                    required
                  />
                </div>

                  {/* --- NOVO CAMPO MODELO --- */}
                  <div className="space-y-2">
                    <Label htmlFor="modelo_veiculo">Vehicle Model</Label>
                    <Input
                      id="modelo_veiculo"
                      value={formData.modelo_veiculo}
                      onChange={(e) => handleInputChange("modelo_veiculo", e.target.value)}
                      placeholder="Honda Civic"
                    />
                  </div>

                  {/* --- NOVO CAMPO COR --- */}
                  <div className="space-y-2">
                    <Label htmlFor="cor_veiculo">Vehicle Color</Label>
                    <Input
                      id="cor_veiculo"
                      value={formData.cor_veiculo}
                      onChange={(e) => handleInputChange("cor_veiculo", e.target.value)}
                      placeholder="White"
                    />
                  </div>
                </div>

        
                <div className="space-y-2 pt-4">
                  <Label htmlFor="tipo_veiculo_id">Vehicle Type</Label>
                  <Select
                    value={formData.tipo_veiculo_id}
                    onValueChange={(value) => handleInputChange("tipo_veiculo_id", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposVeiculo.map((tipo) => (
                        <SelectItem key={tipo.id} value={String(tipo.id)}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              
            </CardContent>
          </Card>

          {/* Subscription Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plano_id">Parking Plan</Label>
                <Select
                  value={formData.plano_id}
                  onValueChange={(value) => handleInputChange("plano_id", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {planos.map((plano) => (
                      <SelectItem key={plano.id} value={String(plano.id)}>
                        {plano.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Uploads */}
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personalDocument">Personal Document (ID)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <input
                      id="personalDocument"
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handlePersonalDocumentChange}
                      className="hidden"
                    />
                    <label htmlFor="personalDocument" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {personalDocument ? personalDocument.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Accepted files: .png, .jpg, .jpeg, .pdf</p>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proofOfEmployment">Proof of Employment</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <input
                      id="proofOfEmployment"
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleProofOfEmploymentChange}
                      className="hidden"
                    />
                    <label htmlFor="proofOfEmployment" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {proofOfEmployment ? proofOfEmployment.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        (e.g., employee badge). Accepted files: .png, .jpg, .pdf
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensagem de Erro */}
          {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
          <Link href="/monthly-parkers">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </form>
      </div>
    </DashboardLayout>
  )
}
