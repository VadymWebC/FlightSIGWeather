// src/components/Legend.tsx
import React from "react"

export const Legend: React.FC = () => {
	const items = [
		{ label: "SIGMET", color: "#ef4444" },
		{ label: "AIRMET", color: "#f97316" },
		{ label: "G-AIRMET", color: "#3b82f6" },
	]

	return (
		<div
			style={{
				position: "absolute",
				left: 8,
				bottom: 8,
				padding: "8px 10px",
				background: "rgba(15,23,42,0.85)",
				color: "white",
				fontSize: 12,
				borderRadius: 4,
				zIndex: 2,
			}}
		>
			<div style={{ marginBottom: 6, fontWeight: 600 }}>Legend</div>
			{items.map(item => (
				<div
					key={item.label}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginBottom: 4,
					}}
				>
					<span
						style={{
							width: 14,
							height: 14,
							borderRadius: 2,
							backgroundColor: item.color,
							border: "1px solid rgba(148,163,184,0.5)",
							flexShrink: 0,
						}}
					/>
					<span>{item.label}</span>
				</div>
			))}
		</div>
	)
}
