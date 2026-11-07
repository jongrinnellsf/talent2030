import { Children, useState, type ReactNode } from "react";
import { renderLearningInline } from "../../lib/renderInlineMarkdown";
import { stripOrderedListItemPrefix } from "../liveCanvasTypes";

export function CanvasBoard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string | null;
  children?: ReactNode;
}) {
  return (
    <article className="live-canvas learner-live-canvas">
      <div className="live-canvas__inner">
        <header className="live-canvas__header">
          <h2 className="live-canvas__topic">{renderLearningInline(title)}</h2>
          {subtitle ? (
            <p className="live-canvas__subtitle">{renderLearningInline(subtitle)}</p>
          ) : null}
        </header>
        <div className="live-canvas__sections">
          {Children.map(children, (child, index) => (
            <section key={index} className="live-canvas__section live-canvas-polished__section">
              {child}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

export function CalloutBlock({
  label = "Insight",
  body,
}: {
  label?: string;
  body: string;
}) {
  return (
    <div className="live-canvas__insight" role="note">
      <p className="live-canvas__insight-label">{label}</p>
      <p className="live-canvas__body">{renderLearningInline(body)}</p>
    </div>
  );
}

export function TextBlock({
  heading,
  body,
}: {
  heading?: string | null;
  body: string;
}) {
  return (
    <div className="live-canvas-polished__block">
      {heading ? <h3 className="live-canvas__heading">{renderLearningInline(heading)}</h3> : null}
      <p className="live-canvas__body live-canvas__body--lead">{renderLearningInline(body)}</p>
    </div>
  );
}

export function BulletListBlock({
  heading,
  items,
}: {
  heading?: string | null;
  items: string[];
}) {
  return (
    <div className="live-canvas-polished__block">
      {heading ? <h3 className="live-canvas__heading">{renderLearningInline(heading)}</h3> : null}
      <ul className="live-canvas__bullet-list">
        {items.map((item, index) => (
          <li key={`${index}-${item.slice(0, 24)}`}>{renderLearningInline(item)}</li>
        ))}
      </ul>
    </div>
  );
}

export function StepsBlock({
  heading,
  items,
}: {
  heading?: string | null;
  items: string[];
}) {
  const rows = items.map(stripOrderedListItemPrefix);
  return (
    <div className="live-canvas-polished__block">
      <h3 className="live-canvas__heading">{heading ? renderLearningInline(heading) : "Steps"}</h3>
      <ol className="canvas-steps">
        {rows.map((item, index) => (
          <li key={`${index}-${item.slice(0, 24)}`}>
            <span className="canvas-steps__index">{index + 1}</span>
            <span>{renderLearningInline(item)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function CompareBlock({
  heading,
  leftTitle,
  rightTitle,
  leftPoints,
  rightPoints,
}: {
  heading?: string | null;
  leftTitle: string;
  rightTitle: string;
  leftPoints: string[];
  rightPoints: string[];
}) {
  return (
    <div className="live-canvas-polished__block">
      {heading ? <h3 className="live-canvas__heading">{renderLearningInline(heading)}</h3> : null}
      <div className="live-canvas__comparison">
        <div className="live-canvas__compare-col">
          <h4 className="live-canvas__compare-title learning-text-accent">
            {renderLearningInline(leftTitle)}
          </h4>
          <ul className="live-canvas__bullet-list">
            {leftPoints.map((point, index) => (
              <li key={index}>{renderLearningInline(point)}</li>
            ))}
          </ul>
        </div>
        <div className="live-canvas__compare-col">
          <h4 className="live-canvas__compare-title learning-text-accent">
            {renderLearningInline(rightTitle)}
          </h4>
          <ul className="live-canvas__bullet-list">
            {rightPoints.map((point, index) => (
              <li key={index}>{renderLearningInline(point)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function PromptListBlock({
  heading,
  prompts,
}: {
  heading?: string | null;
  prompts: { title: string; text: string; note?: string | null }[];
}) {
  return (
    <div className="live-canvas-polished__block">
      {heading ? <h3 className="live-canvas__heading">{renderLearningInline(heading)}</h3> : null}
      <ul className="live-canvas__prompt-list">
        {prompts.map((prompt) => (
          <li key={prompt.title} className="live-canvas__prompt-card">
            <span className="live-canvas__prompt-title">{renderLearningInline(prompt.title)}</span>
            <pre className="live-canvas__prompt-text">{prompt.text}</pre>
            {prompt.note ? <p className="live-canvas__prompt-note">{prompt.note}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export type FigureVariant = "flow" | "stack" | "compare";

export function FigureBlock({
  variant,
  caption,
}: {
  variant: FigureVariant;
  caption?: string | null;
}) {
  return (
    <figure className="canvas-figure">
      {variant === "flow" ? (
        <div className="canvas-figure__flow" aria-hidden>
          <span>Input</span>
          <span className="canvas-figure__arrow">→</span>
          <span>Model</span>
          <span className="canvas-figure__arrow">→</span>
          <span>Result</span>
        </div>
      ) : null}
      {variant === "stack" ? (
        <div className="canvas-figure__stack" aria-hidden>
          <span>Interface</span>
          <span>Logic</span>
          <span>Data</span>
        </div>
      ) : null}
      {variant === "compare" ? (
        <div className="canvas-figure__compare" aria-hidden>
          <span>Option A</span>
          <span>Option B</span>
        </div>
      ) : null}
      {caption ? <figcaption>{renderLearningInline(caption)}</figcaption> : null}
    </figure>
  );
}

export function AccordionBlock({
  heading,
  items,
}: {
  heading?: string | null;
  items: { title: string; body: string }[];
}) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="live-canvas-polished__block">
      {heading ? <h3 className="live-canvas__heading">{renderLearningInline(heading)}</h3> : null}
      <div className="canvas-accordion">
        {items.map((item, index) => {
          const open = openIndex === index;
          return (
            <div key={`${index}-${item.title.slice(0, 24)}`} className="canvas-accordion__item">
              <button
                type="button"
                className="canvas-accordion__trigger"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                {renderLearningInline(item.title)}
              </button>
              {open ? (
                <p className="canvas-accordion__panel">{renderLearningInline(item.body)}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChoiceList({
  choices,
  correctIndex,
  onCorrect,
}: {
  choices: string[];
  correctIndex: number;
  onCorrect?: (choice: string) => void;
}) {
  const [wrongIndexes, setWrongIndexes] = useState<number[]>([]);
  const [passed, setPassed] = useState(false);

  return (
    <div className="knowledge-check-stage__choices" role="group" aria-label="Answer choices">
      {choices.map((choice, index) => {
        const wrong = wrongIndexes.includes(index);
        const right = passed && index === correctIndex;
        return (
          <button
            key={`${index}-${choice.slice(0, 24)}`}
            type="button"
            className={`knowledge-check-stage__choice${
              wrong ? " knowledge-check-stage__choice--wrong" : ""
            }${right ? " knowledge-check-stage__choice--right" : ""}`}
            disabled={passed || wrong}
            onClick={() => {
              if (passed || wrong) return;
              if (index === correctIndex) {
                setPassed(true);
                onCorrect?.(choice);
                return;
              }
              setWrongIndexes((current) => [...current, index]);
            }}
          >
            {renderLearningInline(choice)}
          </button>
        );
      })}
      {passed ? (
        <p className="knowledge-check-stage__hint">That's the one.</p>
      ) : wrongIndexes.length > 0 ? (
        <p className="knowledge-check-stage__hint">Not quite. Try another answer.</p>
      ) : null}
    </div>
  );
}
