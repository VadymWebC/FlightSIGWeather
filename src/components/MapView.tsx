import maplibregl, { Map as MapLibreMap } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useEffect, useRef } from "react"
import { useAwcData } from "../hooks/useAwcData"
import type { NormalizedFeatureCollection } from "../map/awcTypes"
import { FiltersPanel } from "./FiltersPanel"

const WEATHER_SOURCE_ID = "weather"
const WEATHER_FILL_LAYER_ID = "weather-fill"
const WEATHER_OUTLINE_LAYER_ID = "weather-outline"

const emptyFC: NormalizedFeatureCollection = {
	type: "FeatureCollection",
	features: [],
}

const MapView: React.FC = () => {
	const mapContainer = useRef<HTMLDivElement>(null)
	const mapRef = useRef<MapLibreMap | null>(null)
	const weatherReadyRef = useRef(false)
	const lastDataRef = useRef<NormalizedFeatureCollection>(emptyFC)
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

	// вспомогательная функция: попытаться залить текущие данные в source
	const applyDataToSource = () => {
		const map = mapRef.current
		if (!map) return
		if (!weatherReadyRef.current) return

		const src = map.getSource(WEATHER_SOURCE_ID) as
			| maplibregl.GeoJSONSource
			| undefined
		if (!src) return

		const data = lastDataRef.current
		console.log(
			"APPLY DATA TO WEATHER SOURCE:",
			data.features.length,
			"features"
		)
		src.setData(data as any)
	}

	// инициализация карты
	useEffect(() => {
		const container = mapContainer.current
		if (!container) return

		const map = new maplibregl.Map({
			container,
			style: {
				version: 8,
				sources: {
					osm: {
						type: "raster",
						tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
						tileSize: 256,
						attribution: "© OpenStreetMap contributors",
					},
				},
				layers: [
					{
						id: "osm",
						type: "raster",
						source: "osm",
					},
				],
			},
			center: [0, 20],
			zoom: 2,
		})

		mapRef.current = map

		map.on("load", () => {
			map.addSource(WEATHER_SOURCE_ID, {
				type: "geojson",
				data: emptyFC as any,
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
						"#ef4444", // ярко-красный
						"AIRMET",
						"#f97316", // ярко-оранжевый
						"G_AIRMET",
						"#3b82f6", // ярко-синий
						"#a3a3a3", // default
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

			// обработка клика по полигонам
			map.on("click", WEATHER_FILL_LAYER_ID, e => {
				const feature = e.features && e.features[0]
				if (!feature) return

				const props = feature.properties || {}

				const type = props.type || "UNKNOWN"
				const id = props.id || props.icaoId || ""
				const rawText = props.rawText || props.text || ""

				// чуть подрежем текст, чтобы не улетать на экран
				const shortText =
					typeof rawText === "string" && rawText.length > 600
						? rawText.slice(0, 600) + "…"
						: rawText

				const html = `
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

				// определяем координату клика
				const lngLat = e.lngLat

				// если popup уже есть — переиспользуем
				if (!popupRef.current) {
					popupRef.current = new maplibregl.Popup({
						closeButton: true,
						closeOnClick: true,
						maxWidth: "320px",
					})
				}

				popupRef.current.setLngLat(lngLat).setHTML(html).addTo(map)
			})

			// меняем курсор при наведении
			map.on("mouseenter", WEATHER_FILL_LAYER_ID, () => {
				map.getCanvas().style.cursor = "pointer"
			})
			map.on("mouseleave", WEATHER_FILL_LAYER_ID, () => {
				map.getCanvas().style.cursor = ""
			})

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
			lastDataRef.current = emptyFC
		}
	}, [])

	// обновление lastDataRef и попытка применить данные
	useEffect(() => {
		const data: NormalizedFeatureCollection = filtered ?? emptyFC
		lastDataRef.current = data
		applyDataToSource()
	}, [filtered])

	return (
		<div style={{ position: "relative", width: "100%", height: "100%" }}>
			<div ref={mapContainer} className="map-container" />

			<div
				style={{
					position: "absolute",
					top: 8,
					left: 8,
					padding: "6px 10px",
					background: "rgba(15,23,42,0.8)",
					color: "white",
					fontSize: 12,
					borderRadius: 4,
					zIndex: 1,
				}}
			>
				{loading && <div>Loading AWC data…</div>}
				{error && <div style={{ color: "#f97373" }}>Error: {error}</div>}
				{!loading && !error && filtered && (
					<div>Features: {filtered.features.length}</div>
				)}
			</div>

			{/* Панель фильтров */}
			<FiltersPanel
				layers={layers}
				altitude={altitude}
				time={time}
				onLayersChange={setLayers}
				onAltitudeChange={setAltitude}
				onTimeChange={setTime}
			/>
		</div>
	)
}

export default MapView
