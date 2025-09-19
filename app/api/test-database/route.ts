import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/client"

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  }

  // Test 1: Environment Variables
  const envTest = {
    name: "Environment Variables",
    status: "checking",
    details: {}
  }

  try {
    envTest.details = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
      anonKeyValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
      serviceKeyValue: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing"
    }
    envTest.status = "passed"
  } catch (error) {
    envTest.status = "failed"
    envTest.details = { error: error instanceof Error ? error.message : "Unknown error" }
  }
  results.tests.push(envTest)

  // Test 2: Admin Client Connection
  const adminClientTest = {
    name: "Admin Client Connection",
    status: "checking",
    details: {}
  }

  try {
    const adminClient = createAdminClient()
    if (!adminClient) {
      adminClientTest.status = "failed"
      adminClientTest.details = { error: "Admin client creation failed" }
    } else {
      // Test a simple query
      const { data, error } = await adminClient
        .from("products")
        .select("count", { count: "exact", head: true })

      if (error) {
        adminClientTest.status = "failed"
        adminClientTest.details = { error: error.message }
      } else {
        adminClientTest.status = "passed"
        adminClientTest.details = { 
          message: "Admin client connected successfully",
          productCount: data || 0
        }
      }
    }
  } catch (error) {
    adminClientTest.status = "failed"
    adminClientTest.details = { error: error instanceof Error ? error.message : "Unknown error" }
  }
  results.tests.push(adminClientTest)

  // Test 3: Regular Client Connection
  const clientTest = {
    name: "Regular Client Connection",
    status: "checking",
    details: {}
  }

  try {
    const client = createClient()
    if (!client) {
      clientTest.status = "failed"
      clientTest.details = { error: "Regular client creation failed" }
    } else {
      // Test a simple query
      const { data, error } = await client
        .from("products")
        .select("count", { count: "exact", head: true })

      if (error) {
        clientTest.status = "failed"
        clientTest.details = { error: error.message }
      } else {
        clientTest.status = "passed"
        clientTest.details = { 
          message: "Regular client connected successfully",
          productCount: data || 0
        }
      }
    }
  } catch (error) {
    clientTest.status = "failed"
    clientTest.details = { error: error instanceof Error ? error.message : "Unknown error" }
  }
  results.tests.push(clientTest)

  // Test 4: Database Tables
  const tablesTest = {
    name: "Database Tables",
    status: "checking",
    details: {}
  }

  try {
    const adminClient = createAdminClient()
    if (adminClient) {
      const tables = ['products', 'categories', 'orders', 'users', 'profiles']
      const tableResults: Record<string, any> = {}

      for (const table of tables) {
        try {
          const { count, error } = await adminClient
            .from(table)
            .select("*", { count: "exact", head: true })

          if (error) {
            tableResults[table] = { status: "error", error: error.message }
          } else {
            tableResults[table] = { status: "exists", count: count || 0 }
          }
        } catch (err) {
          tableResults[table] = { 
            status: "error", 
            error: err instanceof Error ? err.message : "Unknown error" 
          }
        }
      }

      tablesTest.status = "passed"
      tablesTest.details = tableResults
    } else {
      tablesTest.status = "failed"
      tablesTest.details = { error: "Admin client not available" }
    }
  } catch (error) {
    tablesTest.status = "failed"
    tablesTest.details = { error: error instanceof Error ? error.message : "Unknown error" }
  }
  results.tests.push(tablesTest)

  // Test 5: Sample Data Query
  const dataTest = {
    name: "Sample Data Query",
    status: "checking",
    details: {}
  }

  try {
    const adminClient = createAdminClient()
    if (adminClient) {
      const { data: products, error } = await adminClient
        .from("products")
        .select("id, name, price, category, is_active")
        .limit(5)

      if (error) {
        dataTest.status = "failed"
        dataTest.details = { error: error.message }
      } else {
        dataTest.status = "passed"
        dataTest.details = { 
          message: "Sample data retrieved successfully",
          sampleProducts: products || [],
          count: products?.length || 0
        }
      }
    } else {
      dataTest.status = "failed"
      dataTest.details = { error: "Admin client not available" }
    }
  } catch (error) {
    dataTest.status = "failed"
    dataTest.details = { error: error instanceof Error ? error.message : "Unknown error" }
  }
  results.tests.push(dataTest)

  // Overall Status
  const failedTests = results.tests.filter(test => test.status === "failed")
  const overallStatus = failedTests.length === 0 ? "healthy" : "issues_detected"

  return NextResponse.json({
    status: overallStatus,
    summary: {
      total: results.tests.length,
      passed: results.tests.filter(test => test.status === "passed").length,
      failed: failedTests.length
    },
    ...results
  })
}
