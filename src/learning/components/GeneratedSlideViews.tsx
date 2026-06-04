import {
  normalizeBulletText,
  renderLearningInline,
  splitSlideBodyAndBullets,
} from "../../lib/renderInlineMarkdown";
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

  return (
    <article className="learning-slide learning-slide--generated">
      <h3 className="learning-slide__heading">{renderLearningInline(title)}</h3>
      {intro ? (
        <p className="learning-slide__body">{renderLearningInline(intro)}</p>
      ) : null}
      {items.length > 0 && (
        <ul className="learning-slide__bullets">
          {items.map((item, index) => {
            const text = normalizeBulletText(item);
            return (
              <li key={`${index}-${text.slice(0, 40)}`}>
                {renderLearningInline(text)}
              </li>
            );
          })}
        </ul>
      )}
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
      <p className="learning-slide__hint">Answer out loud when your coach asks.</p>
    </article>
  );
}
