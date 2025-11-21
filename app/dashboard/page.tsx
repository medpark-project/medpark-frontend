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

interface Movement {
    id: string
    time: string
    placa: string
    isMonthly: boolean
    type: "Entry" | "Exit"
    amount?: number
}

interface FinancialTransaction {
  id: string
  data: string
  descricao: string
  tipo: "Casual" | "Monthly"
  valor: number
}

export default function DashboardPage() {

  const [vehiclesParked, setVehiclesParked] = useState(0)
  const [monthlyParkers, setMonthlyParkers] = useState(0)
  const [todaysRevenue, setTodaysRevenue] = useState(0)
  const [avgStayTime, setAvgStayTime] = useState("--")
  const [totalRevenueMonth, setTotalRevenueMonth] = useState(0)
  const [avgTicketPrice, setAvgTicketPrice] = useState(0)
  const [transactionsToday, setTransactionsToday] = useState(0)
  const [revenueData, setRevenueData] = useState([])
  const [occupancyData, setOccupancyData] = useState([])
  const [breakdownData, setBreakdownData] = useState([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [financialHistory, setFinancialHistory] = useState<FinancialTransaction[]>([])

  const generateMovements = (transactions: Transaction[]): Movement[] => {
    const movements: Movement[] = [];

    transactions.forEach((tx) => {
      const isMonthly = tx.veiculo?.mensalista_id !== null;

      movements.push({
        id: `${tx.id}-entry`,
        time: tx.hora_entrada,
        placa: tx.veiculo_placa,
        isMonthly: isMonthly,
        type: "Entry",
      });

      if (tx.hora_saida) {
        movements.push({
          id: `${tx.id}-exit`,
          time: tx.hora_saida,
          placa: tx.veiculo_placa,
          isMonthly: isMonthly,
          type: "Exit",
          amount: tx.valor_pago
        });
      }
    });

    return movements.sort((a, b) => {
      const dateA = new Date(a.time + "Z").getTime();
      const dateB = new Date(b.time + "Z").getTime();
      return dateB - dateA;
    }).slice(0, 10);
  };

  const recentMovements = generateMovements(recentTransactions);
  
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const [
          veiculosRes,          // 1. /estacionamento/ativos
          mensalistasRes,       // 2. /mensalistas/
          avgTimeRes,           // 4. /reports/avg-stay-time
          occupancyRes,         // 5. /reports/hourly-entries
          breakdownRes,         // 6. /reports/revenue-breakdown
          totalRevenueRes,      // 7. /reports/metrics/total-revenue-month
          avgTicketRes,         // 8. /reports/metrics/avg-ticket-month
          recentTransactionsRes,
          financialRes
        ] = await Promise.all([
          api.get("/estacionamento/ativos"),
          api.get("/mensalistas/"),
          api.get("/reports/avg-stay-time"),
          api.get("/reports/hourly-entries"),
          api.get("/reports/revenue-breakdown"),
          api.get("/reports/metrics/total-revenue-month"),
          api.get("/reports/metrics/avg-ticket-month"),
          api.get("/reports/recent-transactions"),
          api.get("/reports/financial-history"),
        ]);

        setVehiclesParked(veiculosRes.data.length);
        setMonthlyParkers(mensalistasRes.data.length);
        setAvgStayTime(avgTimeRes.data.average_stay_time);

        setOccupancyData(occupancyRes.data);
        setBreakdownData(breakdownRes.data);

        setTotalRevenueMonth(totalRevenueRes.data.total_revenue);
        setAvgTicketPrice(avgTicketRes.data.average_ticket);
        
        setRecentTransactions(recentTransactionsRes.data);
        setFinancialHistory(Array.isArray(financialRes.data) ? financialRes.data : []);

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
    const date = new Date(isoString);
    const safeDate = isoString.endsWith("Z") ? date : new Date(isoString + "Z");
    return safeDate.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  }

  const COLORS = ["#A0E7E5", "#4A90A4"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to MedPark - Hospital Parking Management System</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
              <CardTitle className="text-sm font-medium">Avg. Stay Time (Last 24h)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{isLoading ? "..." : avgStayTime}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
          
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

          {/* --- TABELA DE MOVIMENTAÇÕES RECENTES --- */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Real-time vehicle entries and exits</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead className="text-right">Operation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell>
                    </TableRow>
                  ) : recentMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No recent activity found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentMovements.map((move) => (
                      <TableRow key={move.id}>
                        <TableCell className="font-medium">{formatDateTime(move.time)}</TableCell>
                        <TableCell>{move.placa}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={move.isMonthly ? "default" : "secondary"}
                            className={move.isMonthly ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "bg-green-100 text-green-800 hover:bg-green-100"}
                          >
                            {move.isMonthly ? "Monthly" : "Casual"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {/* Lógica de Exibição da Operação */}
                          {move.type === "Entry" ? (
                            <span className="text-blue-600 flex items-center justify-end gap-1">
                              ↳ Entry
                            </span>
                          ) : (
                            <span className="text-orange-600 flex items-center justify-end gap-1">
                              Exit {move.amount !== undefined && !move.isMonthly && `(R$ ${move.amount.toFixed(2)})`} ↱
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* --- TABELA FINANCEIRA REAL (CORRIGIDA) --- */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Financial Transactions</CardTitle>
                <CardDescription>Latest payments received (Casual Tickets & Monthly Bills)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No payments recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      financialHistory.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">{formatDateTime(tx.data)}</TableCell>
                          <TableCell>{tx.descricao}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={tx.tipo === "Monthly" ? "default" : "secondary"}
                              className={tx.tipo === "Monthly" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                            >
                              {tx.tipo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-700">
                            {formatCurrency(tx.valor)}
                          </TableCell>
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

