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
		const v = e.target.value.trim()
		const num = v === "" ? 0 : Number(v)
		onAltitudeChange({ ...altitude, minFL: num })
	}

	const handleMaxFL = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value.trim()
		const num = v === "" ? 480 : Number(v)
		onAltitudeChange({ ...altitude, maxFL: num })
	}

	const handleFromHours = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value.trim()
		// ограничим диапазон [-24, 0]
		let num = v === "" ? -24 : Number(v)
		if (Number.isNaN(num)) num = -24
		if (num < -24) num = -24
		if (num > 0) num = 0
		onTimeChange({ ...time, fromOffsetHours: num })
	}

	const handleToHours = (e: React.ChangeEvent<HTMLInputElement>) => {
		const v = e.target.value.trim()
		// ограничим диапазон [0, +6]
		let num = v === "" ? 6 : Number(v)
		if (Number.isNaN(num)) num = 6
		if (num < 0) num = 0
		if (num > 6) num = 6
		onTimeChange({ ...time, toOffsetHours: num })
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
				minWidth: 210,
			}}
		>
			<div style={{ fontWeight: 600, marginBottom: 6 }}>Фильтры</div>

			{/* Типы */}
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

			{/* Высота */}
			<div style={{ marginBottom: 8 }}>
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

			{/* Время */}
			<div>
				<div style={{ marginBottom: 4 }}>Время (часы от сейчас):</div>
				<div style={{ display: "flex", gap: 4 }}>
					<input
						type="number"
						value={time.fromOffsetHours}
						onChange={handleFromHours}
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
						value={time.toOffsetHours}
						onChange={handleToHours}
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
				<div style={{ marginTop: 2, fontSize: 11, opacity: 0.8 }}>
					от -24 до 0 (прошлое), от 0 до +6 (будущее)
				</div>
			</div>
		</div>
	)
}
