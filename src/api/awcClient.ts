// src/api/awcClient.ts

export interface AwcCoord {
	lon: number
	lat: number
}

export interface IsigmetRecord {
	icaoId: string
	firId?: string
	firName?: string

	hazard?: string | null
	qualifier?: string | null

	// Время
	receiptTime?: string
	validTimeFrom?: number // unixtime (сек)
	validTimeTo?: number // unixtime (сек)

	// Высота
	base?: number | null // нижний FL
	top?: number | null // верхний FL

	// Геометрия
	geom?: string | null // WKT / или иной формат, если будет нужен
	coords?: AwcCoord[]

	// Текст
	rawSigmet?: string | null

	[key: string]: any
}

export interface AirsigmetRecord {
	icaoId: string
	airSigmetType?: string // "SIGMET", "AIRMET", ...

	hazard?: string | null

	// Время
	receiptTime?: string
	creationTime?: string
	validTimeFrom?: number
	validTimeTo?: number

	// Высота
	altitudeLow1?: number | null
	altitudeHi1?: number | null
	altitudeLow2?: number | null
	altitudeHi2?: number | null

	// Геометрия
	coords?: AwcCoord[]

	// Текст
	rawAirSigmet?: string | null

	[key: string]: any
}

// фронт будет стучаться на наш backend
const BACKEND_BASE = "http://localhost:3000/api"

async function fetchJson<T>(
	path: string,
	params: Record<string, string> = {}
): Promise<T> {
	const search = new URLSearchParams(params).toString()
	const url = `${BACKEND_BASE}/${path}${search ? `?${search}` : ""}`

	const res = await fetch(url)
	if (!res.ok) {
		throw new Error(`Backend request failed: ${res.status} ${res.statusText}`)
	}
	return res.json() as Promise<T>
}

export async function fetchIsigmet(
	params: Record<string, string> = {}
): Promise<IsigmetRecord[]> {
	return fetchJson<IsigmetRecord[]>("isigmet", params)
}

export async function fetchAirsigmet(
	params: Record<string, string> = {}
): Promise<AirsigmetRecord[]> {
	return fetchJson<AirsigmetRecord[]>("airsigmet", params)
}
