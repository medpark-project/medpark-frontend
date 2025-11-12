"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Plan {
  id?: number
  name: string
  price: string
  description: string
}

interface AddEditPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: Plan) => void
  editingPlan?: Plan | null
}

export function AddEditPlanModal({ isOpen, onClose, onSave, editingPlan }: AddEditPlanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  })

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name,
        price: editingPlan.price.replace("R$ ", ""), // Remove R$ prefix for editing
        description: editingPlan.description,
      })
    } else {
      setFormData({
        name: "",
        price: "",
        description: "",
      })
    }
  }, [editingPlan, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const planData: Plan = {
      ...formData,
      price: `R$ ${formData.price}`, // Add R$ prefix back
    }

    if (editingPlan) {
      planData.id = editingPlan.id
    }

    onSave(planData)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingPlan ? `Edit Plan: ${editingPlan.name}` : "Add New Monthly Plan"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input
              id="plan-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
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
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the plan's rules and access hours..."
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#A0E7E5] hover:bg-[#8DD3D1] text-gray-900">
              Save Plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
