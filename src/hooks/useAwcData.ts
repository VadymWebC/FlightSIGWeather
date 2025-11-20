// src/hooks/useAwcData.ts
import { useEffect, useMemo, useState } from "react"
import { fetchAirsigmet, fetchIsigmet } from "../api/awcClient"
import { normalizeAirsigmet, normalizeIsigmet } from "../map/awcToGeoJson"
import type {
	NormalizedFeature,
	NormalizedFeatureCollection,
} from "../map/awcTypes"

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
	setLayers: (v: LayerFilterState) => void
	setAltitude: (v: AltitudeFilterState) => void
}

export function useAwcData(): UseAwcDataState {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [rawSigmet, setRawSigmet] =
		useState<NormalizedFeatureCollection | null>(null)
	const [rawAirsigmet, setRawAirsigmet] =
		useState<NormalizedFeatureCollection | null>(null)

	// фильтры
	const [layers, setLayers] = useState<LayerFilterState>({
		showSigmet: true,
		showAirmet: true,
		showGAirmet: true,
	})

	const [altitude, setAltitude] = useState<AltitudeFilterState>({
		minFL: 0,
		maxFL: 480,
	})

	// загрузка и нормализация
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

	// применение фильтров (тип + высота)
	const filtered: NormalizedFeatureCollection | null = useMemo(() => {
		if (!rawSigmet && !rawAirsigmet) return null

		const all: NormalizedFeature[] = [
			...(rawSigmet?.features || []),
			...(rawAirsigmet?.features || []),
		]

		const { showSigmet, showAirmet, showGAirmet } = layers
		const { minFL, maxFL } = altitude

		const byTypeAndAltitude = all.filter(f => {
			const t = f.properties.type

			if (t === "SIGMET" && !showSigmet) return false
			if (t === "AIRMET" && !showAirmet) return false
			if (t === "G_AIRMET" && !showGAirmet) return false

			const min = f.properties.minFlightLevel ?? 0
			const max = f.properties.maxFlightLevel ?? 480

			// пересечение диапазонов [min,max] и [minFL,maxFL]
			if (max < minFL) return false
			if (min > maxFL) return false

			return true
		})

		return {
			type: "FeatureCollection",
			features: byTypeAndAltitude,
		}
	}, [rawSigmet, rawAirsigmet, layers, altitude])

	return {
		loading,
		error,
		rawSigmet,
		rawAirsigmet,
		filtered,
		layers,
		altitude,
		setLayers,
		setAltitude,
	}
}
