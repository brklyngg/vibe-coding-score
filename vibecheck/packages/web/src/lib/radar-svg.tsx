import type { TaxonomyCategory } from "./types";

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

interface RadarProps {
  scores: Record<TaxonomyCategory, number>;
  size?: number;
  isPioneer?: boolean;
}

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

function makeGridPolygon(level: number, count: number, maxRadius: number, cx: number, cy: number): string {
  const r = (level / 100) * maxRadius;
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => {
    const { x, y } = polarToXY(step * i, r, cx, cy);
    return `${x},${y}`;
  }).join(" ");
}

export function RadarChart({ scores, size = 200, isPioneer = false }: RadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.38;
  const labelRadius = size * 0.47;
  const count = CATEGORY_ORDER.length;
  const step = 360 / count;

  const values = CATEGORY_ORDER.map((cat) => scores[cat] ?? 0);
  const dataPoints = makePolygonPoints(values, maxRadius, cx, cy);

  const fillColor = isPioneer
    ? "rgba(234, 179, 8, 0.25)"
    : "rgba(99, 102, 241, 0.25)";
  const strokeColor = isPioneer ? "#eab308" : "#818cf8";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "flex" }}
    >
      {/* Grid rings */}
      {[25, 50, 75, 100].map((level) => (
        <polygon
          key={level}
          points={makeGridPolygon(level, count, maxRadius, cx, cy)}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {CATEGORY_ORDER.map((_, i) => {
        const { x, y } = polarToXY(step * i, maxRadius, cx, cy);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={dataPoints}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="2"
      />

      {/* Data points */}
      {values.map((v, i) => {
        const r = (v / 100) * maxRadius;
        const { x, y } = polarToXY(step * i, r, cx, cy);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill={strokeColor}
          />
        );
      })}

      {/* Labels */}
      {CATEGORY_ORDER.map((cat, i) => {
        const { x, y } = polarToXY(step * i, labelRadius, cx, cy);
        return (
          <text
            key={cat}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.6)"
            fontSize="10"
            fontFamily="monospace"
          >
            {CATEGORY_SHORT[cat]}
          </text>
        );
      })}
    </svg>
  );
}
