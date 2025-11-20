import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import React, { useEffect, useRef } from "react"

const Map: React.FC = () => {
	const mapContainer = useRef<HTMLDivElement>(null)
	const map = useRef<maplibregl.Map | null>(null)

	useEffect(() => {
		// wait until the container is actually exist
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

	return <div ref={mapContainer} className="map-container" />
}

export default Map
