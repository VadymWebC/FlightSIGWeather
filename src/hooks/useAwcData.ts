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
	fromOffsetHours: number
	toOffsetHours: number
}

export type LayerFilterState = {
	showSigmet: boolean
	showAirmet: boolean
	showGAirmet: boolean
}

export type AltitudeFilterState = {
	minFL: number
	maxFL: number
}

export interface UseAwcDataState {
	loading: boolean
	error: string | null
	rawSigmet: NormalizedFeatureCollection | null
	rawAirsigmet: NormalizedFeatureCollection | null
	filtered: NormalizedFeatureCollection | null
	layers: LayerFilterState
	altitude: AltitudeFilterState
	time: TimeFilterState
	setLayers: (v: LayerFilterState) => void
	setAltitude: (v: AltitudeFilterState) => void
	setTime: (v: TimeFilterState) => void
}

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

	useEffect(() => {
		let cancelled = false

		const load = async () => {
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

				console.log("SIGMET example:", sigmetNorm.features[0])
				console.log("AIRMET example:", airsigmetNorm.features[0])

				setRawSigmet(sigmetNorm)
				setRawAirsigmet(airsigmetNorm)
			} catch (err: any) {
				console.error("Error loading AWC data:", err)
				if (!cancelled) {
					setError(err.message || "Failed to load AWC data")
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		load()

		return () => {
			cancelled = true
		}
	}, [])

	const filtered: NormalizedFeatureCollection | null = useMemo(() => {
		if (!rawSigmet && !rawAirsigmet) return null

		const all: NormalizedFeature[] = [
			...(rawSigmet?.features || []),
			...(rawAirsigmet?.features || []),
		]

		return filterAwcFeatures({
			all,
			layers,
			altitude,
			time,
		})
	}, [rawSigmet, rawAirsigmet, layers, altitude, time])

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
