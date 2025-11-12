"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MedParkLogo } from "@/components/medpark-logo"
import { CheckCircle, Upload } from "lucide-react"
import Link from "next/link"

export default function ApplyMonthlyPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    rg: "",
    licensePlate: "",
    selectedPlan: "",
    personalDocument: null as File | null,
    proofOfEmployment: null as File | null,
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "cpf") {
      value = formatCPF(value)
    }
    setFormData((prev) => ({
      ...prev,
      [field]: field === "licensePlate" ? value.toUpperCase() : value,
    }))
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitted(true)
    setIsLoading(false)
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
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
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
                        placeholder="Enter your RG number"
                        value={formData.rg}
                        onChange={(e) => handleInputChange("rg", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">License Plate</Label>
                    <Input
                      id="licensePlate"
                      type="text"
                      placeholder="Enter your primary vehicle's license plate"
                      value={formData.licensePlate}
                      onChange={(e) => handleInputChange("licensePlate", e.target.value)}
                      required
                    />
                  </div>

                  {/* Plan selection dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="selectedPlan">Select your desired plan</Label>
                    <Select
                      value={formData.selectedPlan}
                      onValueChange={(value) => handleInputChange("selectedPlan", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a monthly plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plano-diurno">Plano Diurno (Funcionários)</SelectItem>
                        <SelectItem value="plano-noturno">Plano Noturno (Plantonistas)</SelectItem>
                        <SelectItem value="plano-integral">Plano Integral 24h (Médicos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Personal document upload */}
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
                          {formData.personalDocument
                            ? formData.personalDocument.name
                            : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-muted-foreground">Accepted files: .png, .jpg, .pdf</p>
                      </label>
                    </div>
                  </div>

                  {/* Proof of employment upload */}
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
                          {formData.proofOfEmployment
                            ? formData.proofOfEmployment.name
                            : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          (e.g., employee badge, official statement). Accepted files: .png, .jpg, .pdf
                        </p>
                      </label>
                    </div>
                  </div>

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
