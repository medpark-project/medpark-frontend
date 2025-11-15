"use client"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock } from "lucide-react"
import { PaymentModal } from "@/components/payment-modal"
import api from "@/lib/api"

interface ParkedVehicle {
  id: number
  veiculo_placa: string
  hora_entrada: string
}

export default function PatioControlPage() {
  const [licensePlate, setLicensePlate] = useState("")
  const [tipoVeiculoId, setTipoVeiculoId] = useState("1") // padrao = carro
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [selectedVehicle, setSelectedVehicle] = useState<ParkedVehicle | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const [parkedVehicles, setParkedVehicles] = useState<ParkedVehicle[]>([])

  const fetchParkedVehicles = async () => {
    try {
      const response = await api.get("/estacionamento/ativos")
      setParkedVehicles(response.data)
    } catch (err) {
      console.error("Erro ao buscar veículos no pátio:", err)
      setError("Não foi possível carregar os veículos do pátio.")
    }
  }

  useEffect(() => {
    fetchParkedVehicles()
    // (Você também pode adicionar uma chamada para /tipos-veiculo para preencher um <select>)
  }, []) 

  const handleRegisterEntry = async () => {
    if (!licensePlate.trim()) return
    setIsLoading(true)
    setError("")

    try {
      // Chama a API de entrada
      await api.post("/estacionamento/entrada", {
        veiculo_placa: licensePlate.toUpperCase(),
        tipo_veiculo_id: parseInt(tipoVeiculoId) // Envia o tipo (assumindo '1' por enquanto)
      })
      
      // Se deu certo: limpa o campo e recarrega a lista de veículos
      setLicensePlate("")
      await fetchParkedVehicles() // Atualiza a tabela
      
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail) // Ex: "Este veículo já possui um registro..."
      } else {
        setError("Erro ao registrar a entrada.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterExit = (vehicle: ParkedVehicle) => {
    setSelectedVehicle(vehicle)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentComplete = () => {
    setIsPaymentModalOpen(false)
    setSelectedVehicle(null)
    fetchParkedVehicles() 
  }
  
  const calculateDuration = (entryTime: string) => {
      const entry = new Date(entryTime + "Z");
      const now = new Date();
      const diffMs = now.getTime() - entry.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      return `${diffHours}h ${diffMins}m`;
  }

  const formatEntryTime = (isoString: string) => {
    const date = new Date(isoString + "Z");
    return date.toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patio Control</h1>
          <p className="text-muted-foreground">Manage vehicle entries and exits in real-time</p>
        </div>

        {/* Register New Vehicle Entry Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Register New Vehicle Entry
            </CardTitle>
            <CardDescription>Enter the license plate to register a new vehicle in the parking lot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  placeholder="ABC-1234"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="uppercase"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRegisterEntry()
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleRegisterEntry}
                disabled={!licensePlate.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                Confirm Entry
              </Button>
            </div>
            {/* Mostra erros de validação, como "veículo já está no pátio" */}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* Vehicles Currently in Parking Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Vehicles Currently in Parking
            </CardTitle>
            <CardDescription>
              {parkedVehicles.length} vehicle{parkedVehicles.length !== 1 ? "s" : ""} currently parked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parkedVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {isLoading ? "Loading vehicles..." : "No vehicles currently parked"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    parkedVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{vehicle.veiculo_placa}</Badge>
                        </TableCell>
                        <TableCell>{formatEntryTime(new Date(vehicle.hora_entrada))}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{calculateDuration(vehicle.hora_entrada)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegisterExit(vehicle)}
                            className="hover:bg-primary hover:text-primary-foreground"
                          >
                            Register Exit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            setSelectedVehicle(null)
          }}
          vehicle={selectedVehicle}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </DashboardLayout>
  )
}
