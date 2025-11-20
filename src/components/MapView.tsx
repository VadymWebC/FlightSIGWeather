// src/components/MapView.tsx
import maplibregl, { Map as MapLibreMap } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useEffect, useRef } from "react"
import { useAwcData } from "../hooks/useAwcData"
import type { NormalizedFeatureCollection } from "../map/awcTypes"
import { DataStatusOverlay } from "./DataStatusOverlay"
import { FiltersPanel } from "./FiltersPanel"
import { Legend } from "./Legend"

const WEATHER_SOURCE_ID = "weather"
const WEATHER_FILL_LAYER_ID = "weather-fill"
const WEATHER_OUTLINE_LAYER_ID = "weather-outline"

const EMPTY_FEATURE_COLLECTION: NormalizedFeatureCollection = {
	type: "FeatureCollection",
	features: [],
}

/**
 * Builds HTML content for the feature popup.
 */
function buildPopupHtml(properties: Record<string, any>): string {
	const type = properties.type ?? "UNKNOWN"
	const id = properties.id ?? properties.icaoId ?? ""
	const rawText = properties.rawText ?? properties.text ?? ""

	// Truncate long text to avoid overflow
	const shortText =
		typeof rawText === "string" && rawText.length > 600
			? rawText.slice(0, 600) + "…"
			: rawText

	return `
    <div style="max-width: 320px; font-size: 12px;">
      <div style="font-weight: 600; margin-bottom: 4px;">
        ${type}${id ? ` — ${id}` : ""}
      </div>
      ${
				shortText
					? `<pre style="white-space: pre-wrap; margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${shortText}</pre>`
					: "<div>No text</div>"
			}
    </div>
  `
}

/**
 * Attaches click handler to the weather layer for displaying popups.
 */
function attachFeatureClickHandler(
	map: MapLibreMap,
	layerId: string,
	popupRef: React.MutableRefObject<maplibregl.Popup | null>
) {
	map.on("click", layerId, e => {
		const feature = e.features?.[0]
		if (!feature) return

		const props = feature.properties ?? {}
		const html = buildPopupHtml(props)
		const lngLat = e.lngLat

		// Reuse existing popup if available
		if (!popupRef.current) {
			popupRef.current = new maplibregl.Popup({
				closeButton: true,
				closeOnClick: true,
				maxWidth: "320px",
			})
		}

		popupRef.current.setLngLat(lngLat).setHTML(html).addTo(map)
	})
}

/**
 * Attaches cursor change handlers for the weather layer.
 */
function attachCursorHandlers(map: MapLibreMap, layerId: string) {
	map.on("mouseenter", layerId, () => {
		map.getCanvas().style.cursor = "pointer"
	})
	map.on("mouseleave", layerId, () => {
		map.getCanvas().style.cursor = ""
	})
}

/**
 * Creates the map style with OSM tiles.
 */
function createMapStyle() {
	return {
		version: 8 as const,
		sources: {
			osm: {
				type: "raster" as const,
				tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
				tileSize: 256,
				attribution: "© OpenStreetMap contributors",
			},
		},
		layers: [
			{
				id: "osm",
				type: "raster" as const,
				source: "osm",
			},
		],
	}
}

/**
 * Adds weather source and layers to the map.
 */
function setupWeatherLayers(map: MapLibreMap) {
	map.addSource(WEATHER_SOURCE_ID, {
		type: "geojson",
		data: EMPTY_FEATURE_COLLECTION as any,
	})

	map.addLayer({
		id: WEATHER_FILL_LAYER_ID,
		type: "fill",
		source: WEATHER_SOURCE_ID,
		paint: {
			"fill-color": [
				"match",
				["get", "type"],
				"SIGMET",
				"#ef4444",
				"AIRMET",
				"#f97316",
				"G_AIRMET",
				"#3b82f6",
				"#a3a3a3",
			],
			"fill-opacity": 0.4,
		},
	})

	map.addLayer({
		id: WEATHER_OUTLINE_LAYER_ID,
		type: "line",
		source: WEATHER_SOURCE_ID,
		paint: {
			"line-color": [
				"match",
				["get", "type"],
				"SIGMET",
				"#b91c1c",
				"AIRMET",
				"#c2410c",
				"G_AIRMET",
				"#1d4ed8",
				"#4b5563",
			],
			"line-width": 1.2,
		},
	})
}

const MapView: React.FC = () => {
	const mapContainer = useRef<HTMLDivElement>(null)
	const mapRef = useRef<MapLibreMap | null>(null)
	const weatherReadyRef = useRef(false)
	const lastDataRef = useRef<NormalizedFeatureCollection>(
		EMPTY_FEATURE_COLLECTION
	)
	const popupRef = useRef<maplibregl.Popup | null>(null)

	const {
		loading,
		error,
		filtered,
		layers,
		altitude,
		time,
		setLayers,
		setAltitude,
		setTime,
	} = useAwcData()

	/**
	 * Applies current data to the weather GeoJSON source.
	 */
	const applyDataToSource = () => {
		const map = mapRef.current
		if (!map || !weatherReadyRef.current) return

		const src = map.getSource(WEATHER_SOURCE_ID) as
			| maplibregl.GeoJSONSource
			| undefined
		if (!src) return

		const data = lastDataRef.current
		src.setData(data as any)
	}

	// Initialize map
	useEffect(() => {
		const container = mapContainer.current
		if (!container) return

		const map = new maplibregl.Map({
			container,
			style: createMapStyle(),
			center: [0, 20],
			zoom: 2,
		})

		mapRef.current = map

		map.on("load", () => {
			setupWeatherLayers(map)
			attachFeatureClickHandler(map, WEATHER_FILL_LAYER_ID, popupRef)
			attachCursorHandlers(map, WEATHER_FILL_LAYER_ID)

			weatherReadyRef.current = true
			applyDataToSource()
		})

		return () => {
			if (popupRef.current) {
				popupRef.current.remove()
				popupRef.current = null
			}
			map.remove()
			mapRef.current = null
			weatherReadyRef.current = false
			lastDataRef.current = EMPTY_FEATURE_COLLECTION
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Update data when filtered changes
	useEffect(() => {
		const data: NormalizedFeatureCollection =
			filtered ?? EMPTY_FEATURE_COLLECTION
		lastDataRef.current = data
		applyDataToSource()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filtered])

	const featureCount = filtered?.features.length ?? 0

	return (
		<div style={{ position: "relative", width: "100%", height: "100%" }}>
			<div ref={mapContainer} className="map-container" />

			<DataStatusOverlay
				loading={loading}
				error={error}
				featureCount={featureCount}
			/>

			<FiltersPanel
				layers={layers}
				altitude={altitude}
				time={time}
				onLayersChange={setLayers}
				onAltitudeChange={setAltitude}
				onTimeChange={setTime}
			/>

			<Legend />
		</div>
	)
}

export default MapView
