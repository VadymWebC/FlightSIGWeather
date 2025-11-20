import React from "react"
import type { AltitudeFilterState, LayerFilterState } from "../hooks/useAwcData"

interface FiltersPanelProps {
	layers: LayerFilterState
	altitude: AltitudeFilterState
	onLayersChange: (v: LayerFilterState) => void
	onAltitudeChange: (v: AltitudeFilterState) => void
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
	layers,
	altitude,
	onLayersChange,
	onAltitudeChange,
}) => {
	const handleLayerToggle = (key: keyof LayerFilterState) => {
		onLayersChange({ ...layers, [key]: !layers[key] })
	}

	const handleMinFL = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value.trim()
		const num = v === "" ? 0 : Number(v)
		onAltitudeChange({ ...altitude, minFL: num })
	}

	const handleMaxFL = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value.trim()
		const num = v === "" ? 480 : Number(v)
		onAltitudeChange({ ...altitude, maxFL: num })
	}

	return (
		<div
			style={{
				position: "absolute",
				top: 8,
				right: 8,
				padding: "8px 10px",
				background: "rgba(15,23,42,0.85)",
				color: "white",
				fontSize: 12,
				borderRadius: 4,
				zIndex: 2,
				minWidth: 180,
			}}
		>
			<div style={{ fontWeight: 600, marginBottom: 6 }}>Фильтры</div>

			{/* Чекбоксы типов */}
			<div style={{ marginBottom: 8 }}>
				<label
					style={{
						display: "flex",
						alignItems: "center",
						gap: 4,
						marginBottom: 2,
					}}
				>
					<input
						type="checkbox"
						checked={layers.showSigmet}
						onChange={() => handleLayerToggle("showSigmet")}
					/>
					<span>SIGMET</span>
				</label>
				<label
					style={{
						display: "flex",
						alignItems: "center",
						gap: 4,
						marginBottom: 2,
					}}
				>
					<input
						type="checkbox"
						checked={layers.showAirmet}
						onChange={() => handleLayerToggle("showAirmet")}
					/>
					<span>AIRMET</span>
				</label>
				<label style={{ display: "flex", alignItems: "center", gap: 4 }}>
					<input
						type="checkbox"
						checked={layers.showGAirmet}
						onChange={() => handleLayerToggle("showGAirmet")}
					/>
					<span>G-AIRMET</span>
				</label>
			</div>

			{/* Высота (FL) */}
			<div>
				<div style={{ marginBottom: 4 }}>Высота (FL):</div>
				<div style={{ display: "flex", gap: 4 }}>
					<input
						type="number"
						placeholder="min"
						value={altitude.minFL}
						onChange={handleMinFL}
						style={{
							width: 70,
							padding: "2px 4px",
							fontSize: 12,
							borderRadius: 3,
							border: "1px solid #4b5563",
							background: "#020617",
							color: "white",
						}}
					/>
					<input
						type="number"
						placeholder="max"
						value={altitude.maxFL}
						onChange={handleMaxFL}
						style={{
							width: 70,
							padding: "2px 4px",
							fontSize: 12,
							borderRadius: 3,
							border: "1px solid #4b5563",
							background: "#020617",
							color: "white",
						}}
					/>
				</div>
			</div>
		</div>
	)
}
