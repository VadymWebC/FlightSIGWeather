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

/**
 * Применяет фильтры: тип + высота + время к массиву нормализованных фич.
 * Возвращает FeatureCollection, готовый для карты.
 */
export function filterAwcFeatures({
	all,
	layers,
	altitude,
	time,
}: FilterParams): NormalizedFeatureCollection {
	const { showSigmet, showAirmet, showGAirmet } = layers
	const { minFL, maxFL } = altitude

	// 1) фильтр по типу + высоте
	const byTypeAndAltitude = all.filter(f => {
		const t = f.properties.type

		if (t === "SIGMET" && !showSigmet) return false
		if (t === "AIRMET" && !showAirmet) return false
		if (t === "G_AIRMET" && !showGAirmet) return false

		const min = f.properties.minFlightLevel ?? 0
		const max = f.properties.maxFlightLevel ?? 480

		if (max < minFL) return false
		if (min > maxFL) return false

		return true
	})

	// 2) фильтр по времени
	const now = Date.now()
	const fromTime = now + time.fromOffsetHours * 3600_000
	const toTime = now + time.toOffsetHours * 3600_000

	const byTypeAltitudeAndTime = byTypeAndAltitude.filter(f => {
		// validTimeFrom / validTimeTo — unix seconds
		const startSec =
			f.properties.validTimeFrom ?? f.properties.startTime ?? null
		const endSec = f.properties.validTimeTo ?? f.properties.endTime ?? startSec

		if (startSec == null || endSec == null) {
			// нет информации — не режем по времени
			return true
		}

		const startMs = startSec * 1000
		const endMs = endSec * 1000

		if (endMs < fromTime) return false
		if (startMs > toTime) return false

		return true
	})

	return {
		type: "FeatureCollection",
		features: byTypeAltitudeAndTime,
	}
}
