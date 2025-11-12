"use client"

import type React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, DollarSign, Clock } from "lucide-react"

const revenueData = [/* ... */]
const occupancyData = [/* ... */]
const userMixData = [/* ... */]

export default function DashboardPage() {

  const [vehiclesParked, setVehiclesParked] = useState(0)
  const [monthlyParkers, setMonthlyParkers] = useState(0)
  const [todaysRevenue, setTodaysRevenue] = useState(0)
  const [avgStayTime, setAvgStayTime] = useState("--")
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
      
        const veiculosResponse = await api.get("/estacionamento/ativos");
        const mensalistasResponse = await api.get("/mensalistas/");

        setVehiclesParked(veiculosResponse.data.length);
        setMonthlyParkers(mensalistasResponse.data.length);
        

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

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
              {/* O número agora é dinâmico! */}
              <div className="text-2xl font-bold">{isLoading ? "..." : vehiclesParked}</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Parkers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* O número agora é dinâmico! */}
              <div className="text-2xl font-bold">{isLoading ? "..." : monthlyParkers}</div>
              <p className="text-xs text-muted-foreground">+3 new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* Você pode conectar 'todaysRevenue' aqui */}
              <div className="text-2xl font-bold">{isLoading ? "..." : `R$ ${todaysRevenue}`}</div>
              <p className="text-xs text-muted-foreground">+18% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Stay Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {/* Você pode conectar 'avgStayTime' aqui */}
              <div className="text-2xl font-bold">{isLoading ? "..." : avgStayTime}</div>
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
