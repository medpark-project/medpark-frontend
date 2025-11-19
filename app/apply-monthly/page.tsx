"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MedParkLogo } from "@/components/medpark-logo"
import { CheckCircle, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api" // Importa nosso "gerente" de API
import { useToast } from "@/hooks/use-toast" // Usaremos o toast para erros

interface Plano {
  id: number
  nome: string
}
interface TipoVeiculo {
  id: number
  nome: string
}

export default function ApplyMonthlyPage() {
  const { toast } = useToast()
  
  // --- MUDANÇA: Nomes de campos alinhados com a API ---
  const [formData, setFormData] = useState({
    nome_completo: "",
    email: "",
    telefone: "",
    cpf: "",
    rg: "",
    placa_veiculo: "",
    modelo_veiculo: "", // Adicionado
    cor_veiculo: "",    // Adicionado
    plano_id: "",         // Renomeado
    tipo_veiculo_id: "",  // Adicionado
  })
  
  const [personalDocument, setPersonalDocument] = useState<File | null>(null)
  const [proofOfEmployment, setProofOfEmployment] = useState<File | null>(null)
  
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("") // Para erros de formulário

  // --- NOVOS ESTADOS para os dropdowns ---
  const [planos, setPlanos] = useState<Plano[]>([])
  const [tiposVeiculo, setTiposVeiculo] = useState<TipoVeiculo[]>([])

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        // Lembre-se que estas rotas são públicas!
        const [planosRes, tiposVeiculoRes] = await Promise.all([
          api.get("/planos-mensalista/"),
          api.get("/tipos-veiculo/")
        ]);
        setPlanos(planosRes.data);
        setTiposVeiculo(tiposVeiculoRes.data);
      } catch (err) {
        console.error("Falha ao buscar planos ou tipos de veículo", err)
        setError("Não foi possível carregar os planos. Tente novamente mais tarde.")
      }
    }
    fetchPrerequisites()
  }, []) // O array vazio [] faz isso rodar uma vez no carregamento

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11)
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    if (field === "cpf") {
      formattedValue = formatCPF(value)
    } else if (field === "placa_veiculo") {
      formattedValue = value.toUpperCase()
    }
    setFormData((prev) => ({ ...prev, [field]: formattedValue }))
  }

  const handleFileChange = (field: "personalDocument" | "proofOfEmployment", file: File | null) => {
    if (field === "personalDocument") setPersonalDocument(file)
    else if (field === "proofOfEmployment") setProofOfEmployment(file)
  }

  // --- MUDANÇA: handleSubmit agora chama a API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!personalDocument || !proofOfEmployment) {
      setError("Ambos os documentos são obrigatórios.")
      setIsLoading(false)
      return
    }

    // 1. Monta o FormData para a API
    const apiFormData = new FormData();
    
    // Adiciona todos os campos de texto do estado
    // (O Pydantic no backend vai ignorar 'modelo_veiculo' e 'cor_veiculo' se estiverem vazios)
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        apiFormData.append(key, value);
      }
    });
    
    // Adiciona os arquivos
    apiFormData.append("doc_pessoal", personalDocument);
    apiFormData.append("doc_comprovante", proofOfEmployment);

    try {
      // 2. Envia para o endpoint de Solicitação (NÃO precisa de token)
      await api.post("/solicitacoes-mensalista/", apiFormData, {
        headers: {
          // 'Content-Type': 'multipart/form-data' é definido automaticamente
          // pelo axios/navegador ao enviar FormData
        }
      })
      
      // 3. Sucesso!
      setIsSubmitted(true)

    } catch (err: any) {
      console.error("Erro ao enviar solicitação:", err)
      if (err.response?.data?.detail) {
        // Mostra erros de validação da API (ex: "placa já cadastrada")
        const detail = err.response.data.detail
        setError(Array.isArray(detail) ? detail[0].msg : String(detail));
      } else {
        setError("Ocorreu um erro desconhecido. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <MedParkLogo className="h-10" />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Monthly Parker Application</h1>
            <p className="text-muted-foreground">Fill out the form below to apply for our monthly parking plan</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome_completo">Full Name</Label>
                    <Input id="nome_completo" value={formData.nome_completo} onChange={(e) => handleInputChange("nome_completo", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Phone Number</Label>
                    <Input id="telefone" type="tel" value={formData.telefone} onChange={(e) => handleInputChange("telefone", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input id="cpf" value={formData.cpf} onChange={(e) => handleInputChange("cpf", e.target.value)} maxLength={14} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rg">RG</Label>
                      <Input id="rg" value={formData.rg} onChange={(e) => handleInputChange("rg", e.target.value)} required />
                    </div>
                  </div>

                  {/* --- CAMPOS DO VEÍCULO (Adicionados/Corrigidos) --- */}
                  <div className="space-y-2">
                    <Label htmlFor="placa_veiculo">License Plate</Label>
                    <Input id="placa_veiculo" value={formData.placa_veiculo} onChange={(e) => handleInputChange("placa_veiculo", e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="modelo_veiculo">Vehicle Model</Label>
                      <Input id="modelo_veiculo" value={formData.modelo_veiculo} onChange={(e) => handleInputChange("modelo_veiculo", e.target.value)} placeholder="e.g., Honda Civic" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cor_veiculo">Vehicle Color</Label>
                      <Input id="cor_veiculo" value={formData.cor_veiculo} onChange={(e) => handleInputChange("cor_veiculo", e.target.value)} placeholder="e.g., White" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipo_veiculo_id">Vehicle Type</Label>
                      <Select value={formData.tipo_veiculo_id} onValueChange={(value) => handleInputChange("tipo_veiculo_id", value)} required>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {tiposVeiculo.map((tipo) => (
                            <SelectItem key={tipo.id} value={String(tipo.id)}>
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* --- SELEÇÃO DE PLANO (Dinâmico) --- */}
                  <div className="space-y-2">
                    <Label htmlFor="plano_id">Select your desired plan</Label>
                    <Select value={formData.plano_id} onValueChange={(value) => handleInputChange("plano_id", value)} required>
                      <SelectTrigger><SelectValue placeholder="Choose a monthly plan" /></SelectTrigger>
                      <SelectContent>
                        {planos.map((plano) => (
                          <SelectItem key={plano.id} value={String(plano.id)}>
                            {plano.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* --- Upload de Arquivos (Conectado) --- */}
                  <div className="space-y-2">
                    <Label htmlFor="personalDocument">Personal Document (ID card or Driver's License)</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <input
                        id="personalDocument"
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) => handleFileChange("personalDocument", e.target.files?.[0] || null)}
                        className="hidden"
                        required
                      />
                      <label htmlFor="personalDocument" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          {personalDocument ? personalDocument.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-muted-foreground">Accepted files: .png, .jpg, .pdf</p>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proofOfEmployment">Proof of employment/link with the hospital</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <input
                        id="proofOfEmployment"
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) => handleFileChange("proofOfEmployment", e.target.files?.[0] || null)}
                        className="hidden"
                        required
                      />
                      <label htmlFor="proofOfEmployment" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          {proofOfEmployment ? proofOfEmployment.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          (e.g., employee badge). Accepted files: .png, .jpg, .pdf
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Mostra erros de validação da API */}
                  {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  )}

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? "Sending Application..." : "Send Application Request"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Thank you!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your application has been sent. Our team will contact you soon.
                  </p>
                  <Link href="/">
                    <Button variant="outline">Return to Homepage</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
