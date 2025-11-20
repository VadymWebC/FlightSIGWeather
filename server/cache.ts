// server/cache.ts

export interface CacheEntry<T = any> {
	timestamp: number
	data: T
}

/**
 * Simple in-memory cache with TTL.
 */
export class TtlCache<T = any> {
	private ttlMs: number
	private store = new Map<string, CacheEntry<T>>()

	constructor(ttlMs: number) {
		this.ttlMs = ttlMs
	}

	get(key: string): T | null {
		const entry = this.store.get(key)
		if (!entry) return null

		const now = Date.now()
		if (now - entry.timestamp >= this.ttlMs) {
			this.store.delete(key)
			return null
		}
		return entry.data
	}

	set(key: string, data: T): void {
		this.store.set(key, { timestamp: Date.now(), data })
	}

	size(): number {
		return this.store.size
	}

	/**
	 * Remove expired entries.
	 * Returns number of removed entries.
	 */
	cleanExpired(): number {
		const now = Date.now()
		let removed = 0

		for (const [key, entry] of this.store.entries()) {
			if (now - entry.timestamp >= this.ttlMs) {
				this.store.delete(key)
				removed++
			}
		}

		return removed
	}
}
