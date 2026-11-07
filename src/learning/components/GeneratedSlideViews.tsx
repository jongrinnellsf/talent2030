import {
  normalizeBulletText,
  renderLearningInline,
  splitSlideBodyAndBullets,
} from "../../lib/renderInlineMarkdown";
import { BulletListBlock, CalloutBlock } from "./canvasBlocks";
export function GeneratedSlideView({
  title,
  body,
  bullets,
}: {
  title: string;
  body: string;
  bullets?: string[];
}) {
  const { intro, items } = splitSlideBodyAndBullets(body, bullets);
  const [lead, ...rest] = items;

  return (
    <article className="learning-slide learning-slide--generated">
      <h3 className="learning-slide__heading">{renderLearningInline(title)}</h3>
      {intro ? (
        <p className="learning-slide__body">{renderLearningInline(intro)}</p>
      ) : null}
      {lead ? <CalloutBlock body={normalizeBulletText(lead)} /> : null}
      {rest.length > 0 ? <BulletListBlock items={rest.map(normalizeBulletText)} /> : null}
    </article>
  );
}

export function KnowledgeCheckSlideView({ question }: { question: string }) {
  return (
    <article className="learning-slide learning-slide--knowledge-check">
      <p className="learning-slide__eyebrow">Knowledge check</p>
      <div className="learning-slide__question-card">
        <p className="learning-slide__question">{renderLearningInline(question)}</p>
      </div>
      <p className="learning-slide__hint">Select the best answer on the check.</p>
    </article>
  );
}
