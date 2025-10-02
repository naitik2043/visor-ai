"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, AlertTriangle, CheckCircle, Wifi, WifiOff } from "lucide-react"

interface VideoFeedGridProps {
  isMonitoring: boolean
}

interface CameraFeed {
  id: string
  name: string
  location: string
  status: "online" | "offline" | "alert"
  lastDetection?: string
  detectionType?: string
  imageQuery: string
}

export function VideoFeedGrid({ isMonitoring }: VideoFeedGridProps) {
  const [feeds, setFeeds] = useState<CameraFeed[]>([
    {
      id: "cam-001",
      name: "Main Entrance",
      location: "Building A",
      status: "online",
      imageQuery: "/security-camera-view-of-building-entrance-door-wit.jpg",
    },
    {
      id: "cam-002",
      name: "Construction Zone",
      location: "Site B",
      status: "online",
      imageQuery: "/construction-site-surveillance-camera-view-with-wo.jpg",
    },
    {
      id: "cam-003",
      name: "Hospital Ward",
      location: "Floor 3",
      status: "online",
      imageQuery: "/hospital-corridor-surveillance-camera-view-with-me.jpg",
    },
    {
      id: "cam-004",
      name: "Restricted Area",
      location: "Sector C",
      status: "online",
      imageQuery: "/restricted-access-area-surveillance-camera-view-da.jpg",
    },
    {
      id: "cam-005",
      name: "Machinery Bay",
      location: "Factory Floor",
      status: "online",
      imageQuery: "/factory-floor-surveillance-camera-view-industrial-.jpg",
    },
    {
      id: "cam-006",
      name: "Emergency Exit",
      location: "Building A",
      status: "online",
      imageQuery: "/emergency-exit-surveillance-camera-view-exit-door-.jpg",
    },
    {
      id: "cam-007",
      name: "Parking Lot",
      location: "Outdoor",
      status: "offline",
      imageQuery: "/parking-lot-surveillance-camera-view-cars-parked-o.jpg",
    },
    {
      id: "cam-008",
      name: "Server Room",
      location: "Basement",
      status: "online",
      imageQuery: "/server-room-surveillance-camera-view-computer-serv.jpg",
    },
    {
      id: "cam-009",
      name: "Loading Dock",
      location: "Warehouse",
      status: "online",
      imageQuery: "/warehouse-loading-dock-surveillance-camera-view-tr.jpg",
    },
  ])

  const [simulatedDetections] = useState([
    { type: "PPE Violation", description: "Worker without safety helmet detected" },
    { type: "Patient Fall", description: "Elderly patient fall detected in room 302" },
    { type: "Unauthorized Access", description: "Person entered restricted area without clearance" },
    { type: "Unsafe Operation", description: "Machinery operated without safety protocols" },
    { type: "Fire Hazard", description: "Smoke detected near electrical panel" },
    { type: "Security Breach", description: "Unidentified person in secure zone" },
  ])

  useEffect(() => {
    if (!isMonitoring) {
      setFeeds((prev) =>
        prev.map((feed) => ({
          ...feed,
          status: feed.id === "cam-007" ? "offline" : "online",
          lastDetection: undefined,
          detectionType: undefined,
        })),
      )
      return
    }

    const interval = setInterval(() => {
      setFeeds((prev) => {
        const newFeeds = [...prev]

        // Randomly trigger alerts on active cameras
        if (Math.random() < 0.15) {
          const onlineFeeds = newFeeds.filter((f) => f.status === "online")
          if (onlineFeeds.length > 0) {
            const randomFeed = onlineFeeds[Math.floor(Math.random() * onlineFeeds.length)]
            const randomDetection = simulatedDetections[Math.floor(Math.random() * simulatedDetections.length)]

            const feedIndex = newFeeds.findIndex((f) => f.id === randomFeed.id)
            newFeeds[feedIndex] = {
              ...randomFeed,
              status: "alert",
              lastDetection: new Date().toLocaleTimeString(),
              detectionType: randomDetection.type,
            }
          }
        }

        // Clear some alerts randomly
        newFeeds.forEach((feed, index) => {
          if (feed.status === "alert" && Math.random() < 0.3) {
            newFeeds[index] = {
              ...feed,
              status: "online",
            }
          }
        })

        return newFeeds
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isMonitoring, simulatedDetections])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "offline":
        return <WifiOff className="h-4 w-4 text-muted-foreground" />
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      default:
        return <Wifi className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
            Online
          </Badge>
        )
      case "offline":
        return <Badge variant="secondary">Offline</Badge>
      case "alert":
        return <Badge variant="destructive">Alert</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {feeds.map((feed) => (
        <Card
          key={feed.id}
          className={`relative overflow-hidden transition-all duration-500 hover:shadow-lg group ${
            feed.status === "alert"
              ? "ring-2 ring-destructive/50 bg-destructive/5 shadow-lg shadow-destructive/20"
              : "hover:shadow-primary/10"
          }`}
        >
          <CardContent className="p-4">
            <div className="aspect-video bg-muted rounded-lg mb-3 relative overflow-hidden border border-border/50">
              {feed.status === "offline" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
                  <div className="text-center">
                    <WifiOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">Camera Offline</p>
                    <div className="mt-2 w-16 h-1 bg-muted-foreground/20 rounded mx-auto">
                      <div className="w-0 h-full bg-muted-foreground/40 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={feed.imageQuery || "/placeholder.svg"}
                    alt={`${feed.name} camera feed`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://via.placeholder.com/300x200/1e293b/64748b?text=${encodeURIComponent(feed.name + " SURVEILLANCE")}`
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />

                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                      `,
                        backgroundSize: "20px 20px",
                      }}
                    />
                  </div>

                  {/* Scanning line effect when monitoring */}
                  {isMonitoring && feed.status !== "offline" && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div
                        className="absolute w-full h-0.5 bg-primary/60 animate-pulse"
                        style={{
                          animation: "scan 3s linear infinite",
                          top: "0%",
                        }}
                      />
                    </div>
                  )}

                  {/* Detection overlay with enhanced styling */}
                  {feed.status === "alert" && (
                    <div className="absolute inset-0 border-2 border-destructive animate-pulse bg-destructive/5">
                      <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-xs font-bold shadow-lg animate-bounce">
                        ⚠ ALERT DETECTED
                      </div>
                      <div className="absolute bottom-1/3 left-1/4 w-1/2 h-1/3 border-2 border-destructive rounded bg-destructive/10 animate-pulse">
                        <div className="absolute -top-6 left-0 bg-destructive text-destructive-foreground px-2 py-0.5 rounded text-xs font-medium">
                          DETECTED
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced camera info overlay */}
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-xs font-mono border border-white/20">
                    {feed.id.toUpperCase()}
                  </div>

                  {/* Enhanced live indicator */}
                  {isMonitoring && feed.status !== "offline" && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-xs font-bold shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse ml-1" />
                      LIVE
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-mono border border-white/20">
                    {new Date().toLocaleTimeString()}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm text-foreground">{feed.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(feed.status)}
                  {isMonitoring && feed.status === "online" && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{feed.location}</span>
                {getStatusBadge(feed.status)}
              </div>

              {/* Enhanced detection info */}
              {feed.lastDetection && feed.detectionType && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    <p className="text-xs font-bold text-destructive uppercase tracking-wide">{feed.detectionType}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Detected at {feed.lastDetection}</p>
                  <div className="mt-2 w-full bg-destructive/20 rounded-full h-1">
                    <div className="bg-destructive h-1 rounded-full animate-pulse" style={{ width: "75%" }} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
