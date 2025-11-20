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

	// Time
	receiptTime?: string
	validTimeFrom?: number // unixtime (seconds)
	validTimeTo?: number // unixtime (seconds)

	// Altitude
	base?: number | null // lower FL
	top?: number | null // upper FL

	// Geometry
	geom?: string | null // WKT / or another format if needed
	coords?: AwcCoord[]

	// Text
	rawSigmet?: string | null

	[key: string]: any
}

export interface AirsigmetRecord {
	icaoId: string
	airSigmetType?: string // "SIGMET", "AIRMET", ...

	hazard?: string | null

	// Time
	receiptTime?: string
	creationTime?: string
	validTimeFrom?: number
	validTimeTo?: number

	// Altitude
	altitudeLow1?: number | null
	altitudeHi1?: number | null
	altitudeLow2?: number | null
	altitudeHi2?: number | null

	// Geometry
	coords?: AwcCoord[]

	// Text
	rawAirSigmet?: string | null

	[key: string]: any
}

// frontend will send requests to our backend
const BACKEND_BASE = "http://localhost:5000/api"

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
