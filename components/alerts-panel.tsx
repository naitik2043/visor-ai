"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Clock, MapPin, CheckCircle, X, Bell, Zap } from "lucide-react"

interface Alert {
  id: string
  type: string
  severity: "critical" | "high" | "medium" | "low"
  location: string
  camera: string
  timestamp: Date
  description: string
  status: "active" | "resolved"
  responseTime?: number
  details?: string
}

interface AlertsPanelProps {
  isMonitoring: boolean
  onAlertCountChange: (count: number) => void
}

export function AlertsPanel({ isMonitoring, onAlertCountChange }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const { toast } = useToast()

  const alertTypes = [
    {
      type: "PPE Violation",
      description: "Worker without safety helmet detected",
      severity: "high" as const,
      locations: ["Construction Zone", "Factory Floor", "Loading Dock"],
    },
    {
      type: "Patient Fall",
      description: "Elderly patient fall detected",
      severity: "high" as const,
      locations: ["Hospital Ward", "Emergency Room", "Rehabilitation Center"],
    },
    {
      type: "Unauthorized Access",
      description: "Person entered restricted area without clearance",
      severity: "medium" as const,
      locations: ["Restricted Area", "Server Room", "Executive Floor"],
    },
    {
      type: "Unsafe Operation",
      description: "Machinery operated without safety protocols",
      severity: "high" as const,
      locations: ["Machinery Bay", "Production Line", "Assembly Area"],
    },
    {
      type: "Fire Hazard",
      description: "Smoke detected near electrical equipment",
      severity: "high" as const,
      locations: ["Electrical Room", "Storage Area", "Kitchen"],
    },
    {
      type: "Security Breach",
      description: "Unidentified person in secure zone",
      severity: "medium" as const,
      locations: ["Main Entrance", "Parking Lot", "Reception"],
    },
  ]

  useEffect(() => {
    const activeAlerts = alerts.filter((alert) => alert.status === "active")
    onAlertCountChange(activeAlerts.length)
  }, [alerts, onAlertCountChange])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isMonitoring) {
      interval = setInterval(() => {
        // Generate new alerts randomly
        if (Math.random() < 0.35) {
          const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
          const location = alertType.locations[Math.floor(Math.random() * alertType.locations.length)]

          const newAlert: Alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: alertType.type,
            severity: alertType.severity,
            location,
            camera: `CAM-${String(Math.floor(Math.random() * 12) + 1).padStart(3, "0")}`,
            timestamp: new Date(),
            description: alertType.description,
            status: "active",
          }

          setAlerts((prev) => [newAlert, ...prev].slice(0, 25)) // Keep only latest 20 alerts

          // Show toast notification
          toast({
            title: `🚨 ${newAlert.severity.toUpperCase()} ALERT`,
            description: `${newAlert.type} detected at ${newAlert.location} (${newAlert.camera})`,
            variant: newAlert.severity === "high" ? "destructive" : "default",
            duration: 5000,
          })
        }
      }, 3000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isMonitoring, toast])

  useEffect(() => {
    const handler = (e: Event) => {
      const { detail } = e as CustomEvent<{
        type: string
        severity?: Alert["severity"]
        location?: string
        camera?: string
        description?: string
      }>

      const newAlert: Alert = {
        id: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: detail?.type || "External Alert",
        severity: (detail?.severity as Alert["severity"]) || "high",
        location: detail?.location || "Uploaded Recording",
        camera: detail?.camera || "UPLOAD-001",
        timestamp: new Date(),
        description: detail?.description || "External detector raised an alert",
        status: "active",
      }

      setAlerts((prev) => [newAlert, ...prev].slice(0, 25))

      toast({
        title: `🚨 ${(newAlert.severity || "HIGH").toUpperCase()} ALERT`,
        description: `${newAlert.type} at ${newAlert.location} (${newAlert.camera})`,
        variant: newAlert.severity === "high" || newAlert.severity === "critical" ? "destructive" : "default",
        duration: 5000,
      })
    }

    // TypeScript doesn't know our custom event; cast to any
    window.addEventListener("visor-alert" as any, handler as EventListener)
    return () => window.removeEventListener("visor-alert" as any, handler as EventListener)
  }, [toast])

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "resolved" as const,
              responseTime: Math.floor((Date.now() - alert.timestamp.getTime()) / 1000),
            }
          : alert,
      ),
    )

    toast({
      title: "Alert Resolved",
      description: "Incident has been marked as resolved",
    })
  }

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600/30 text-red-300 border-red-500/50 animate-pulse"
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Zap className="h-3 w-3 text-red-400" />
      case "high":
        return <AlertTriangle className="h-3 w-3 text-red-400" />
      case "medium":
        return <Clock className="h-3 w-3 text-yellow-400" />
      case "low":
        return <Bell className="h-3 w-3 text-blue-400" />
      default:
        return null
    }
  }

  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const resolvedAlerts = alerts.filter((alert) => alert.status === "resolved")

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Real-time Alerts
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-auto animate-pulse">
              {activeAlerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isMonitoring ? "No alerts detected" : "Start monitoring to see alerts"}
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    alert.status === "active"
                      ? alert.severity === "critical"
                        ? "bg-red-950/20 border-red-500/30 shadow-red-500/10 shadow-lg"
                        : "bg-card border-border"
                      : "bg-muted/50 border-muted opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        <div className="flex items-center gap-1">
                          {getSeverityIcon(alert.severity)}
                          {alert.severity.toUpperCase()}
                        </div>
                      </Badge>
                      {alert.status === "resolved" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="flex gap-1">
                      {alert.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                          className="h-6 px-2 text-xs"
                        >
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <h4 className="font-medium text-sm mb-1">{alert.type}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>

                  {alert.details && <p className="text-xs text-blue-400 mb-2 italic">• {alert.details}</p>}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {alert.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Camera: {alert.camera}
                    {alert.responseTime && <span className="ml-2">• Resolved in {alert.responseTime}s</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {alerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Active: {activeAlerts.length}</span>
              <span>Resolved: {resolvedAlerts.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
