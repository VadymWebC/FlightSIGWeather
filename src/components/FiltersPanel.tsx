// src/components/FiltersPanel.tsx
import React from "react"
import type {
	AltitudeFilterState,
	LayerFilterState,
	TimeFilterState,
} from "../hooks/useAwcData"

interface FiltersPanelProps {
	layers: LayerFilterState
	altitude: AltitudeFilterState
	time: TimeFilterState
	onLayersChange: (v: LayerFilterState) => void
	onAltitudeChange: (v: AltitudeFilterState) => void
	onTimeChange: (v: TimeFilterState) => void
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
	layers,
	altitude,
	time,
	onLayersChange,
	onAltitudeChange,
	onTimeChange,
}) => {
	const handleLayerToggle = (key: keyof LayerFilterState) => {
		onLayersChange({ ...layers, [key]: !layers[key] })
	}

	const handleMinFL = (e: React.ChangeEvent<HTMLInputElement>) => {
		const num = Number(e.target.value)
		onAltitudeChange({ ...altitude, minFL: num })
	}

	const handleMaxFL = (e: React.ChangeEvent<HTMLInputElement>) => {
		const num = Number(e.target.value)
		onAltitudeChange({ ...altitude, maxFL: num })
	}

	const handleFromHours = (e: React.ChangeEvent<HTMLInputElement>) => {
		const num = Number(e.target.value)
		onTimeChange({ ...time, fromOffsetHours: num })
	}

	const handleToHours = (e: React.ChangeEvent<HTMLInputElement>) => {
		const num = Number(e.target.value)
		onTimeChange({ ...time, toOffsetHours: num })
	}

	return (
		<div
			style={{
				position: "absolute",
				top: 16,
				right: 16,
				padding: "16px",
				background: "white",
				color: "#1f2937",
				fontSize: 13,
				borderRadius: 8,
				boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
				zIndex: 2,
				minWidth: 260,
			}}
		>
			{/* Title */}
			<div
				style={{
					fontWeight: 600,
					marginBottom: 12,
					fontSize: 14,
					color: "#111827",
				}}
			>
				Layers
			</div>

			{/* Layer toggles */}
			<div style={{ marginBottom: 16 }}>
				<label
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginBottom: 6,
						cursor: "pointer",
					}}
				>
					<input
						type="checkbox"
						checked={layers.showSigmet}
						onChange={() => handleLayerToggle("showSigmet")}
						style={{ cursor: "pointer" }}
					/>
					<span
						style={{
							display: "inline-block",
							width: 16,
							height: 16,
							backgroundColor: "#ef4444",
							borderRadius: 3,
							border: "1px solid #b91c1c",
						}}
					/>
					<span>SIGMET</span>
				</label>
				<label
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginBottom: 6,
						cursor: "pointer",
					}}
				>
					<input
						type="checkbox"
						checked={layers.showAirmet}
						onChange={() => handleLayerToggle("showAirmet")}
						style={{ cursor: "pointer" }}
					/>
					<span
						style={{
							display: "inline-block",
							width: 16,
							height: 16,
							backgroundColor: "#f97316",
							borderRadius: 3,
							border: "1px solid #c2410c",
						}}
					/>
					<span>AIRMET</span>
				</label>
				<label
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						cursor: "pointer",
					}}
				>
					<input
						type="checkbox"
						checked={layers.showGAirmet}
						onChange={() => handleLayerToggle("showGAirmet")}
						style={{ cursor: "pointer" }}
					/>
					<span
						style={{
							display: "inline-block",
							width: 16,
							height: 16,
							backgroundColor: "#3b82f6",
							borderRadius: 3,
							border: "1px solid #1d4ed8",
						}}
					/>
					<span>G-AIRMET</span>
				</label>
			</div>

			{/* Altitude Range */}
			<div style={{ marginBottom: 16 }}>
				<div
					style={{
						fontWeight: 600,
						marginBottom: 8,
						fontSize: 13,
						color: "#374151",
					}}
				>
					Altitude Range
				</div>
				<div style={{ marginBottom: 8 }}>
					<label
						style={{
							display: "block",
							fontSize: 12,
							color: "#6b7280",
							marginBottom: 4,
						}}
					>
						Min FL: {altitude.minFL.toLocaleString()} ft
					</label>
					<input
						type="range"
						min="0"
						max="480"
						step="10"
						value={altitude.minFL}
						onChange={handleMinFL}
						style={{
							width: "100%",
							cursor: "pointer",
						}}
					/>
				</div>
				<div>
					<label
						style={{
							display: "block",
							fontSize: 12,
							color: "#6b7280",
							marginBottom: 4,
						}}
					>
						Max FL: {altitude.maxFL.toLocaleString()} ft
					</label>
					<input
						type="range"
						min="0"
						max="480"
						step="10"
						value={altitude.maxFL}
						onChange={handleMaxFL}
						style={{
							width: "100%",
							cursor: "pointer",
						}}
					/>
				</div>
				<div
					style={{
						fontSize: 11,
						color: "#9ca3af",
						marginTop: 4,
					}}
				>
					0 ft – 48,000 ft
				</div>
			</div>

			{/* Time Filter */}
			<div>
				<div
					style={{
						fontWeight: 600,
						marginBottom: 8,
						fontSize: 13,
						color: "#374151",
					}}
				>
					Time Filter
				</div>
				<div style={{ marginBottom: 8 }}>
					<label
						style={{
							display: "block",
							fontSize: 12,
							color: "#6b7280",
							marginBottom: 4,
						}}
					>
						From: {time.fromOffsetHours}h
					</label>
					<input
						type="range"
						min="-24"
						max="0"
						step="1"
						value={time.fromOffsetHours}
						onChange={handleFromHours}
						style={{
							width: "100%",
							cursor: "pointer",
						}}
					/>
				</div>
				<div>
					<label
						style={{
							display: "block",
							fontSize: 12,
							color: "#6b7280",
							marginBottom: 4,
						}}
					>
						To: +{time.toOffsetHours}h
					</label>
					<input
						type="range"
						min="0"
						max="6"
						step="1"
						value={time.toOffsetHours}
						onChange={handleToHours}
						style={{
							width: "100%",
							cursor: "pointer",
						}}
					/>
				</div>
				<div
					style={{
						fontSize: 11,
						color: "#9ca3af",
						marginTop: 4,
					}}
				>
					From -24h to +6h (relative to current time)
				</div>
			</div>
		</div>
	)
}
