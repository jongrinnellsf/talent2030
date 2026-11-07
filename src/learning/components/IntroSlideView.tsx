import { renderLearningInline } from "../../lib/renderInlineMarkdown";

export function IntroSlideView({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string | null;
}) {
  return (
    <article className="learning-slide learning-slide--intro">
      <p className="learning-slide__eyebrow">Overview</p>
      <h2 className="learning-slide__title">{renderLearningInline(title)}</h2>
      {subtitle != null && subtitle !== "" && (
        <p className="learning-slide__lead">{renderLearningInline(subtitle)}</p>
      )}
    </article>
  );
}
