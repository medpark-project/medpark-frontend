"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react" // Importa o ícone de loading

interface PlanoAPI {
  id?: number
  nome: string
  preco_mensal: number // É um número!
  descricao: string
}

interface AddEditPlanModalProps {
  isOpen: boolean
  onClose: () => void
  // onSave agora espera o formato da API e é uma Promise (async)
  onSave: (plan: Omit<PlanoAPI, "id"> & { id?: number }) => Promise<void>
  editingPlan?: PlanoAPI | null
}

export function AddEditPlanModal({ isOpen, onClose, onSave, editingPlan }: AddEditPlanModalProps) {
  const [formData, setFormData] = useState({
    nome: "",
    preco_mensal: "", // Usaremos string no formulário, mas converteremos
    descricao: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  // --- MUDANÇA: useEffect para lidar com os tipos de dados da API ---
  useEffect(() => {
    if (editingPlan) {
      // Se está editando, preenche o formulário com os dados da API
      setFormData({
        nome: editingPlan.nome,
        // Converte o número (ex: 180.0) para uma string "180,00"
        preco_mensal: editingPlan.preco_mensal.toFixed(2).replace(".", ","),
        descricao: editingPlan.descricao,
      })
    } else {
      // Se está adicionando, limpa o formulário
      setFormData({
        nome: "",
        preco_mensal: "",
        descricao: "",
      })
    }
  }, [editingPlan, isOpen]) // Roda sempre que o modal abre

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Converte o preço de string (ex: "180,00") para número (ex: 180.00)
    const precoComoNumero = parseFloat(formData.preco_mensal.replace(",", ".")) || 0

    // Monta o objeto de dados no formato que a API espera
    const planDataAPI: Omit<PlanoAPI, "id"> & { id?: number } = {
      nome: formData.nome,
      preco_mensal: precoComoNumero,
      descricao: formData.descricao,
    }

    if (editingPlan) {
      planDataAPI.id = editingPlan.id
    }

    try {
      // Chama a função 'onSave' (que está no pai e é async)
      await onSave(planDataAPI)
      onClose() // Fecha o modal SÓ se o 'onSave' for bem-sucedido
    } catch (error) {
      // O 'onSave' (no pai) já mostra o toast de erro,
      // então aqui só precisamos parar o loading
      console.error("Falha ao salvar o plano:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingPlan ? `Edit Plan: ${editingPlan.nome}` : "Add New Monthly Plan"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input
              id="plan-name"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
              placeholder="Enter plan name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly-price">Monthly Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
              <Input
                id="monthly-price"
                type="text"
                value={formData.preco_mensal}
                onChange={(e) => setFormData((prev) => ({ ...prev, preco_mensal: e.target.value }))}
                className="pl-8"
                placeholder="180,00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.descricao}
              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
              placeholder="Describe the plan's rules and access hours..."
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
