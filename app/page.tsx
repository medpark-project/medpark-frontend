"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MedParkLogo } from "@/components/medpark-logo"
import { LoginModal } from "@/components/login-modal"
import { SelfServicePaymentModal } from "@/components/self-service-payment-modal"
import { Search, CreditCard, Users, Clock, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api" // Importa nossa API

export default function HomePage() {
  const [casualPlate, setCasualPlate] = useState("")
  const [monthlyPlate, setMonthlyPlate] = useState("")
  
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const [showSelfServicePayment, setShowSelfServicePayment] = useState(false)
  const [paymentIdentifier, setPaymentIdentifier] = useState("") // Placa ou ID
  const [paymentUserType, setPaymentUserType] = useState<"casual" | "monthly">("casual")
  
  const [showCasualDetails, setShowCasualDetails] = useState(false)
  const [casualTicketData, setCasualTicketData] = useState<any>(null)
  const [isLoadingCasual, setIsLoadingCasual] = useState(false)
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false)
  const [casualError, setCasualError] = useState("")

  const [showMonthlyDetails, setShowMonthlyDetails] = useState(false)
  const [monthlySubscriptionData, setMonthlySubscriptionData] = useState<any>(null)

  const handleCasualCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!casualPlate.trim()) return

    setIsLoadingCasual(true)
    setCasualError("")
    setShowCasualDetails(false)

    try {
      const response = await api.get(`/estacionamento/saida/calcular/${casualPlate.toUpperCase()}`)
      const data = response.data

      if (data.valor_pago === 0) {
        setCasualError("Este veículo é de um mensalista ou está no período de carência. Saída liberada.")
        return
      }

      setCasualTicketData({
        licensePlate: data.veiculo_placa,
        entryTime: new Date(data.hora_entrada + "Z").toLocaleString(), 
        duration: "Calculated at exit", 
        totalAmount: `R$ ${data.valor_pago.toFixed(2)}`,
        rawAmount: data.valor_pago // Guardamos o valor real
      })
      
      setShowCasualDetails(true)

    } catch (err: any) {
      console.error("Erro ao buscar ticket:", err)
      if (err.response?.status === 404) {
         setCasualError("Veículo não encontrado no pátio.")
      } else {
         setCasualError("Erro ao consultar o sistema.")
      }
    } finally {
      setIsLoadingCasual(false)
    }
  }

  const handleCasualPayment = () => {

    setPaymentIdentifier(casualTicketData.licensePlate)
    setPaymentUserType("casual")
    setShowSelfServicePayment(true)
  }
  
  const resetCasualFlow = () => {
    setShowCasualDetails(false)
    setCasualPlate("")
    setCasualTicketData(null)
    setCasualError("")
  }

  const handleMonthlyCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monthlyPlate.trim()) return

    setIsLoadingMonthly(true)
    
    try {
      const response = await api.get(`/mensalistas/publico/status/${monthlyPlate.toUpperCase()}`)
      const data = response.data
      
      let monthName = "";
      if (data.data_vencimento) {
          const date = new Date(data.data_vencimento);
          monthName = date.toLocaleString('en-US', { month: 'long' });
      }
      
      setMonthlySubscriptionData({
        licensePlate: monthlyPlate.toUpperCase(),
        userName: data.nome_completo,
        plan: data.plano_nome,
        status: data.status_assinatura,
        nextBillDate: data.data_vencimento ? new Date(data.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "N/A",
        hasPendingBill: !!data.fatura_pendente_id,
        pendingAmount: data.valor_pendente ? `R$ ${data.valor_pendente.toFixed(2)}` : "",
        faturaId: data.fatura_pendente_id,
        monthName: monthName 
      })
      
      setShowMonthlyDetails(true)

    } catch (err: any) {
       console.error("Erro ao buscar assinatura:", err)
       alert("Mensalista não encontrado ou erro no sistema.")
    } finally {
       setIsLoadingMonthly(false)
    }
  }

  const resetMonthlyFlow = () => {
     setShowMonthlyDetails(false)
     setMonthlyPlate("")
  }

  const handleSelfServicePaymentClose = () => {
    setShowSelfServicePayment(false)
    resetCasualFlow()
    resetMonthlyFlow()
  }

  const handleMonthlyPayment = () => {
    
    if (monthlySubscriptionData?.faturaId) {
        setPaymentIdentifier(String(monthlySubscriptionData.faturaId)) // Converte ID para string
        setPaymentUserType("monthly")
        setShowSelfServicePayment(true)
    } else {
        console.error("Erro: Nenhuma fatura pendente encontrada para pagar.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 bg-card">
          <MedParkLogo className="h-10" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Pay Your Parking Ticket Easily
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Enter your license plate below to check the amount and pay online.
          </p>

          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              {!showCasualDetails ? (
                <form onSubmit={handleCasualCheck} className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter license plate (e.g., ABC-1234)"
                      value={casualPlate}
                      onChange={(e) => setCasualPlate(e.target.value.toUpperCase())}
                      className="pr-10"
                      required
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {casualError && <p className="text-sm text-red-600">{casualError}</p>}
                  
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoadingCasual}>
                    {isLoadingCasual ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CreditCard className="mr-2 h-4 w-4" />}
                    {isLoadingCasual ? "Checking..." : "Check Ticket"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Payment Details</h3>
                  </div>

                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">License Plate:</span>
                      <span className="font-medium">{casualTicketData?.licensePlate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Entry Time:</span>
                      <span className="font-medium">{casualTicketData?.entryTime}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-4">Total: {casualTicketData?.totalAmount}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleCasualPayment}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" onClick={resetCasualFlow}>
                      Check Another Plate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Monthly Parker Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Already a Monthly Parker?</h2>
          <p className="text-lg text-muted-foreground mb-8">Check your subscription status or pay your monthly bill.</p>

          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              {!showMonthlyDetails ? (
                <form onSubmit={handleMonthlyCheck} className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter license plate (e.g., ABC-1234)"
                      value={monthlyPlate}
                      onChange={(e) => setMonthlyPlate(e.target.value.toUpperCase())}
                      className="pr-10"
                      required
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button type="submit" variant="default" className="w-full bg-primary" disabled={isLoadingMonthly}>
                    {isLoadingMonthly ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                    {isLoadingMonthly ? "Checking..." : "Check Subscription"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Subscription Status</h3>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-lg font-medium text-foreground">Hello, {monthlySubscriptionData?.userName}</p>
                  </div>

                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Plan:</span>
                      <span className="font-medium">{monthlySubscriptionData?.plan}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">{monthlySubscriptionData?.status}</span>
                      </div>
                    </div>
                    {!monthlySubscriptionData?.hasPendingBill ? (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Next bill on:</span>
                        <span className="font-medium">{monthlySubscriptionData?.nextBillDate}</span>
                      </div>
                    ) : (
                      <div className="border-t pt-3">
                        <div className="text-center text-orange-600 mb-2">
                          <Clock className="h-5 w-5 mx-auto mb-1" />
                          <p className="text-sm font-medium">
                              Your bill for {monthlySubscriptionData.monthName} is due
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-600">
                            Amount: {monthlySubscriptionData?.pendingAmount}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    {monthlySubscriptionData?.hasPendingBill ? (
                      <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleMonthlyPayment}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Monthly Bill
                      </Button>
                    ) : null}
                    <Button variant="outline" className="w-full bg-transparent" onClick={resetMonthlyFlow}>
                      Check Another Plate
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Want to become a Monthly Parker?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Enjoy the convenience and discounts of our monthly plans. Click below to apply.
          </p>

          <Link href="/apply-monthly">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Apply for a Monthly Plan
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-sm text-muted-foreground">© 2025 MedPark. All rights reserved.</div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Employee Access
          </button>
        </div>
      </footer>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      {showSelfServicePayment && (
        <SelfServicePaymentModal
          isOpen={showSelfServicePayment}
          onClose={handleSelfServicePaymentClose}
          identifier={paymentIdentifier} 
          userType={paymentUserType}
          licensePlateDisplay={
            paymentUserType === 'casual' 
              ? paymentIdentifier // Para avulso, o identificador É a placa
              : monthlySubscriptionData?.licensePlate // Para mensalista, pegamos do estado da busca
          }
        />
      )}
    </div>
  )
}
