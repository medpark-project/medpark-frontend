"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock } from "lucide-react"
import { PaymentModal } from "@/components/payment-modal"

interface ParkedVehicle {
  id: string
  licensePlate: string
  entryTime: Date
  duration: string
}

export default function PatioControlPage() {
  const [licensePlate, setLicensePlate] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<ParkedVehicle | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const [parkedVehicles, setParkedVehicles] = useState<ParkedVehicle[]>([
    {
      id: "1",
      licensePlate: "ABC-1234",
      entryTime: new Date("2025-01-09T09:30:00"),
      duration: "2h 15m",
    },
    {
      id: "2",
      licensePlate: "XYZ-5678",
      entryTime: new Date("2025-01-09T11:45:00"),
      duration: "45m",
    },
    {
      id: "3",
      licensePlate: "DEF-9012",
      entryTime: new Date("2025-01-09T08:15:00"),
      duration: "3h 30m",
    },
  ])

  const handleRegisterEntry = () => {
    if (!licensePlate.trim()) return

    const newVehicle: ParkedVehicle = {
      id: Date.now().toString(),
      licensePlate: licensePlate.toUpperCase(),
      entryTime: new Date(),
      duration: "0m",
    }

    setParkedVehicles([...parkedVehicles, newVehicle])
    setLicensePlate("")
  }

  const handleRegisterExit = (vehicleId: string) => {
    const vehicle = parkedVehicles.find((v) => v.id === vehicleId)
    if (vehicle) {
      setSelectedVehicle(vehicle)
      setIsPaymentModalOpen(true)
    }
  }

  const handlePaymentComplete = (vehicleId: string) => {
    setParkedVehicles((vehicles) => vehicles.filter((v) => v.id !== vehicleId))
    setIsPaymentModalOpen(false)
    setSelectedVehicle(null)
  }

  const formatEntryTime = (date: Date) => {
    return (
      date.toLocaleDateString("pt-BR") +
      " " +
      date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
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
                        No vehicles currently parked
                      </TableCell>
                    </TableRow>
                  ) : (
                    parkedVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{vehicle.licensePlate}</Badge>
                        </TableCell>
                        <TableCell>{formatEntryTime(vehicle.entryTime)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{vehicle.duration}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegisterExit(vehicle.id)}
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
