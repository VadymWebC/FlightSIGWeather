// // src/components/Map.tsx
// import maplibregl from "maplibre-gl"
// import "maplibre-gl/dist/maplibre-gl.css"
// import { useEffect, useRef } from "react"

// const Map = () => {
// 	const mapContainer = useRef<HTMLDivElement>(null)
// 	const map = useRef<maplibregl.Map | null>(null)

// 	useEffect(() => {
// 		if (map.current || !mapContainer.current) return
// 		console.log("Container found:", mapContainer.current)

// 		map.current = new maplibregl.Map({
// 			container: mapContainer.current,
// 			style: {
// 				version: 8,
// 				sources: {
// 					osm: {
// 						type: "raster",
// 						tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
// 						tileSize: 256,
// 						attribution: "© OpenStreetMap contributors",
// 					},
// 				},
// 				layers: [
// 					{
// 						id: "osm",
// 						type: "raster",
// 						source: "osm",
// 					},
// 				],
// 			},
// 			center: [0, 20],
// 			zoom: 2,
// 		})
// 	}, [])

// 	useEffect(() => {
// 		if (map.current || !mapContainer.current) return

// 		map.current = new maplibregl.Map({
// 			container: mapContainer.current,
// 			style: {
// 				version: 8,
// 				sources: {
// 					osm: {
// 						type: "raster",
// 						tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
// 						tileSize: 256,
// 						attribution: "© OpenStreetMap contributors",
// 					},
// 				},
// 				layers: [
// 					{
// 						id: "osm",
// 						type: "raster",
// 						source: "osm",
// 					},
// 				],
// 			},
// 			center: [0, 20], // долгота, широта (центр мира)
// 			zoom: 2,
// 		})

// 		return () => {
// 			map.current?.remove()
// 		}
// 	}, [])

// 	return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />
// }

// export default Map

// const Map = () => {
// 	const mapContainer = useRef<HTMLDivElement>(null)
// 	const map = useRef<maplibregl.Map | null>(null)

// 	useEffect(() => {
// 		if (map.current || !mapContainer.current) return

// 		map.current = new maplibregl.Map({
// 			container: mapContainer.current,
// 			style: {
// 				version: 8,
// 				sources: {
// 					osm: {
// 						type: "raster",
// 						tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
// 						tileSize: 256,
// 						attribution: "© OpenStreetMap contributors",
// 					},
// 				},
// 				layers: [
// 					{
// 						id: "osm",
// 						type: "raster",
// 						source: "osm",
// 					},
// 				],
// 			},
// 			center: [0, 20],
// 			zoom: 2,
// 		})

// 		return () => map.current?.remove()
// 	}, [])

// 	return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />
// }

// export default Map
