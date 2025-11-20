//src/components/MapView
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useEffect, useRef } from "react"
import { useAwcData } from "../hooks/useAwcData"

const MapView: React.FC = () => {
	const mapContainer = useRef<HTMLDivElement>(null)
	const map = useRef<maplibregl.Map | null>(null)

	const { loading, error, filtered } = useAwcData()
	useEffect(() => {
		// подождать, пока контейнер реально есть
		const container = mapContainer.current
		if (!container) return

		map.current = new maplibregl.Map({
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

		return () => map.current?.remove()
	}, [])

	return (
		<div style={{ position: "relative", width: "100%", height: "100%" }}>
			<div ref={mapContainer} className="map-container" />

			{/* Небольшой статус-оверлей в углу */}
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
		</div>
	)
}

export default MapView
