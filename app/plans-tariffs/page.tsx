"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Plus } from "lucide-react"
import { AddEditPlanModal } from "@/components/add-edit-plan-modal"

interface Plan {
  id: number
  name: string
  price: string
  description: string
}

export default function PlansTariffsPage() {
  const [hourlyRates, setHourlyRates] = useState({
    motorcycle: "8,00",
    car: "12,00",
    suv: "18,00",
  })

  const [monthlyPlans, setMonthlyPlans] = useState<Plan[]>([
    {
      id: 1,
      name: "Plano Diurno (Funcionários)",
      price: "R$ 180,00",
      description: "Acesso de Seg a Sex, das 07h às 19h.",
    },
    {
      id: 2,
      name: "Plano Noturno (Plantonistas)",
      price: "R$ 150,00",
      description: "Acesso todos os dias, das 19h às 07h.",
    },
    {
      id: 3,
      name: "Plano Integral 24h (Médicos)",
      price: "R$ 250,00",
      description: "Acesso ilimitado 24/7.",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const handleRateChange = (type: string, value: string) => {
    setHourlyRates((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const handleSaveRates = () => {
    // Handle save logic here
    console.log("Saving hourly rates:", hourlyRates)
  }

  const handleEditPlan = (planId: number) => {
    const plan = monthlyPlans.find((p) => p.id === planId)
    if (plan) {
      setEditingPlan(plan)
      setIsModalOpen(true)
    }
  }

  const handleDeletePlan = (planId: number) => {
    // Handle delete plan logic here
    console.log("Deleting plan:", planId)
  }

  const handleAddNewPlan = () => {
    setEditingPlan(null)
    setIsModalOpen(true)
  }

  const handleSavePlan = (planData: Omit<Plan, "id"> & { id?: number }) => {
    if (planData.id) {
      // Editing existing plan
      setMonthlyPlans((prev) => prev.map((plan) => (plan.id === planData.id ? { ...planData, id: planData.id } : plan)))
    } else {
      // Adding new plan
      const newId = Math.max(...monthlyPlans.map((p) => p.id)) + 1
      setMonthlyPlans((prev) => [...prev, { ...planData, id: newId }])
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPlan(null)
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
              <div className="space-y-2">
                <Label htmlFor="motorcycle-rate">Motorcycle Rate (/hr)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                  <Input
                    id="motorcycle-rate"
                    type="text"
                    value={hourlyRates.motorcycle}
                    onChange={(e) => handleRateChange("motorcycle", e.target.value)}
                    className="pl-8"
                    placeholder="8,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="car-rate">Car Rate (/hr)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                  <Input
                    id="car-rate"
                    type="text"
                    value={hourlyRates.car}
                    onChange={(e) => handleRateChange("car", e.target.value)}
                    className="pl-8"
                    placeholder="12,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="suv-rate">SUV / Van Rate (/hr)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                  <Input
                    id="suv-rate"
                    type="text"
                    value={hourlyRates.suv}
                    onChange={(e) => handleRateChange("suv", e.target.value)}
                    className="pl-8"
                    placeholder="18,00"
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSaveRates} className="bg-[#A0E7E5] hover:bg-[#8DD3D1] text-gray-900">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Plans Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Monthly Subscription Plans</CardTitle>
            <Button onClick={handleAddNewPlan} className="bg-[#A0E7E5] hover:bg-[#8DD3D1] text-gray-900">
              <Plus className="h-4 w-4 mr-2" />
              Add New Plan
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.price}</TableCell>
                    <TableCell className="max-w-md">{plan.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPlan(plan.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
