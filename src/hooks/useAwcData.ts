// src/hooks/useAwcData.ts
import { useEffect, useMemo, useState } from "react"
import { fetchAirsigmet, fetchIsigmet } from "../api/awcClient"
import { normalizeAirsigmet, normalizeIsigmet } from "../map/awcToGeoJson"
import type {
	NormalizedFeature,
	NormalizedFeatureCollection,
} from "../map/awcTypes"
import { filterAwcFeatures } from "../map/filterAwcFeatures"

export type TimeFilterState = {
	/** Hours relative to "now": [-24, +6] */
	fromOffsetHours: number
	toOffsetHours: number
}

export type LayerFilterState = {
	showSigmet: boolean
	showAirmet: boolean
	showGAirmet: boolean
}

export type AltitudeFilterState = {
	/** Minimum flight level (FL) */
	minFL: number
	/** Maximum flight level (FL) */
	maxFL: number
}

export interface UseAwcDataState {
	loading: boolean
	error: string | null

	/** Normalized raw collections (unfiltered) */
	rawSigmet: NormalizedFeatureCollection | null
	rawAirsigmet: NormalizedFeatureCollection | null

	/** Filtered feature collection used by the map */
	filtered: NormalizedFeatureCollection | null

	/** Filters */
	layers: LayerFilterState
	altitude: AltitudeFilterState
	time: TimeFilterState

	/** Filter controls */
	setLayers: (v: LayerFilterState) => void
	setAltitude: (v: AltitudeFilterState) => void
	setTime: (v: TimeFilterState) => void
}

/**
 * Main hook for working with AWC data:
 *  - loads and normalizes SIGMET / AIRMET
 *  - manages filter state
 *  - returns filtered GeoJSON for the map
 */
export function useAwcData(): UseAwcDataState {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [rawSigmet, setRawSigmet] =
		useState<NormalizedFeatureCollection | null>(null)
	const [rawAirsigmet, setRawAirsigmet] =
		useState<NormalizedFeatureCollection | null>(null)

	const [time, setTime] = useState<TimeFilterState>({
		fromOffsetHours: -24,
		toOffsetHours: 6,
	})

	const [layers, setLayers] = useState<LayerFilterState>({
		showSigmet: true,
		showAirmet: true,
		showGAirmet: true,
	})

	const [altitude, setAltitude] = useState<AltitudeFilterState>({
		minFL: 0,
		maxFL: 480,
	})

	// Load and normalize data
	useEffect(() => {
		let cancelled = false

		async function loadAwcData() {
			try {
				setLoading(true)
				setError(null)

				const [isigmetRaw, airsigmetRaw] = await Promise.all([
					fetchIsigmet(),
					fetchAirsigmet(),
				])

				if (cancelled) return

				const sigmetNorm = normalizeIsigmet(isigmetRaw)
				const airsigmetNorm = normalizeAirsigmet(airsigmetRaw)

				setRawSigmet(sigmetNorm)
				setRawAirsigmet(airsigmetNorm)
			} catch (err: any) {
				if (!cancelled) {
					console.error("Error loading AWC data:", err)
					setError(err?.message ?? "Failed to load AWC data")
				}
			} finally {
				if (!cancelled) {
					setLoading(false)
				}
			}
		}

		loadAwcData()

		return () => {
			cancelled = true
		}
	}, [])

	// Normalize altitude range: if min > max, swap them
	const normalizedAltitude = useMemo(() => {
		const { minFL, maxFL } = altitude
		if (minFL > maxFL) {
			return { minFL: maxFL, maxFL: minFL }
		}
		return altitude
	}, [altitude])

	// Apply filters to normalized data
	const filtered: NormalizedFeatureCollection | null = useMemo(() => {
		if (!rawSigmet && !rawAirsigmet) return null

		const all: NormalizedFeature[] = [
			...(rawSigmet?.features ?? []),
			...(rawAirsigmet?.features ?? []),
		]

		return filterAwcFeatures({
			all,
			layers,
			altitude: normalizedAltitude,
			time,
		})
	}, [rawSigmet, rawAirsigmet, layers, normalizedAltitude, time])

	return {
		loading,
		error,
		rawSigmet,
		rawAirsigmet,
		filtered,
		layers,
		altitude,
		time,
		setLayers,
		setAltitude,
		setTime,
	}
}
