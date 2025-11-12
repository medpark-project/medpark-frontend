import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, DollarSign, Clock } from "lucide-react"

const revenueData = [
  { day: "Mon", revenue: 2450 },
  { day: "Tue", revenue: 2847 },
  { day: "Wed", revenue: 2234 },
  { day: "Thu", revenue: 2890 },
  { day: "Fri", revenue: 3120 },
  { day: "Sat", revenue: 2678 },
  { day: "Sun", revenue: 2156 },
]

const occupancyData = [
  { hour: "7am", vehicles: 45 },
  { hour: "8am", vehicles: 78 },
  { hour: "9am", vehicles: 95 },
  { hour: "10am", vehicles: 112 },
  { hour: "11am", vehicles: 127 },
  { hour: "12pm", vehicles: 134 },
  { hour: "1pm", vehicles: 128 },
  { hour: "2pm", vehicles: 115 },
  { hour: "3pm", vehicles: 108 },
  { hour: "4pm", vehicles: 98 },
  { hour: "5pm", vehicles: 89 },
  { hour: "6pm", vehicles: 76 },
  { hour: "7pm", vehicles: 65 },
  { hour: "8pm", vehicles: 52 },
  { hour: "9pm", vehicles: 38 },
  { hour: "10pm", vehicles: 25 },
]

const userMixData = [
  { name: "Casual Users", value: 75, color: "#A0E7E5" },
  { name: "Monthly Parkers", value: 25, color: "#4A90A4" },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to MedPark - Hospital Parking Management System</p>
        </div>

        {/* Key metrics cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehicles Parked</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Parkers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+3 new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 2,847</div>
              <p className="text-xs text-muted-foreground">+18% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Stay Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2h 34m</div>
              <p className="text-xs text-muted-foreground">-8 min from yesterday</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue per Day (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px] flex items-center justify-center">
                <img
                  src="/colorful-bar-chart-showing-daily-revenue-data-with.jpg"
                  alt="Revenue per Day Bar Chart"
                  className="w-full h-full object-contain"
                />
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Average Occupancy by Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px] flex items-center justify-center">
                <img
                  src="/colorful-line-chart-showing-hourly-occupancy-data-.jpg"
                  alt="Average Occupancy Line Chart"
                  className="w-full h-full object-contain"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Parking Sessions by User Type (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[250px] flex items-center justify-center">
              <img
                src="/colorful-doughnut-chart-showing-user-type-distribu.jpg"
                alt="User Type Distribution Doughnut Chart"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#A0E7E5]"></div>
                <span className="text-sm text-muted-foreground">Casual Users (75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4A90A4]"></div>
                <span className="text-sm text-muted-foreground">Monthly Parkers (25%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access the most common parking management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Use the sidebar navigation to access Patio Control for vehicle management, Monthly Parkers for subscriber
              management, and Reports for detailed analytics.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
