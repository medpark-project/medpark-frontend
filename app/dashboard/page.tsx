"use client"

import type React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // Importa Tabela
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, DollarSign, Clock, Receipt, Calendar, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface RevenueData {
  name: string
  revenue: number
}
interface OccupancyData {
  hour: string
  vehicles: number
}
interface BreakdownData {
  name: string
  value: number
}
interface Transaction {
  id: number
  hora_entrada: string
  hora_saida: string
  valor_pago: number
  veiculo_placa: string
  veiculo: {
    mensalista_id: number | null
  }
}
export default function DashboardPage() {

  const [vehiclesParked, setVehiclesParked] = useState(0)
  const [monthlyParkers, setMonthlyParkers] = useState(0)
  const [todaysRevenue, setTodaysRevenue] = useState(0)
  const [avgStayTime, setAvgStayTime] = useState("--")

  // --- NOVOS ESTADOS PARA OS CARDS DE RELATÓRIO ---
  const [totalRevenueMonth, setTotalRevenueMonth] = useState(0)
  const [avgTicketPrice, setAvgTicketPrice] = useState(0)
  const [transactionsToday, setTransactionsToday] = useState(0)
  
  // ... (Estados para os gráficos) ...
  const [revenueData, setRevenueData] = useState([])
  const [occupancyData, setOccupancyData] = useState([])
  const [breakdownData, setBreakdownData] = useState([])
  
  // --- NOVO ESTADO PARA A TABELA ---
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const [
          veiculosRes,          // 1. /estacionamento/ativos
          mensalistasRes,       // 2. /mensalistas/
          revenueRes,           // 3. /reports/daily-revenue
          avgTimeRes,           // 4. /reports/avg-stay-time
          occupancyRes,         // 5. /reports/hourly-entries
          breakdownRes,         // 6. /reports/revenue-breakdown
          totalRevenueRes,      // 7. /reports/metrics/total-revenue-month
          avgTicketRes,         // 8. /reports/metrics/avg-ticket-month
          transactionsTodayRes, // 9. /reports/metrics/transactions-today
          recentTransactionsRes
        ] = await Promise.all([
          api.get("/estacionamento/ativos"),
          api.get("/mensalistas/"),
          api.get("/reports/daily-revenue"),
          api.get("/reports/avg-stay-time"),
          api.get("/reports/hourly-entries"),
          api.get("/reports/revenue-breakdown"),
          api.get("/reports/metrics/total-revenue-month"),
          api.get("/reports/metrics/avg-ticket-month"),
          api.get("/reports/metrics/transactions-today"),
          api.get("/reports/recent-transactions"),
        ]);

        setVehiclesParked(veiculosRes.data.length);
        setMonthlyParkers(mensalistasRes.data.length);
        setAvgStayTime(avgTimeRes.data.average_stay_time);
        if (revenueRes.data.length > 0) {
          setTodaysRevenue(revenueRes.data[revenueRes.data.length - 1].revenue)
        }
        
        setRevenueData(revenueRes.data);
        setOccupancyData(occupancyRes.data);
        setBreakdownData(breakdownRes.data);

        setTotalRevenueMonth(totalRevenueRes.data.total_revenue);
        setAvgTicketPrice(avgTicketRes.data.average_ticket);
        setTransactionsToday(transactionsTodayRes.data.transactions_today);
        
        setRecentTransactions(recentTransactionsRes.data);

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString + "Z"); // Força UTC
    return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const COLORS = ["#A0E7E5", "#4A90A4"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to MedPark - Hospital Parking Management System</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehicles Parked</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : vehiclesParked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Parkers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : monthlyParkers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : formatCurrency(todaysRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Stay Time (Last 24h)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{isLoading ? "..." : avgStayTime}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue (This Month)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{isLoading ? "..." : formatCurrency(totalRevenueMonth)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Ticket Price (Avulso)</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{isLoading ? "..." : formatCurrency(avgTicketPrice)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions (Today)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{isLoading ? "..." : transactionsToday}</div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
          <div className="grid gap-6 md:grid-cols-2">
            {/* --- Gráfico de Receita (Dinâmico) --- */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue per Day (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `R$${value}`} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                    <Bar dataKey="revenue" fill="#4A90A4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* --- Gráfico de Entradas por Hora (Dinâmico) --- */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Entries by Hour (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={occupancyData}>
                    <XAxis dataKey="hour" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} />
                    <Tooltip formatter={(value: number) => [value, "Entries"]} />
                    <Line type="monotone" dataKey="vehicles" stroke="#A0E7E5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* --- Gráfico de Pizza (Dinâmico) --- */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Total Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest completed transactions from the parking system</CardDescription>
              </div>

            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                 
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No recent transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{formatDateTime(tx.hora_saida)}</TableCell>
                        <TableCell>{tx.veiculo_placa}</TableCell>
                        <TableCell>
                          <Badge variant={tx.valor_pago > 0 ? "secondary" : "default"}>
                            {tx.valor_pago > 0 ? "Casual" : "Monthly"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(tx.valor_pago)}</TableCell>
                      </TableRow>
                    ))
                  )}
                  </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
        )}
      </div>
    </DashboardLayout>
  )
}

