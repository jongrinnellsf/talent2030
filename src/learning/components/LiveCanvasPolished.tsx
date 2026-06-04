import { memo } from "react";
import { renderLearningInline } from "../../lib/renderInlineMarkdown";
import type { LiveCanvasPayload, LiveCanvasSection } from "../liveCanvasTypes";
import { stripOrderedListItemPrefix } from "../liveCanvasTypes";

function BulletList({
  heading,
  items,
}: {
  heading?: string | null;
  items: string[];
}) {
  return (
    <div className="live-canvas-polished__block">
      {heading && <h3 className="live-canvas__heading">{heading}</h3>}
      <ul className="live-canvas__bullet-list">
        {items.map((item, i) => (
          <li key={i}>{renderLearningInline(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function RankedList({
  heading,
  items,
}: {
  heading?: string | null;
  items: string[];
}) {
  const rows = items.map(stripOrderedListItemPrefix);
  return (
    <div className="live-canvas-polished__block">
      <h3 className="live-canvas__heading">{heading ?? "Highlights"}</h3>
      <table className="live-canvas__table live-canvas__table--ranked">
        <tbody>
          {rows.map((item, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{renderLearningInline(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SectionView = memo(function SectionView({
  section,
}: {
  section: LiveCanvasSection;
}) {
  switch (section.kind) {
    case "text":
      return (
        <div className="live-canvas-polished__block">
          {section.heading ? (
            <>
              <h3 className="live-canvas__heading">{section.heading}</h3>
              <p className="live-canvas__body live-canvas__body--lead">
                {renderLearningInline(section.body)}
              </p>
            </>
          ) : (
            <div className="live-canvas__insight" role="note">
              <p className="live-canvas__insight-label">Insight</p>
              <p className="live-canvas__body">{renderLearningInline(section.body)}</p>
            </div>
          )}
        </div>
      );
    case "bullets":
      return <BulletList heading={section.heading} items={section.items} />;
    case "list":
      return <RankedList heading={section.heading} items={section.items} />;
    case "prompts":
      return (
        <div className="live-canvas-polished__block">
          {section.heading && (
            <h3 className="live-canvas__heading">{section.heading}</h3>
          )}
          <ul className="live-canvas__prompt-list">
            {section.prompts.map((p) => (
              <li key={p.title} className="live-canvas__prompt-card">
                <span className="live-canvas__prompt-title">
                  {renderLearningInline(p.title)}
                </span>
                <pre className="live-canvas__prompt-text">{p.text}</pre>
                {p.note && (
                  <p className="live-canvas__prompt-note">{p.note}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    case "comparison":
      return (
        <div className="live-canvas-polished__block">
          {section.heading && (
            <h3 className="live-canvas__heading">{section.heading}</h3>
          )}
          <div className="live-canvas__comparison">
            <div className="live-canvas__compare-col">
              <h4 className="live-canvas__compare-title learning-text-accent">
                {section.leftTitle}
              </h4>
              <ul className="live-canvas__bullet-list">
                {section.leftPoints.map((pt, i) => (
                  <li key={i}>{renderLearningInline(pt)}</li>
                ))}
              </ul>
            </div>
            <div className="live-canvas__compare-col">
              <h4 className="live-canvas__compare-title learning-text-accent">
                {section.rightTitle}
              </h4>
              <ul className="live-canvas__bullet-list">
                {section.rightPoints.map((pt, i) => (
                  <li key={i}>{renderLearningInline(pt)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
});

function LiveCanvasPolishedInner({ payload }: { payload: LiveCanvasPayload }) {
  return (
    <article className="live-canvas learner-live-canvas">
      <div className="live-canvas__inner">
        <header className="live-canvas__header">
          <h2 className="live-canvas__topic">{renderLearningInline(payload.topic)}</h2>
          {payload.subtitle && (
            <p className="live-canvas__subtitle">{renderLearningInline(payload.subtitle)}</p>
          )}
        </header>
        <div className="live-canvas__sections">
          {payload.sections.map((section, index) => (
            <section
              key={`${section.kind}-${index}`}
              className="live-canvas__section live-canvas-polished__section"
            >
              <SectionView section={section} />
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

export const LiveCanvasPolished = memo(LiveCanvasPolishedInner);
