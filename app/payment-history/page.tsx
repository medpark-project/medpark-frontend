import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Sample payment history data
const paymentHistory = [
  {
    id: 1,
    date: "September 05, 2025",
    description: "Monthly Bill - September 2025",
    amount: "R$ 150,00",
    status: "Paid",
  },
  {
    id: 2,
    date: "August 04, 2025",
    description: "Monthly Bill - August 2025",
    amount: "R$ 150,00",
    status: "Paid",
  },
  {
    id: 3,
    date: "July 05, 2025",
    description: "Monthly Bill - July 2025",
    amount: "R$ 150,00",
    status: "Paid",
  },
  {
    id: 4,
    date: "June 03, 2025",
    description: "Monthly Bill - June 2025",
    amount: "R$ 150,00",
    status: "Paid",
  },
  {
    id: 5,
    date: "May 05, 2025",
    description: "Monthly Bill - May 2025",
    amount: "R$ 150,00",
    status: "Paid",
  },
  {
    id: 6,
    date: "April 04, 2025",
    description: "Monthly Bill - April 2025",
    amount: "R$ 150,00",
    status: "Paid",
  },
]

export default function PaymentHistoryPage() {
  return (
    <DashboardLayout userRole="Admin">
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
            <p className="text-muted-foreground mt-1">Reviewing past subscription payments for João Silva</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Payment History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.date}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell className="font-semibold">{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        {payment.status}
                      </Badge>
                    </TableCell>
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
