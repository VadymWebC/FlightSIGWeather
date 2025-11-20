// src/map/awcTypes.ts

export type PhenomenonType = "SIGMET" | "AIRMET" | "G_AIRMET" | "OTHER"

export interface NormalizedWeatherFeatureProperties {
	id: string
	type: PhenomenonType
	rawText: string
	startTime: string | null
	endTime: string | null
	minFlightLevel: number | null
	maxFlightLevel: number | null
	hazard: string | null
	[key: string]: any
}

export interface NormalizedFeature {
	type: "Feature"
	geometry: {
		type: string
		coordinates: any
	}
	properties: NormalizedWeatherFeatureProperties
}

export interface NormalizedFeatureCollection {
	type: "FeatureCollection"
	features: NormalizedFeature[]
}
