// src/map/filterAwcFeatures.test.ts
import type {
	AltitudeFilterState,
	LayerFilterState,
	TimeFilterState,
} from "../hooks/useAwcData"
import type { NormalizedFeature } from "./awcTypes"
import { filterAwcFeatures } from "./filterAwcFeatures"

// Simplified factory for tests: we accept only properties,
// internally fill required fields and cast via any.
function makeFeature(
	props: Partial<NormalizedFeature["properties"]> & { id: string }
): NormalizedFeature {
	return {
		type: "Feature",
		geometry: {
			type: "Polygon",
			coordinates: [
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 0],
				],
			],
		},
		properties: {
			// default base values
			id: props.id,
			type: "SIGMET",
			rawText: "TEST",
			startTime: undefined,
			endTime: undefined,
			minFlightLevel: 0,
			maxFlightLevel: 480,
			validTimeFrom: undefined,
			validTimeTo: undefined,
			hazard: undefined,
			// override with provided values
			...props,
		} as any,
	} as NormalizedFeature
}

const baseLayers: LayerFilterState = {
	showSigmet: true,
	showAirmet: true,
	showGAirmet: true,
}

const baseAltitude: AltitudeFilterState = {
	minFL: 0,
	maxFL: 480,
}

const baseTime: TimeFilterState = {
	fromOffsetHours: -24,
	toOffsetHours: 6,
}

describe("filterAwcFeatures", () => {
	it("filters by layer type", () => {
		const sigmet = makeFeature({
			id: "sig1",
			type: "SIGMET",
		})
		const airmet = makeFeature({
			id: "air1",
			type: "AIRMET",
		})

		const result = filterAwcFeatures({
			all: [sigmet, airmet],
			layers: { ...baseLayers, showSigmet: false }, // hide SIGMET
			altitude: baseAltitude,
			time: baseTime,
		})

		const ids = result.features.map(f => f.properties.id)
		expect(ids).toEqual(["air1"])
	})

	it("filters by altitude range", () => {
		const low = makeFeature({
			id: "low",
			minFlightLevel: 0,
			maxFlightLevel: 100,
		})
		const high = makeFeature({
			id: "high",
			minFlightLevel: 300,
			maxFlightLevel: 400,
		})

		const result = filterAwcFeatures({
			all: [low, high],
			layers: baseLayers,
			altitude: { minFL: 0, maxFL: 200 }, // cut everything above FL200
			time: baseTime,
		})

		const ids = result.features.map(f => f.properties.id)
		expect(ids).toEqual(["low"])
	})

	it("filters by time window (unix seconds)", () => {
		const now = Date.now()
		const oneHour = 3600_000

		// Feature that is valid right now
		const current = makeFeature({
			id: "current",
			validTimeFrom: Math.floor((now - oneHour) / 1000),
			validTimeTo: Math.floor((now + oneHour) / 1000),
		})

		// Feature from 10–12 hours ago, already expired
		const past = makeFeature({
			id: "past",
			validTimeFrom: Math.floor((now - 12 * oneHour) / 1000),
			validTimeTo: Math.floor((now - 11 * oneHour) / 1000),
		})

		const result = filterAwcFeatures({
			all: [current, past],
			layers: baseLayers,
			altitude: baseAltitude,
			time: { fromOffsetHours: -2, toOffsetHours: 2 },
		})

		const ids = result.features.map(f => f.properties.id)
		expect(ids).toEqual(["current"])
	})

	it("does not cut features without time info", () => {
		const noTime = makeFeature({
			id: "noTime",
			validTimeFrom: undefined,
			validTimeTo: undefined,
		})

		const result = filterAwcFeatures({
			all: [noTime],
			layers: baseLayers,
			altitude: baseAltitude,
			time: { fromOffsetHours: 0, toOffsetHours: 0 },
		})

		expect(result.features).toHaveLength(1)
		expect(result.features[0].properties.id).toBe("noTime")
	})
})
