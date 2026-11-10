import { renderLearningInline } from "../../lib/renderInlineMarkdown";
import type {
  DiagramEdgeItem,
  DiagramNodeItem,
  MatrixQuadrantItem,
  MetricChartRow,
} from "../liveCanvasTypes";

export type DiagramVariant = "flow" | "stack" | "cycle";
export type MetricChartVariant = "bar" | "paired" | "radar";

function ArrowRightSvg() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="canvas-diagram__arrow-svg"
    >
      <path
        d="M3 8h9.5M9 4.5L12.5 8 9 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CycleLoopSvg() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 8a5 5 0 1 1-1.46-3.54M13 3v3h-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function findEdgeLabel(
  edges: DiagramEdgeItem[] | undefined,
  fromId: string,
  toId: string
): string | null {
  if (!edges?.length) return null;
  const match = edges.find((e) => e.from === fromId && e.to === toId);
  return match?.label ?? null;
}

export function DiagramBlock({
  heading,
  variant,
  nodes,
  edges,
  caption,
}: {
  heading?: string | null;
  variant: DiagramVariant;
  nodes: DiagramNodeItem[];
  edges?: DiagramEdgeItem[];
  caption?: string | null;
}) {
  if (nodes.length === 0) return null;

  const loopLabel =
    variant === "cycle" && nodes.length >= 2
      ? findEdgeLabel(edges, nodes[nodes.length - 1].id, nodes[0].id)
      : null;

  return (
    <figure className="live-canvas-polished__block canvas-visual">
      {heading ? (
        <h3 className="live-canvas__heading">{renderLearningInline(heading)}</h3>
      ) : null}

      {variant === "stack" ? (
        <div className="canvas-diagram canvas-diagram--stack" role="list">
          {nodes.map((node, index) => (
            <div
              key={node.id || index}
              role="listitem"
              className={`canvas-diagram__layer${
                node.active ? " canvas-diagram__layer--active" : ""
              }`}
            >
              <span className="canvas-diagram__badge" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="canvas-diagram__copy">
                <span className="canvas-diagram__label">
                  {renderLearningInline(node.label)}
                </span>
                {node.sublabel ? (
                  <span className="canvas-diagram__sublabel">
                    {renderLearningInline(node.sublabel)}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`canvas-diagram canvas-diagram--${variant}`}
          role="list"
        >
          {nodes.map((node, index) => {
            const nextNode = nodes[index + 1];
            const edgeLabel = nextNode
              ? findEdgeLabel(edges, node.id, nextNode.id)
              : null;

            return (
              <div
                key={node.id || index}
                role="listitem"
                className="canvas-diagram__step"
              >
                <div
                  className={`canvas-diagram__node${
                    node.active ? " canvas-diagram__node--active" : ""
                  }`}
                >
                  <div className="canvas-diagram__node-head">
                    <span className="canvas-diagram__index" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span className="canvas-diagram__label">
                      {renderLearningInline(node.label)}
                    </span>
                  </div>
                  {node.sublabel ? (
                    <p className="canvas-diagram__sublabel">
                      {renderLearningInline(node.sublabel)}
                    </p>
                  ) : null}
                </div>

                {nextNode ? (
                  <div className="canvas-diagram__connector" aria-hidden="true">
                    {edgeLabel ? (
                      <span className="canvas-diagram__edge-label">
                        {edgeLabel}
                      </span>
                    ) : null}
                    <ArrowRightSvg />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {variant === "cycle" && nodes.length >= 2 ? (
        <div className="canvas-diagram__cycle-return" aria-label="Repeats from step 1">
          <CycleLoopSvg />
          <span>
            {loopLabel
              ? `${loopLabel} → ${nodes[0].label}`
              : `Loops back to ${nodes[0].label}`}
          </span>
        </div>
      ) : null}

      {caption ? (
        <figcaption className="canvas-visual__caption">
          {renderLearningInline(caption)}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function Matrix2x2Block({
  heading,
  axes,
  quadrants,
  caption,
}: {
  heading?: string | null;
  axes: [string, string, string, string];
  quadrants: [
    MatrixQuadrantItem,
    MatrixQuadrantItem,
    MatrixQuadrantItem,
    MatrixQuadrantItem,
  ];
  caption?: string | null;
}) {
  const [xLow, xHigh, yLow, yHigh] = axes;
  const coords = [
    `${yHigh} · ${xLow}`,
    `${yHigh} · ${xHigh}`,
    `${yLow} · ${xLow}`,
    `${yLow} · ${xHigh}`,
  ];

  return (
    <figure className="live-canvas-polished__block canvas-visual">
      {heading ? (
        <h3 className="live-canvas__heading">{renderLearningInline(heading)}</h3>
      ) : null}

      <div className="canvas-matrix">
        <div className="canvas-matrix__y-axis" aria-hidden="true">
          <span className="canvas-matrix__axis-pole">{yHigh}</span>
          <span className="canvas-matrix__axis-line canvas-matrix__axis-line--vertical" />
          <span className="canvas-matrix__axis-pole">{yLow}</span>
        </div>

        <div className="canvas-matrix__body">
          <div className="canvas-matrix__grid" role="list">
            {quadrants.map((quad, index) => {
              const isTargetQuadrant = index === 1;
              return (
                <div
                  key={`${index}-${quad.title}`}
                  role="listitem"
                  className={`canvas-matrix__cell${
                    isTargetQuadrant ? " canvas-matrix__cell--featured" : ""
                  }`}
                >
                  <span className="canvas-matrix__coord">{coords[index]}</span>
                  <h4 className="canvas-matrix__title">
                    {renderLearningInline(quad.title)}
                  </h4>
                  {quad.detail ? (
                    <p className="canvas-matrix__detail">
                      {renderLearningInline(quad.detail)}
                    </p>
                  ) : null}
                  {quad.items && quad.items.length > 0 ? (
                    <ul className="canvas-matrix__chips">
                      {quad.items.map((item, itemIdx) => (
                        <li key={`${itemIdx}-${item.slice(0, 20)}`} className="canvas-matrix__chip">
                          {renderLearningInline(item)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="canvas-matrix__x-axis" aria-hidden="true">
            <span className="canvas-matrix__axis-pole">{xLow}</span>
            <span className="canvas-matrix__axis-line canvas-matrix__axis-line--horizontal" />
            <span className="canvas-matrix__axis-pole">{xHigh}</span>
          </div>
        </div>
      </div>

      {caption ? (
        <figcaption className="canvas-visual__caption">
          {renderLearningInline(caption)}
        </figcaption>
      ) : null}
    </figure>
  );
}

function computeChartCeiling(
  rows: MetricChartRow[],
  unit?: string | null,
  explicitMax?: number | null
): number {
  const maxObserved = rows.reduce((acc, row) => {
    const secondary = typeof row.secondary === "number" ? row.secondary : 0;
    return Math.max(acc, row.value, secondary);
  }, 0);

  if (explicitMax && explicitMax >= maxObserved && explicitMax > 0) {
    return explicitMax;
  }
  if (unit === "/5" && maxObserved <= 5) return 5;
  if (unit === "/10" && maxObserved <= 10) return 10;
  if (unit === "%" && maxObserved <= 100) return 100;
  if (maxObserved <= 0) return 1;
  if (maxObserved <= 5) return 5;
  if (maxObserved <= 10) return 10;
  if (maxObserved <= 100 && Number.isInteger(maxObserved)) return 100;
  return Math.ceil(maxObserved * 1.1);
}

function formatMetricNumber(value: number, unit?: string | null): string {
  const rounded = Number.isInteger(value)
    ? String(value)
    : value.toFixed(1).replace(/\.0$/, "");
  if (!unit) return rounded;
  return unit.startsWith("/") || unit === "%" ? `${rounded}${unit}` : `${rounded} ${unit}`;
}

function RadarPolygonSvg({
  rows,
  ceiling,
  unit,
  hasSecondary,
}: {
  rows: MetricChartRow[];
  ceiling: number;
  unit?: string | null;
  hasSecondary: boolean;
}) {
  const cx = 170;
  const cy = 114;
  const radius = 70;
  const count = rows.length;
  const rings = [0.33, 0.66, 1];

  const pointAt = (index: number, fraction: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const clamped = Math.max(0, Math.min(1, fraction));
    return {
      x: cx + Math.cos(angle) * radius * clamped,
      y: cy + Math.sin(angle) * radius * clamped,
      cos: Math.cos(angle),
      sin: Math.sin(angle),
    };
  };

  const toPointsAttr = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const primaryPts = rows.map((r, i) => pointAt(i, r.value / ceiling));
  const secondaryPts = hasSecondary
    ? rows.map((r, i) => pointAt(i, (r.secondary ?? 0) / ceiling))
    : null;

  return (
    <svg
      viewBox="0 0 340 228"
      className="canvas-chart__radar-svg"
      role="img"
      aria-label={rows
        .map((r) => `${r.label}: ${formatMetricNumber(r.value, unit)}`)
        .join(", ")}
    >
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={toPointsAttr(rows.map((_, i) => pointAt(i, ring)))}
          className="canvas-chart__radar-ring"
        />
      ))}

      {rows.map((_, i) => {
        const outer = pointAt(i, 1);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            className="canvas-chart__radar-spoke"
          />
        );
      })}

      {secondaryPts ? (
        <polygon
          points={toPointsAttr(secondaryPts)}
          className="canvas-chart__radar-area canvas-chart__radar-area--secondary"
        />
      ) : null}

      <polygon
        points={toPointsAttr(primaryPts)}
        className="canvas-chart__radar-area canvas-chart__radar-area--primary"
      />

      {primaryPts.map((pt, i) => (
        <circle
          key={`dot-${i}`}
          cx={pt.x}
          cy={pt.y}
          r={3.25}
          className="canvas-chart__radar-dot"
        />
      ))}

      {rows.map((row, i) => {
        const labelPt = pointAt(i, 1.24);
        const anchor =
          Math.abs(labelPt.cos) < 0.24
            ? "middle"
            : labelPt.cos > 0
              ? "start"
              : "end";
        const dy = labelPt.sin > 0.65 ? 10 : labelPt.sin < -0.65 ? -4 : 3;
        const shortLabel =
          row.label.length > 20 ? `${row.label.slice(0, 19)}…` : row.label;

        return (
          <text
            key={`lbl-${i}`}
            x={labelPt.x}
            y={labelPt.y + dy}
            textAnchor={anchor}
            className="canvas-chart__radar-label"
          >
            {shortLabel} · {formatMetricNumber(row.value, unit)}
          </text>
        );
      })}
    </svg>
  );
}

export function MetricChartBlock({
  heading,
  variant,
  unit,
  maxValue,
  series,
  data,
  caption,
}: {
  heading?: string | null;
  variant: MetricChartVariant;
  unit?: string | null;
  maxValue?: number | null;
  series?: [string, string] | null;
  data: MetricChartRow[];
  caption?: string | null;
}) {
  if (data.length === 0) return null;

  const ceiling = computeChartCeiling(data, unit, maxValue);
  const hasSecondary = data.some((row) => typeof row.secondary === "number");
  const hasExplicitActive = data.some((row) => row.active);
  const primarySeriesLabel = series?.[0] ?? "Primary";
  const secondarySeriesLabel = series?.[1] ?? "Benchmark";

  const showLegend = (variant === "paired" || variant === "radar") && hasSecondary;

  return (
    <figure className="live-canvas-polished__block canvas-visual">
      {(heading || showLegend) && (
        <div className="canvas-chart__header">
          {heading ? (
            <h3 className="live-canvas__heading canvas-chart__heading">
              {renderLearningInline(heading)}
            </h3>
          ) : (
            <span />
          )}
          {showLegend ? (
            <div className="canvas-chart__legend" aria-label="Chart series">
              <span className="canvas-chart__legend-item">
                <span className="canvas-chart__swatch canvas-chart__swatch--primary" />
                {primarySeriesLabel}
              </span>
              <span className="canvas-chart__legend-item">
                <span className="canvas-chart__swatch canvas-chart__swatch--secondary" />
                {secondarySeriesLabel}
              </span>
            </div>
          ) : null}
        </div>
      )}

      {variant === "radar" && data.length >= 3 ? (
        <div className="canvas-chart canvas-chart--radar">
          <RadarPolygonSvg
            rows={data}
            ceiling={ceiling}
            unit={unit}
            hasSecondary={hasSecondary}
          />
        </div>
      ) : (
        <div className="canvas-chart canvas-chart--bars" role="list">
          {data.map((row, index) => {
            const pct = Math.max(2, Math.min(100, (Math.max(0, row.value) / ceiling) * 100));
            const secondaryPct =
              typeof row.secondary === "number"
                ? Math.max(2, Math.min(100, (Math.max(0, row.secondary) / ceiling) * 100))
                : null;
            const mutedPrimary = hasExplicitActive && !row.active && secondaryPct === null;

            return (
              <div
                key={`${index}-${row.label}`}
                role="listitem"
                className="canvas-chart__row"
              >
                <div className="canvas-chart__row-meta">
                  <span className="canvas-chart__label">
                    {renderLearningInline(row.label)}
                  </span>
                  <span className="canvas-chart__value">
                    {formatMetricNumber(row.value, unit)}
                    {typeof row.secondary === "number" ? (
                      <span className="canvas-chart__value-secondary">
                        {" "}
                        vs {formatMetricNumber(row.secondary, unit)}
                      </span>
                    ) : null}
                  </span>
                </div>

                <div className="canvas-chart__tracks">
                  <div className="canvas-chart__track">
                    <div
                      className={`canvas-chart__fill ${
                        mutedPrimary
                          ? "canvas-chart__fill--muted"
                          : "canvas-chart__fill--primary"
                      }`}
                      style={{ width: `${pct.toFixed(1)}%` }}
                    />
                  </div>
                  {secondaryPct !== null ? (
                    <div className="canvas-chart__track canvas-chart__track--secondary">
                      <div
                        className="canvas-chart__fill canvas-chart__fill--secondary"
                        style={{ width: `${secondaryPct.toFixed(1)}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {caption ? (
        <figcaption className="canvas-visual__caption">
          {renderLearningInline(caption)}
        </figcaption>
      ) : null}
    </figure>
  );
}
