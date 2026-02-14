import type { TaxonomyCategory } from "@vibe/scoring";

const CATEGORY_ORDER: TaxonomyCategory[] = [
  "intelligence",
  "tooling",
  "autonomy",
  "ship",
  "security",
  "continuity",
  "ops",
  "social",
];

const CATEGORY_SHORT: Record<TaxonomyCategory, string> = {
  intelligence: "INT",
  tooling: "TOOL",
  continuity: "MEM",
  autonomy: "AUTO",
  ship: "SHIP",
  security: "SEC",
  ops: "OPS",
  social: "SOC",
};

function polarToXY(angle: number, radius: number, cx: number, cy: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function makePolygonPoints(
  values: number[],
  maxRadius: number,
  cx: number,
  cy: number
): string {
  const step = 360 / values.length;
  return values
    .map((v, i) => {
      const r = (v / 100) * maxRadius;
      const { x, y } = polarToXY(step * i, r, cx, cy);
      return `${x},${y}`;
    })
    .join(" ");
}

function makeGridPolygon(
  level: number,
  count: number,
  maxRadius: number,
  cx: number,
  cy: number
): string {
  const r = (level / 100) * maxRadius;
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    const { x, y } = polarToXY(step * i, r, cx, cy);
    return `${x},${y}`;
  }).join(" ");
}

/** Build a raw SVG string for the radar chart. */
export function buildRadarSvg(
  scores: Record<TaxonomyCategory, number>,
  size = 200,
  isPioneer = false
): string {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38;
  const labelRadius = size * 0.47;
  const count = CATEGORY_ORDER.length;
  const step = 360 / count;

  const values = CATEGORY_ORDER.map((cat) => scores[cat] ?? 0);
  const dataPoints = makePolygonPoints(values, maxRadius, cx, cy);

  const fillColor = isPioneer
    ? "rgba(234,179,8,0.25)"
    : "rgba(99,102,241,0.25)";
  const strokeColor = isPioneer ? "#eab308" : "#818cf8";

  const gridRings = [25, 50, 75, 100]
    .map(
      (level) =>
        `<polygon points="${makeGridPolygon(level, count, maxRadius, cx, cy)}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`
    )
    .join("");

  const axisLines = CATEGORY_ORDER.map((_, i) => {
    const { x, y } = polarToXY(step * i, maxRadius, cx, cy);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
  }).join("");

  const dataPolygon = `<polygon points="${dataPoints}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>`;

  const circles = values
    .map((v, i) => {
      const r = (v / 100) * maxRadius;
      const { x, y } = polarToXY(step * i, r, cx, cy);
      return `<circle cx="${x}" cy="${y}" r="3" fill="${strokeColor}"/>`;
    })
    .join("");

  const labels = CATEGORY_ORDER.map((cat, i) => {
    const { x, y } = polarToXY(step * i, labelRadius, cx, cy);
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.6)" font-size="10" font-family="monospace">${CATEGORY_SHORT[cat]}</text>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${gridRings}${axisLines}${dataPolygon}${circles}${labels}</svg>`;
}

/** Return a base64 data URI for the radar chart SVG. */
export function radarDataUri(
  scores: Record<TaxonomyCategory, number>,
  size = 200,
  isPioneer = false
): string {
  const svg = buildRadarSvg(scores, size, isPioneer);
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(svg).toString("base64")
      : btoa(svg);
  return `data:image/svg+xml;base64,${b64}`;
}
