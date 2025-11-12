"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Download, DollarSign, Receipt, Calendar } from "lucide-react"

const revenueData = [
  { month: "Mar", casual: 15000, monthly: 8000 },
  { month: "Apr", casual: 18000, monthly: 9500 },
  { month: "May", casual: 22000, monthly: 11000 },
  { month: "Jun", casual: 19000, monthly: 12500 },
  { month: "Jul", casual: 25000, monthly: 13000 },
  { month: "Aug", casual: 28000, monthly: 14500 },
]

const recentTransactions = [
  { datetime: "2024-08-15 14:30", licensePlate: "ABC-1234", userType: "Casual", amount: "R$ 15,50" },
  { datetime: "2024-08-15 14:25", licensePlate: "XYZ-9876", userType: "Monthly", amount: "R$ 0,00" },
  { datetime: "2024-08-15 14:20", licensePlate: "DEF-5678", userType: "Casual", amount: "R$ 22,00" },
  { datetime: "2024-08-15 14:15", licensePlate: "GHI-2468", userType: "Casual", amount: "R$ 8,75" },
  { datetime: "2024-08-15 14:10", licensePlate: "JKL-1357", userType: "Monthly", amount: "R$ 0,00" },
]

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleExportCSV = () => {
    // Simulate CSV export
    console.log("Exporting transactions to CSV...")
  }

  const handleApplyFilter = () => {
    console.log("Applying date filter:", { startDate, endDate })
    // In a real app, this would filter the data
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="text-muted-foreground">Financial and operational analytics for the parking system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Date Range Filter</CardTitle>
            <CardDescription>Filter reports by specific date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button onClick={handleApplyFilter} className="gap-2">
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Total Revenue (This Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">R$ 42,500</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Average Ticket Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">R$ 18,75</div>
              <p className="text-xs text-muted-foreground">+2.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Busiest Day of the Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Friday</div>
              <p className="text-xs text-muted-foreground">35% more traffic than average</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Breakdown (Casual vs. Monthly)</CardTitle>
            <CardDescription>
              Revenue comparison between casual users and monthly parkers over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <img
                src="/colorful-stacked-bar-chart-showing-monthly-revenue.jpg"
                alt="Monthly Revenue Breakdown Stacked Bar Chart"
                className="w-full h-full object-contain"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment transactions from the parking system</CardDescription>
            </div>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Download as .CSV
            </Button>
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
                {recentTransactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{transaction.datetime}</TableCell>
                    <TableCell>{transaction.licensePlate}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.userType === "Monthly"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {transaction.userType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{transaction.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
