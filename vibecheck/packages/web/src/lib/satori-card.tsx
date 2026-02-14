import type { ScoreResult, TaxonomyCategory } from "@vibe/scoring";
import { CATEGORY_EMOJI } from "@vibe/scoring";
import { radarDataUri } from "./radar-svg";
import { ARCHETYPE_NAMES } from "./narrative-templates";

interface CardProps {
  score: ScoreResult;
  handle: string;
}

function getScoreMap(score: ScoreResult): Record<TaxonomyCategory, number> {
  const map: Record<string, number> = {};
  for (const c of score.categories) {
    map[c.category] = c.score;
  }
  return map as Record<TaxonomyCategory, number>;
}

export function ScoreCard({ score, handle }: CardProps) {
  const isPioneer = score.pioneer.isPioneer;
  const archetypeName = ARCHETYPE_NAMES[score.typeCode.code] ?? "The Builder";
  const scoreMap = getScoreMap(score);

  const borderColor = isPioneer ? "#eab308" : "#3730a3";
  const bgGradient = isPioneer
    ? "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #1a1a0e 100%)"
    : "linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "600px",
        height: "400px",
        background: bgGradient,
        border: `2px solid ${borderColor}`,
        borderRadius: "16px",
        padding: "32px",
        fontFamily: "system-ui, sans-serif",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header: VIBE CODER SCORE */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
        }}
      >
        <span
          style={{
            display: "flex",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "3px",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
          }}
        >
          VIBE CODER SCORE
        </span>
        {isPioneer && (
          <span style={{ display: "flex", fontSize: "14px", color: "#eab308" }}>
            🏔️ Pioneer
          </span>
        )}
      </div>

      {/* Main content: left text + right radar */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "24px",
        }}
      >
        {/* Left: tier, level, archetype, tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Tier title */}
          <div
            style={{
              display: "flex",
              fontSize: "36px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1px",
              color: isPioneer ? "#fde68a" : "white",
              textTransform: "uppercase",
            }}
          >
            {score.tier.title}
          </div>

          {/* Level */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
              marginTop: "6px",
            }}
          >
            <span
              style={{
                display: "flex",
                fontSize: "16px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {`Level ${score.level}`}
            </span>
          </div>

          {/* Archetype name */}
          <div
            style={{
              display: "flex",
              fontSize: "13px",
              color: "rgba(255,255,255,0.5)",
              marginTop: "2px",
            }}
          >
            {archetypeName}
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              fontSize: "14px",
              fontStyle: "italic",
              color: "rgba(255,255,255,0.5)",
              marginTop: "12px",
              lineHeight: 1.4,
            }}
          >
            {`\u201C${score.tier.tagline}\u201D`}
          </div>

          {/* Pioneer innovation callout */}
          {isPioneer && score.pioneer.innovations.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "12px",
                padding: "6px 10px",
                background: "rgba(234, 179, 8, 0.1)",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                borderRadius: "6px",
                fontSize: "11px",
                color: "#fde68a",
              }}
            >
              {`🏔️ ${score.pioneer.innovations[0].name}`}
            </div>
          )}
        </div>

        {/* Right: radar chart */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={radarDataUri(scoreMap, 200, isPioneer)}
            width={200}
            height={200}
          />
        </div>
      </div>

      {/* Score bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginTop: "8px",
        }}
      >
        {score.categories.map((cat) => (
          <div
            key={cat.category}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <span style={{ display: "flex" }}>{CATEGORY_EMOJI[cat.category]}</span>
            <span style={{ display: "flex", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
              {cat.score}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <span
          style={{
            display: "flex",
            fontSize: "12px",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          {`vibecheck.crunchy.tools/@${handle}`}
        </span>
        <span
          style={{
            display: "flex",
            fontSize: "10px",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          vibecheck.crunchy.tools
        </span>
      </div>
    </div>
  );
}
