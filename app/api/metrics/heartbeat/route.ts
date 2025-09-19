import { NextResponse, type NextRequest } from "next/server"

// In-memory visitor heartbeat store (approximate, resets on server restart)
// Keyed by IP + UA to reduce overcounting. Stores lastSeen timestamp.
const VISITOR_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Use global to persist across hot reloads in dev
const g = globalThis as any
if (!g.__HEARTBEATS__) {
  g.__HEARTBEATS__ = new Map<string, number>()
}
const HEARTBEATS: Map<string, number> = g.__HEARTBEATS__

function getClientKey(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0"
  const ua = req.headers.get("user-agent") || "unknown"
  return `${ip}|${ua.slice(0, 64)}`
}

export async function POST(req: NextRequest) {
  try {
    const key = getClientKey(req)
    HEARTBEATS.set(key, Date.now())
    // Cleanup old entries opportunistically
    const now = Date.now()
    for (const [k, ts] of HEARTBEATS) {
      if (now - ts > VISITOR_TTL_MS) HEARTBEATS.delete(k)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Return count for quick checks
  try {
    const now = Date.now()
    let live = 0
    for (const [, ts] of HEARTBEATS) {
      if (now - ts <= VISITOR_TTL_MS) live++
    }
    return NextResponse.json({ ok: true, live })
  } catch {
    return NextResponse.json({ ok: false, live: 0 }, { status: 500 })
  }
}
