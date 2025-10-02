"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Clock, User, MapPin, AlertTriangle, CheckCircle, Search, Calendar, TrendingUp } from "lucide-react"

interface Incident {
  id: string
  title: string
  type: string
  severity: "critical" | "high" | "medium" | "low"
  status: "open" | "investigating" | "resolved" | "closed"
  location: string
  assignee: string
  createdAt: Date
  resolvedAt?: Date
  description: string
  responseTime?: number
}

export function IncidentManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

  const [incidents] = useState<Incident[]>([
    {
      id: "INC-001",
      title: "PPE Violation in Construction Zone",
      type: "Safety Violation",
      severity: "high",
      status: "resolved",
      location: "Construction Zone - Site B",
      assignee: "John Smith",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      description: "Worker detected without required safety helmet in active construction area",
      responseTime: 45,
    },
    {
      id: "INC-002",
      title: "Patient Fall Alert",
      type: "Medical Emergency",
      severity: "critical",
      status: "investigating",
      location: "Hospital Ward - Floor 3",
      assignee: "Dr. Sarah Johnson",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      description: "Elderly patient fall detected in room 302, immediate medical attention required",
    },
    {
      id: "INC-003",
      title: "Unauthorized Access Attempt",
      type: "Security Breach",
      severity: "medium",
      status: "open",
      location: "Restricted Area - Sector C",
      assignee: "Mike Wilson",
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      description: "Person without proper clearance attempted to enter restricted server room",
    },
    {
      id: "INC-004",
      title: "Machinery Safety Protocol Violation",
      type: "Safety Violation",
      severity: "high",
      status: "closed",
      location: "Factory Floor - Machinery Bay",
      assignee: "Lisa Chen",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      description: "Heavy machinery operated without proper safety lockout procedures",
      responseTime: 120,
    },
    {
      id: "INC-005",
      title: "Fire Hazard Detection",
      type: "Fire Safety",
      severity: "critical",
      status: "resolved",
      location: "Electrical Room - Building A",
      assignee: "Tom Rodriguez",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      description: "Smoke detected near electrical panel, potential fire hazard identified",
      responseTime: 30,
    },
  ])

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || incident.status === statusFilter
    const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter

    return matchesSearch && matchesStatus && matchesSeverity
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "investigating":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "closed":
        return "bg-muted text-muted-foreground border-muted"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4" />
      case "investigating":
        return <Clock className="h-4 w-4" />
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "open").length,
    investigating: incidents.filter((i) => i.status === "investigating").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
    avgResponseTime: Math.round(
      incidents.filter((i) => i.responseTime).reduce((acc, i) => acc + (i.responseTime || 0), 0) /
        incidents.filter((i) => i.responseTime).length || 0,
    ),
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Incident Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="incidents" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incidents">Active Incidents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Incidents List */}
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredIncidents.map((incident) => (
                  <div key={incident.id} className="p-4 border border-border rounded-lg bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(incident.severity)}>{incident.severity.toUpperCase()}</Badge>
                        <Badge className={getStatusColor(incident.status)}>
                          {getStatusIcon(incident.status)}
                          <span className="ml-1">{incident.status.toUpperCase()}</span>
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{incident.id}</span>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2">{incident.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {incident.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {incident.assignee}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {incident.createdAt.toLocaleString()}
                      </div>
                      {incident.responseTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Resolved in {incident.responseTime}s
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Incidents</span>
                  </div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium">Open</span>
                  </div>
                  <div className="text-2xl font-bold text-red-400">{stats.open}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">Investigating</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.investigating}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium">Avg Response</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">{stats.avgResponseTime}s</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Incident Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Safety Violation", "Medical Emergency", "Security Breach", "Fire Safety"].map((type) => {
                    const count = incidents.filter((i) => i.type === type).length
                    const percentage = Math.round((count / incidents.length) * 100)
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
