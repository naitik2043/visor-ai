"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock, Target, Zap, TrendingUp, TrendingDown } from "lucide-react"

interface StatsOverviewProps {
  isMonitoring: boolean
}

export function StatsOverview({ isMonitoring }: StatsOverviewProps) {
  const [stats, setStats] = useState({
    responseTime: 1.2,
    accuracy: 98.5,
    activeCameras: 12,
    detectionRate: 0,
  })

  useEffect(() => {
    if (!isMonitoring) {
      setStats((prev) => ({ ...prev, detectionRate: 0 }))
      return
    }

    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        responseTime: Math.random() * 0.5 + 1.0,
        accuracy: Math.random() * 2 + 97.5,
        detectionRate: Math.random() * 15 + 5,
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const statCards = [
    {
      title: "Response Time",
      value: `${stats.responseTime.toFixed(1)}s`,
      icon: Clock,
      description: "Average detection response",
      trend: stats.responseTime < 1.5 ? "good" : "warning",
      change: stats.responseTime < 1.5 ? "-12%" : "+8%",
    },
    {
      title: "AI Accuracy",
      value: `${stats.accuracy.toFixed(1)}%`,
      icon: Target,
      description: "Detection accuracy rate",
      trend: stats.accuracy > 98 ? "good" : "warning",
      change: stats.accuracy > 98 ? "+2.1%" : "-1.3%",
    },
    {
      title: "Active Cameras",
      value: stats.activeCameras.toString(),
      icon: Activity,
      description: "Cameras online",
      trend: "good",
      change: "100%",
    },
    {
      title: "Detection Rate",
      value: `${stats.detectionRate.toFixed(0)}/min`,
      icon: Zap,
      description: "Events detected per minute",
      trend: isMonitoring ? "good" : "neutral",
      change: isMonitoring ? "+15%" : "0%",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className="relative">
              <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              {isMonitoring && stat.trend === "good" && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                {stat.value}
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === "good"
                    ? "text-green-400"
                    : stat.trend === "warning"
                      ? "text-yellow-400"
                      : "text-muted-foreground"
                }`}
              >
                {stat.trend === "good" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : stat.trend === "warning" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                {stat.change}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            <div
              className={`absolute top-0 right-0 w-1 h-full transition-all duration-300 ${
                stat.trend === "good"
                  ? "bg-gradient-to-b from-green-400 to-green-600"
                  : stat.trend === "warning"
                    ? "bg-gradient-to-b from-yellow-400 to-orange-500"
                    : "bg-muted"
              }`}
            />
            <div className="absolute bottom-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-full h-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
