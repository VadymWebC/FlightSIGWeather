// src/map/awcToGeoJson.ts

import type { AirsigmetRecord, IsigmetRecord } from "../api/awcClient"
import type {
	NormalizedFeature,
	NormalizedFeatureCollection,
	PhenomenonType,
} from "./awcTypes"

type AwcCoord = { lon: any; lat: any }

function sanitizeCoords(coords: AwcCoord[] | undefined): [number, number][] {
	if (!coords) return []

	const result: [number, number][] = []

	for (const c of coords) {
		const lon = Number((c as any).lon)
		const lat = Number((c as any).lat)
		if (Number.isFinite(lon) && Number.isFinite(lat)) {
			result.push([lon, lat])
		}
	}

	return result
}

function toNumberOrNull(value: unknown): number | null {
	const n = Number(value)
	return Number.isFinite(n) ? n : null
}

// Простое преобразование массива { lon, lat } -> GeoJSON Polygon
function coordsToPolygon(
	coordsRaw: AwcCoord[] | undefined
): { type: "Polygon"; coordinates: number[][][] } | null {
	const coords = sanitizeCoords(coordsRaw)
	if (coords.length < 3) return null

	const ring = [...coords]

	// замыкаем кольцо
	const [firstLon, firstLat] = ring[0]
	const [lastLon, lastLat] = ring[ring.length - 1]
	if (firstLon !== lastLon || firstLat !== lastLat) {
		ring.push([firstLon, firstLat])
	}

	return {
		type: "Polygon",
		coordinates: [ring],
	}
}

function mapTime(value: any): string | null {
	if (!value) return null
	if (typeof value === "string") return value
	if (typeof value === "number") {
		// unixtime в секундах
		return new Date(value * 1000).toISOString()
	}
	return null
}

export function normalizeIsigmet(
	records: IsigmetRecord[]
): NormalizedFeatureCollection {
	const features: NormalizedFeature[] = []

	if (records.length > 0) {
		console.log("FULL ISIGMET REC EXAMPLE:", records[0])
	}

	for (const rec of records) {
		// тут — ПОЛИГОН, а не Point
		const geom = coordsToPolygon(rec.coords as any)
		if (!geom) {
			continue
		}

		const type: PhenomenonType = "SIGMET"

		const feature: NormalizedFeature = {
			type: "Feature",
			geometry: geom,
			properties: {
				id:
					(rec as any).id ??
					`${(rec as any).icaoId ?? ""}-${(rec as any).receiptTime ?? ""}`,
				type,
				rawText: (rec as any).rawSigmet || "",
				startTime: mapTime((rec as any).validTimeFrom),
				endTime: mapTime((rec as any).validTimeTo),
				minFlightLevel: toNumberOrNull((rec as any).base),
				maxFlightLevel: toNumberOrNull((rec as any).top),
				hazard: (rec as any).hazard || null,
				...rec,
			},
		}

		features.push(feature)
	}

	return {
		type: "FeatureCollection",
		features,
	}
}

export function normalizeAirsigmet(
	records: AirsigmetRecord[]
): NormalizedFeatureCollection {
	const features: NormalizedFeature[] = []

	if (records.length > 0) {
		console.log("FULL AIRSIGMET REC EXAMPLE:", records[0])
	}

	for (const rec of records) {
		const geom = coordsToPolygon(rec.coords as any)
		if (!geom) continue

		const t = ((rec as any).airSigmetType || "").toUpperCase()
		let type: PhenomenonType
		if (t === "SIGMET") type = "SIGMET"
		else if (t === "AIRMET") type = "AIRMET"
		else type = "G_AIRMET"

		const low = (rec as any).altitudeLow1 ?? (rec as any).altitudeLow2 ?? null
		const hi = (rec as any).altitudeHi1 ?? (rec as any).altitudeHi2 ?? null

		const feature: NormalizedFeature = {
			type: "Feature",
			geometry: geom,
			properties: {
				id:
					(rec as any).id ??
					`${(rec as any).icaoId ?? ""}-${(rec as any).receiptTime ?? ""}`,
				type,
				rawText: (rec as any).rawAirSigmet || "",
				startTime: mapTime((rec as any).validTimeFrom),
				endTime: mapTime((rec as any).validTimeTo),
				minFlightLevel: toNumberOrNull(low),
				maxFlightLevel: toNumberOrNull(hi),
				hazard: (rec as any).hazard || null,
				...rec,
			},
		}

		features.push(feature)
	}

	return {
		type: "FeatureCollection",
		features,
	}
}
