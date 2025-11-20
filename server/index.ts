// server/index.ts

import cors from "cors"
import express from "express"
import { awcCache, proxyAwc } from "./awcClient"

const app = express()
const PORT = 5000

app.use(cors())

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
			entries: awcCache.size(),
			ttlMs: awcCache.ttlMs,
		},
	})
})

/**
 * Periodic cache cleanup.
 */
setInterval(() => {
	const removed = awcCache.cleanExpired()
	if (removed > 0) {
		console.log(`[Cache] Cleaned ${removed} expired entries`)
	}
}, 10 * 60 * 1000) // every 10 minutes

app.listen(PORT, () => {
	console.log(`✓ AWC proxy server running on http://localhost:${PORT}`)
	console.log(`✓ Cache TTL: 1 hour`)
	console.log(`✓ Cache cleanup: every 10 minutes`)
})
