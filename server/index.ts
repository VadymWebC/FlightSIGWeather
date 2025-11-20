// server/index.ts

import cors from "cors"
import express from "express"
import fetch from "node-fetch"

const app = express()
const PORT = 5000

app.use(cors())

// AWC API base URL
const AWC_API_BASE = "https://aviationweather.gov/api/data"

// In-memory cache with 1h TTL
interface CacheEntry {
	timestamp: number
	data: any
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

/**
 * Clears expired cache entries.
 */
function cleanExpiredCache() {
	const now = Date.now()
	let removed = 0

	for (const [key, entry] of cache.entries()) {
		if (now - entry.timestamp >= CACHE_TTL_MS) {
			cache.delete(key)
			removed++
		}
	}

	if (removed > 0) {
		console.log(`[Cache] Cleaned ${removed} expired entries`)
	}
}

// Run cache cleanup every 10 minutes
setInterval(cleanExpiredCache, 10 * 60 * 1000)

/**
 * Proxies a request to AWC API with caching.
 */
async function proxyAwc(path: string, query: any): Promise<any> {
	const search = new URLSearchParams({ format: "json", ...query }).toString()
	const url = `${AWC_API_BASE}/${path}?${search}`

	const cacheKey = url
	const now = Date.now()
	const cached = cache.get(cacheKey)

	// Return cached data if still valid
	if (cached && now - cached.timestamp < CACHE_TTL_MS) {
		console.log(`[Cache HIT] ${path}`)
		return cached.data
	}

	// Fetch fresh data
	console.log(`[Cache MISS] ${path} - fetching from AWC...`)
	const res = await fetch(url)

	if (!res.ok) {
		throw new Error(`AWC request failed: ${res.status} ${res.statusText}`)
	}

	const data = await res.json()

	// Store in cache
	cache.set(cacheKey, { timestamp: now, data })
	console.log(`[Cache] Stored ${path} (expires in 1h)`)

	return data
}

/**
 * Endpoint: /api/isigmet
 * Proxies ISIGMET data from AWC API.
 */
app.get("/api/isigmet", async (req, res) => {
	try {
		const data = await proxyAwc("isigmet", req.query)
		res.json(data)
	} catch (err: any) {
		console.error("[Error] /api/isigmet:", err.message)
		res.status(500).json({ error: err.message || "Failed to fetch ISIGMET" })
	}
})

/**
 * Endpoint: /api/airsigmet
 * Proxies AIRSIGMET data from AWC API.
 */
app.get("/api/airsigmet", async (req, res) => {
	try {
		const data = await proxyAwc("airsigmet", req.query)
		res.json(data)
	} catch (err: any) {
		console.error("[Error] /api/airsigmet:", err.message)
		res.status(500).json({ error: err.message || "Failed to fetch AIRSIGMET" })
	}
})

/**
 * Health check endpoint.
 */
app.get("/health", (req, res) => {
	res.json({
		status: "ok",
		cache: {
			entries: cache.size,
			ttl: "1h",
		},
	})
})

app.listen(PORT, () => {
	console.log(`✓ AWC proxy server running on http://localhost:${PORT}`)
	console.log(`✓ Cache TTL: 1 hour`)
	console.log(`✓ Cache cleanup: every 10 minutes`)
})
