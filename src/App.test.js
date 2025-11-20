jest.mock("maplibre-gl", () => {
	// Полный мок без requireActual — ничего не импортируем из реальной библиотеки
	return {
		Map: function MockMap() {
			return {
				on: jest.fn(),
				off: jest.fn(),
				remove: jest.fn(),
				addSource: jest.fn(),
				getSource: jest.fn(),
				addLayer: jest.fn(),
				setPaintProperty: jest.fn(),
				setLayoutProperty: jest.fn(),
				fitBounds: jest.fn(),
			}
		},
		NavigationControl: function MockNavControl() {},
		AttributionControl: function MockAttrControl() {},
	}
})
import { render } from "@testing-library/react"
import App from "./App"

test("renders without crashing", () => {
	render(<App />)
})
