"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw, Database, Users, Shield, User } from "lucide-react"

interface DatabaseCheckResult {
  success: boolean
  data?: {
    tables: {
      existing: string[]
      missing: string[]
    }
    users: {
      exists: boolean
      data: any[]
      error?: string
      count: number
    }
    otp_codes: {
      exists: boolean
      data: any[]
      error?: string
      count: number
    }
    profiles: {
      exists: boolean
      data: any[]
      error?: string
      count: number
    }
  }
  error?: string
  message?: string
}

export default function CheckDatabasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DatabaseCheckResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const checkDatabase = async () => {
    setLoading(true)
    setResult(null)
    setLogs([])
    
    try {
      addLog("🔍 Checking database tables...")
      
      const response = await fetch('/api/check-database')
      const data = await response.json()
      
      addLog(`📡 Response: ${response.status} ${response.statusText}`)
      addLog(`📋 Data: ${JSON.stringify(data)}`)
      
      setResult(data)
      
      if (data.success) {
        addLog("✅ Database check completed successfully")
        
        if (data.data?.tables?.existing?.length > 0) {
          addLog(`📋 Found tables: ${data.data.tables.existing.join(', ')}`)
        }
        
        if (data.data?.tables?.missing?.length > 0) {
          addLog(`⚠️ Missing tables: ${data.data.tables.missing.join(', ')}`)
        }
        
        // Check each table
        if (data.data?.users?.exists) {
          addLog(`👤 Users table: ✅ exists (${data.data.users.count} rows)`)
        } else {
          addLog("👤 Users table: ❌ missing")
        }
        
        if (data.data?.otp_codes?.exists) {
          addLog(`🔐 OTP codes table: ✅ exists (${data.data.otp_codes.count} rows)`)
        } else {
          addLog("🔐 OTP codes table: ❌ missing")
        }
        
        if (data.data?.profiles?.exists) {
          addLog(`👥 Profiles table: ✅ exists (${data.data.profiles.count} rows)`)
        } else {
          addLog("👥 Profiles table: ❌ missing")
        }
        
      } else {
        addLog(`❌ Database check failed: ${data.error}`)
      }
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      addLog(`❌ Network Error: ${errorMsg}`)
      setResult({
        success: false,
        error: errorMsg
      })
    } finally {
      setLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
    setResult(null)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Check
            </CardTitle>
            <CardDescription>
              Check if database tables exist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={checkDatabase} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Check Database Tables
            </Button>
            
            <Button 
              onClick={clearLogs} 
              variant="outline"
              className="w-full"
            >
              Clear Logs
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result && (
              <div className="space-y-4">
                {result.success ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {result.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {result.error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {result.data && (
                  <div className="space-y-3">
                    {/* Tables Status */}
                    <div>
                      <h4 className="font-medium mb-2">Tables Status:</h4>
                      <div className="space-y-2">
                        {result.data.tables.existing.map((table) => (
                          <div key={table} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{table}</span>
                            <Badge variant="default">Exists</Badge>
                          </div>
                        ))}
                        {result.data.tables.missing.map((table) => (
                          <div key={table} className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm">{table}</span>
                            <Badge variant="destructive">Missing</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Individual Table Details */}
                    <div className="grid grid-cols-1 gap-3">
                      {/* Users Table */}
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">Users Table</span>
                          <Badge variant={result.data.users.exists ? "default" : "destructive"}>
                            {result.data.users.exists ? "Exists" : "Missing"}
                          </Badge>
                        </div>
                        {result.data.users.exists && (
                          <div className="text-sm text-gray-600">
                            Rows: {result.data.users.count}
                          </div>
                        )}
                      </div>
                      
                      {/* OTP Codes Table */}
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4" />
                          <span className="font-medium">OTP Codes Table</span>
                          <Badge variant={result.data.otp_codes.exists ? "default" : "destructive"}>
                            {result.data.otp_codes.exists ? "Exists" : "Missing"}
                          </Badge>
                        </div>
                        {result.data.otp_codes.exists && (
                          <div className="text-sm text-gray-600">
                            Rows: {result.data.otp_codes.count}
                          </div>
                        )}
                      </div>
                      
                      {/* Profiles Table */}
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">Profiles Table</span>
                          <Badge variant={result.data.profiles.exists ? "default" : "destructive"}>
                            {result.data.profiles.exists ? "Exists" : "Missing"}
                          </Badge>
                        </div>
                        {result.data.profiles.exists && (
                          <div className="text-sm text-gray-600">
                            Rows: {result.data.profiles.count}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Logs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Debug Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Click "Check Database Tables" to see logs.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
