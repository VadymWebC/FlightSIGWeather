// server/index.ts

import cors from "cors"
import express from "express"
import fetch from "node-fetch"

const app = express()
const PORT = 5000

app.use(cors())

// Базовый URL AWC
const AWC_API_BASE = "https://aviationweather.gov/api/data"

// Простейший in-memory cache
interface CacheEntry {
	timestamp: number
	data: any
}
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 2 * 60 * 1000 // 2 минуты

async function proxyAwc(path: string, query: any) {
	const search = new URLSearchParams({ format: "json", ...query }).toString()
	const url = `${AWC_API_BASE}/${path}?${search}`

	const cacheKey = url
	const now = Date.now()
	const cached = cache.get(cacheKey)
	if (cached && now - cached.timestamp < CACHE_TTL_MS) {
		return cached.data
	}

	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`AWC request failed: ${res.status} ${res.statusText}`)
	}
	const data = await res.json()
	cache.set(cacheKey, { timestamp: now, data })
	return data
}

app.get("/api/isigmet", async (req, res) => {
	try {
		const data = await proxyAwc("isigmet", req.query)
		res.json(data)
	} catch (err: any) {
		console.error(err)
		res.status(500).json({ error: err.message || "Failed to fetch ISIGMET" })
	}
})

app.get("/api/airsigmet", async (req, res) => {
	try {
		const data = await proxyAwc("airsigmet", req.query)
		res.json(data)
	} catch (err: any) {
		console.error(err)
		res.status(500).json({ error: err.message || "Failed to fetch AIRSIGMET" })
	}
})

app.listen(PORT, () => {
	console.log(`AWC proxy server listening on http://localhost:${PORT}`)
})
