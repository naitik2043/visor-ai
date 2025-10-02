"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoFeedGrid } from "@/components/video-feed-grid"
import { AlertsPanel } from "@/components/alerts-panel"
import { StatsOverview } from "@/components/stats-overview"
import { IncidentManagement } from "@/components/incident-management"
import { Play, Pause, Shield, Eye, AlertTriangle, Cpu, Upload } from "lucide-react"
import { LiveCharts } from "@/components/live-charts"
import { UploadMonitor } from "@/components/upload-monitor"

export default function VisorDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [activeAlerts, setActiveAlerts] = useState(0)
  const [totalCameras] = useState(12)
  const [systemStatus, setSystemStatus] = useState<"online" | "offline" | "warning">("online")

  useEffect(() => {
    // Simulate system status updates
    const interval = setInterval(() => {
      if (isMonitoring) {
        setSystemStatus(Math.random() > 0.1 ? "online" : "warning")
      } else {
        setSystemStatus("offline")
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const handleToggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Shield className="h-8 w-8 text-primary" />
                  {isMonitoring && <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Visor AI</h1>
                  <p className="text-xs text-muted-foreground">Intelligent Surveillance System</p>
                </div>
              </div>
              <Badge
                variant={
                  systemStatus === "online" ? "default" : systemStatus === "warning" ? "destructive" : "secondary"
                }
                className="animate-pulse"
              >
                <Cpu className="h-3 w-3 mr-1" />
                {systemStatus === "online" ? "System Online" : systemStatus === "warning" ? "Warning" : "Offline"}
              </Badge>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">{totalCameras} Cameras</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">{activeAlerts} Active Alerts</span>
                </div>
              </div>
              <Button
                onClick={handleToggleMonitoring}
                variant={isMonitoring ? "destructive" : "default"}
                className="flex items-center gap-2 font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stop Monitoring
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Monitoring
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div>
          <StatsOverview isMonitoring={isMonitoring} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Feeds */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Eye className="h-5 w-5 text-primary" />
                  Live Video Feeds
                  {isMonitoring && (
                    <Badge variant="outline" className="text-xs animate-pulse">
                      MONITORING ACTIVE
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoFeedGrid isMonitoring={isMonitoring} />
              </CardContent>
            </Card>

            {/* New: Upload & Monitor Recording */}
            <Card className="mt-8 shadow-lg border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload & Monitor Recording
                  <Badge variant="outline" className="text-xs">
                    Uses motion + hotspot detection
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UploadMonitor isMonitoring={isMonitoring} />
              </CardContent>
            </Card>
          </div>

          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <AlertsPanel isMonitoring={isMonitoring} onAlertCountChange={setActiveAlerts} />
          </div>
        </div>

        {/* Live Statistics Charts */}
        <div>
          <LiveCharts isMonitoring={isMonitoring} />
        </div>

        {/* Incident Management */}
        <div>
          <IncidentManagement />
        </div>
      </main>
    </div>
  )
}
