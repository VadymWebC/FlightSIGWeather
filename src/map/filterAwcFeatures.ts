// src/map/filterAwcFeatures.ts
import type {
	AltitudeFilterState,
	LayerFilterState,
	TimeFilterState,
} from "../hooks/useAwcData"
import type { NormalizedFeature, NormalizedFeatureCollection } from "./awcTypes"

export interface FilterParams {
	all: NormalizedFeature[]
	layers: LayerFilterState
	altitude: AltitudeFilterState
	time: TimeFilterState
}

function passesLayerFilter(
	f: NormalizedFeature,
	layers: LayerFilterState
): boolean {
	const t = f.properties.type

	if (t === "SIGMET" && !layers.showSigmet) return false
	if (t === "AIRMET" && !layers.showAirmet) return false
	if (t === "G_AIRMET" && !layers.showGAirmet) return false

	return true
}

function passesAltitudeFilter(
	f: NormalizedFeature,
	altitude: AltitudeFilterState
): boolean {
	let { minFL, maxFL } = altitude

	// Normalize range: if min > max, swap them
	if (minFL > maxFL) {
		const tmp = minFL
		minFL = maxFL
		maxFL = tmp
	}

	const featMin = f.properties.minFlightLevel
	const featMax = f.properties.maxFlightLevel

	// If feature has no altitude information, exclude it from results
	// (otherwise altitude filter won't work properly)
	if (featMin == null && featMax == null) {
		return false
	}

	// Interpret missing bounds as extremes
	const min = featMin ?? 0
	const max = featMax ?? 480

	// Check if ranges overlap: [min, max] ∩ [minFL, maxFL]
	if (max < minFL) return false
	if (min > maxFL) return false

	return true
}

function passesTimeFilter(
	f: NormalizedFeature,
	time: TimeFilterState,
	now: number
): boolean {
	const fromTime = now + time.fromOffsetHours * 3600_000
	const toTime = now + time.toOffsetHours * 3600_000

	const startSec = f.properties.validTimeFrom ?? f.properties.startTime ?? null
	const endSec = f.properties.validTimeTo ?? f.properties.endTime ?? startSec

	if (startSec == null || endSec == null) {
		// No time information — don't filter by time
		return true
	}

	const startMs = startSec * 1000
	const endMs = endSec * 1000

	if (endMs < fromTime) return false
	if (startMs > toTime) return false

	return true
}

/**
 * Applies filters: type + altitude + time to an array of normalized features.
 */
export function filterAwcFeatures({
	all,
	layers,
	altitude,
	time,
}: FilterParams): NormalizedFeatureCollection {
	const now = Date.now()

	const features = all.filter(
		f =>
			passesLayerFilter(f, layers) &&
			passesAltitudeFilter(f, altitude) &&
			passesTimeFilter(f, time, now)
	)

	return {
		type: "FeatureCollection",
		features,
	}
}
