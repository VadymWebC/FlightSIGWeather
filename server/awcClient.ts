// server/awcClient.ts

import fetch from "node-fetch"
import { TtlCache } from "./cache"

const AWC_API_BASE = "https://aviationweather.gov/api/data"
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// Single shared cache instance for all AWC requests
const cache = new TtlCache<any>(CACHE_TTL_MS)

/**
 * Proxies a request to AWC API with caching.
 */
export async function proxyAwc(path: string, query: any): Promise<any> {
	const search = new URLSearchParams({ format: "json", ...query }).toString()
	const url = `${AWC_API_BASE}/${path}?${search}`

	const cacheKey = url
	const cached = cache.get(cacheKey)

	if (cached) {
		console.log(`[Cache HIT] ${path}`)
		return cached
	}

	console.log(`[Cache MISS] ${path} - fetching from AWC...`)
	const res = await fetch(url)

	if (!res.ok) {
		throw new Error(`AWC request failed: ${res.status} ${res.statusText}`)
	}

	const data = await res.json()

	cache.set(cacheKey, data)
	console.log(`[Cache] Stored ${path} (expires in 1h)`)

	return data
}

/**
 * Expose cache stats & maintenance helpers for /health and cleanup.
 */
export const awcCache = {
	size: () => cache.size(),
	ttlMs: CACHE_TTL_MS,
	cleanExpired: () => cache.cleanExpired(),
}
