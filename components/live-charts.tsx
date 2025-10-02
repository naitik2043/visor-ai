"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Activity, TrendingUp, Users, Zap, TrendingDown } from "lucide-react"

interface LiveChartsProps {
  isMonitoring: boolean
}

interface DataPoint {
  time: string
  detections: number
  responseTime: number
  accuracy: number
  activeCameras: number
  detectionTrend: "up" | "down" | "stable"
  responseTimeTrend: "up" | "down" | "stable"
}

export function LiveCharts({ isMonitoring }: LiveChartsProps) {
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const [currentHour] = useState(new Date().getHours())

  // Initialize with some baseline data
  useEffect(() => {
    const initialData: DataPoint[] = []
    for (let i = 11; i >= 0; i--) {
      const time = new Date(Date.now() - i * 5 * 60 * 1000)
      const detections = Math.floor(Math.random() * 5) + 2
      const responseTime = Math.random() * 0.5 + 1.0

      initialData.push({
        time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        detections,
        responseTime,
        accuracy: Math.random() * 2 + 97.5,
        activeCameras: 12,
        detectionTrend: "stable",
        responseTimeTrend: "stable",
      })
    }
    setChartData(initialData)
  }, [])

  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev]
        const now = new Date()
        const lastPoint = prev[prev.length - 1]

        const detections = Math.floor(Math.random() * 12) + 1 // 1-12 detections
        const responseTime = Math.random() * 1.2 + 0.5 // 0.5-1.7 seconds
        const accuracy = Math.random() * 4 + 96 // 96-100% accuracy

        // Determine trends
        const detectionTrend = lastPoint
          ? detections > lastPoint.detections + 1
            ? "up"
            : detections < lastPoint.detections - 1
              ? "down"
              : "stable"
          : "stable"

        const responseTimeTrend = lastPoint
          ? responseTime > lastPoint.responseTime + 0.2
            ? "up"
            : responseTime < lastPoint.responseTime - 0.2
              ? "down"
              : "stable"
          : "stable"

        // Add new data point
        newData.push({
          time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          detections,
          responseTime,
          accuracy,
          activeCameras: Math.random() > 0.1 ? 12 : 11, // Occasionally show a camera offline
          detectionTrend,
          responseTimeTrend,
        })

        // Keep only last 12 data points (1 hour of 5-minute intervals)
        return newData.slice(-12)
      })
    }, 3000) // Update every 3 seconds for more dynamic feel

    return () => clearInterval(interval)
  }, [isMonitoring])

  const chartConfig = {
    detections: {
      label: "Detections",
      color: "#ef4444", // Red for detections (alerts)
    },
    responseTime: {
      label: "Response Time",
      color: "#f59e0b", // Amber for response time
    },
    accuracy: {
      label: "Accuracy",
      color: "#10b981", // Green for accuracy (good performance)
    },
    activeCameras: {
      label: "Active Cameras",
      color: "#3b82f6", // Blue for system status
    },
    incidents: {
      label: "Incidents",
      color: "#ef4444", // Red for incidents
    },
    resolved: {
      label: "Resolved",
      color: "#10b981", // Green for resolved
    },
  }

  const hourlyData = [
    { hour: `${currentHour - 5}:00`, incidents: 12, resolved: 10, pending: 2 },
    { hour: `${currentHour - 4}:00`, incidents: 8, resolved: 8, pending: 0 },
    { hour: `${currentHour - 3}:00`, incidents: 15, resolved: 13, pending: 2 },
    { hour: `${currentHour - 2}:00`, incidents: 6, resolved: 6, pending: 0 },
    { hour: `${currentHour - 1}:00`, incidents: 11, resolved: 9, pending: 2 },
    {
      hour: `${currentHour}:00`,
      incidents: isMonitoring ? Math.floor(Math.random() * 8) + 2 : 4,
      resolved: 2,
      pending: 2,
    },
  ]

  const currentData = chartData[chartData.length - 1]
  const detectionTrend = currentData?.detectionTrend || "stable"
  const responseTimeTrend = currentData?.responseTimeTrend || "stable"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Real-time Detection Rate */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            Detection Rate (Live)
            {detectionTrend === "up" && <TrendingUp className="h-4 w-4 text-red-500" />}
            {detectionTrend === "down" && <TrendingDown className="h-4 w-4 text-green-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="detections"
                  stroke="#ef4444"
                  fill="url(#detectionGradient)"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="detectionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Response Time Trend */}
      <Card className="border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Response Time Trend
            {responseTimeTrend === "up" && <TrendingUp className="h-4 w-4 text-red-500" />}
            {responseTimeTrend === "down" && <TrendingDown className="h-4 w-4 text-green-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0.3, 2]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#f59e0b"
                  strokeWidth={4}
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#f59e0b", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Hourly Incident Summary */}
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Hourly Incident Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="incidents" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[94, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10b981"
                  fill="url(#performanceGradient)"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
