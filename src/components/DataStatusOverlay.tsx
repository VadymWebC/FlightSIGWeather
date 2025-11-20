// src/components/DataStatusOverlay.tsx
import React from "react"

interface DataStatusOverlayProps {
	loading: boolean
	error: string | null
	featureCount: number
}

export const DataStatusOverlay: React.FC<DataStatusOverlayProps> = ({
	loading,
	error,
	featureCount,
}) => {
	let content: React.ReactNode = null

	if (loading) {
		content = "Loading AWC data..."
	} else if (error) {
		content = `Error: ${error}`
	} else {
		content = `Features: ${featureCount}`
	}

	return (
		<div
			style={{
				position: "absolute",
				top: 8,
				left: 8,
				padding: "6px 10px",
				background: "rgba(15,23,42,0.85)",
				color: "white",
				fontSize: 12,
				borderRadius: 4,
				zIndex: 2,
				pointerEvents: "none",
			}}
		>
			{content}
		</div>
	)
}
