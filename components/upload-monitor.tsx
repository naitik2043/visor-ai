"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Video, Upload, Activity } from "lucide-react"

type Severity = "critical" | "high" | "medium" | "low"

interface UploadMonitorProps {
  isMonitoring: boolean
}

export function UploadMonitor({ isMonitoring }: UploadMonitorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [motionPercent, setMotionPercent] = useState(0)
  const [redHotspotPercent, setRedHotspotPercent] = useState(0)
  const [lastFrame, setLastFrame] = useState<Uint8ClampedArray | null>(null)

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src)
    }
  }, [src])

  useEffect(() => {
    let interval: number | undefined

    const analyze = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return

      const w = 320
      const h = Math.max(1, Math.round((video.videoHeight / video.videoWidth) * w))
      canvas.width = w
      canvas.height = h

      // draw current frame
      ctx.drawImage(video, 0, 0, w, h)
      const { data } = ctx.getImageData(0, 0, w, h)

      // compute motion vs previous
      let changed = 0
      let redHot = 0
      const total = w * h
      const threshold = 26 // pixel channel difference threshold
      const redDelta = 35

      if (lastFrame && lastFrame.length === data.length) {
        for (let i = 0; i < data.length; i += 4) {
          const dr = Math.abs(data[i] - lastFrame[i])
          const dg = Math.abs(data[i + 1] - lastFrame[i + 1])
          const db = Math.abs(data[i + 2] - lastFrame[i + 2])
          if (dr + dg + db > threshold * 3) changed++
        }
      }

      // red hotspot detection (e.g., fire hazard)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        if (r > 140 && r > g + redDelta && r > b + redDelta) redHot++
      }

      setLastFrame(new Uint8ClampedArray(data))
      const motion = (changed / total) * 100
      const hotspots = (redHot / total) * 100
      setMotionPercent(motion)
      setRedHotspotPercent(hotspots)

      // determine severity
      let severity: Severity | null = null
      if (hotspots > 12 || motion > 35) severity = "critical"
      else if (hotspots > 6 || motion > 20) severity = "high"
      else if (hotspots > 3 || motion > 12) severity = "medium"

      if (severity) {
        const detail = {
          type: hotspots > 6 ? "Fire/Red Hotspot Detected" : "Suspicious Motion Detected",
          severity,
          location: "Uploaded Recording",
          camera: "UPLOAD-001",
          description: `Motion ${motion.toFixed(1)}%${hotspots > 1 ? `, red hotspot ${hotspots.toFixed(1)}%` : ""}`,
        }
        // Throttle: do not spam every frame
        if (!(window as any).__visorLastUploadAlertAt || Date.now() - (window as any).__visorLastUploadAlertAt > 2500) {
          ;(window as any).__visorLastUploadAlertAt = Date.now()
          window.dispatchEvent(new CustomEvent("visor-alert", { detail }))
        }
      }
    }

    const start = () => {
      if (!src || !isMonitoring) {
        setIsAnalyzing(false)
        return
      }
      setIsAnalyzing(true)
      interval = window.setInterval(analyze, 400)
    }

    const stop = () => {
      setIsAnalyzing(false)
      if (interval) window.clearInterval(interval)
    }

    start()
    return stop
  }, [src, isMonitoring, lastFrame])

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (src) URL.revokeObjectURL(src)
    const next = URL.createObjectURL(file)
    setSrc(next)
    setFileName(file.name)
    setLastFrame(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Input accept="video/*" type="file" onChange={onFileSelect} className="max-w-xs" />
        <Button variant="outline" disabled className="gap-2 bg-transparent">
          <Upload className="h-4 w-4" />
          Upload video
        </Button>
        <Badge
          variant="outline"
          className={isAnalyzing ? "text-green-400 border-green-500/50" : "text-muted-foreground"}
        >
          <Activity className="h-3 w-3 mr-1" />
          {isAnalyzing ? "Analyzing" : "Idle"}
        </Badge>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-border bg-muted/20">
        {!src && (
          <div className="aspect-video w-full flex items-center justify-center text-muted-foreground">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              <span className="text-sm">No video selected</span>
            </div>
          </div>
        )}
        {src && (
          <div className="relative">
            <video ref={videoRef} src={src} className="w-full h-auto block" autoPlay loop muted playsInline controls />
            {/* Invisible canvas for frame analysis */}
            <canvas ref={canvasRef} className="hidden" />
            {/* Status overlay */}
            <div className="absolute left-3 bottom-3 flex gap-2">
              <Badge className="bg-black/50 text-white border-white/10 backdrop-blur">{fileName || "upload.mp4"}</Badge>
              {isAnalyzing ? (
                <Badge className="bg-green-600/70 text-white border-green-500/50">Monitoring</Badge>
              ) : (
                <Badge className="bg-zinc-700/70 text-white border-zinc-600/50">Paused</Badge>
              )}
            </div>
            {/* Warning banner on suspicious activity */}
            {(motionPercent > 35 || redHotspotPercent > 12) && (
              <div className="absolute top-3 right-3 flex items-center gap-2 rounded-md bg-red-600/80 text-white px-3 py-1.5 shadow-lg">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">Notorious activity detected</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live analysis indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Motion Change</span>
            <span className={motionPercent > 20 ? "text-red-400" : "text-green-400"}>{motionPercent.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(100, motionPercent)} />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Red Hotspots</span>
            <span className={redHotspotPercent > 6 ? "text-red-400" : "text-green-400"}>
              {redHotspotPercent.toFixed(1)}%
            </span>
          </div>
          <Progress value={Math.min(100, redHotspotPercent)} />
        </div>
      </div>
    </div>
  )
}

export default UploadMonitor
