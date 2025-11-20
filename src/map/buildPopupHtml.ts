// src/map/buildPopupHtml.ts
import type { NormalizedWeatherFeatureProperties } from "./awcTypes"

function formatDate(isoOrNull: string | null): string {
	if (!isoOrNull) return "Unknown"
	const d = new Date(isoOrNull)
	if (Number.isNaN(d.getTime())) return "Unknown"

	return d.toLocaleString(undefined, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	})
}

function formatAltitude(minFL: number | null, maxFL: number | null): string {
	if (minFL == null && maxFL == null) return "Unknown"

	// У тебя уже значения в футах, судя по подписи в UI
	const minFt = minFL ?? null
	const maxFt = maxFL ?? null

	if (minFt != null && maxFt != null) {
		if (minFt === maxFt) return `${minFt} ft`
		return `${minFt} – ${maxFt} ft`
	}
	if (minFt != null) return `From ${minFt} ft`
	if (maxFt != null) return `Up to ${maxFt} ft`

	return "Unknown"
}

export function buildPopupHtml(
	props: NormalizedWeatherFeatureProperties
): string {
	const type = props.type ?? "UNKNOWN"
	const hazard = props.hazard ?? "Unknown"
	const altitudeLabel = formatAltitude(
		props.minFlightLevel,
		props.maxFlightLevel
	)

	const validFromLabel = formatDate(props.startTime)
	const validToLabel = formatDate(props.endTime)

	const rawText = (props.rawText ?? "").trim()
	const maxRawLength = 2000
	const rawTextSafe =
		rawText.length > maxRawLength
			? rawText.slice(0, maxRawLength) + "…"
			: rawText || "No raw text available."

	// Цвет кружка слева от заголовка
	const typeColor =
		type === "SIGMET" ? "#ef4444" : type === "AIRMET" ? "#f97316" : "#3b82f6"

	// Небольшой “титульный” текст типа
	const typeLabel = type.toUpperCase()

	// Простой escape для сырых данных (хотя rawText уже отображается в <pre>-подобном блоке)
	const escapeHtml = (s: string) =>
		s.replace(/&/g, "&amp;").replace(/</g, "&lt;")

	return `
<div style="
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  color: #111827;
  max-width: 320px;
">
  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="
        display:inline-flex;
        width:10px;
        height:10px;
        border-radius:999px;
        background-color:${typeColor};
      "></span>
      <span style="font-weight:600;text-transform:uppercase;letter-spacing:0.03em;">
        ${escapeHtml(typeLabel)}
      </span>
    </div>
  </div>

  <!-- Hazard -->
  <div style="margin-bottom:4px;">
    <span style="font-weight:600;">Hazard:</span>
    <span>${escapeHtml(hazard)}</span>
  </div>

  <!-- Altitude -->
  <div style="margin-bottom:4px;">
    <span style="font-weight:600;">Altitude:</span>
    <span>${escapeHtml(altitudeLabel)}</span>
  </div>

  <!-- Valid From -->
  <div style="margin-bottom:2px;">
    <span style="font-weight:600;">Valid From:</span>
    <span>${escapeHtml(validFromLabel)}</span>
  </div>

  <!-- Valid To -->
  <div style="margin-bottom:8px;">
    <span style="font-weight:600;">Valid To:</span>
    <span>${escapeHtml(validToLabel)}</span>
  </div>

  <!-- Raw text block -->
  <div style="margin-top:8px;">
    <div style="font-weight:600;margin-bottom:4px;">Raw Text:</div>
    <div style="
      max-height: 180px;
      overflow:auto;
      padding:8px;
      background-color:#f9fafb;
      border-radius:4px;
      border:1px solid #e5e7eb;
      white-space:pre-wrap;
      line-height:1.34;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      font-size:12px;
    ">
      ${escapeHtml(rawTextSafe)}
    </div>
  </div>
</div>
`.trim()
}
