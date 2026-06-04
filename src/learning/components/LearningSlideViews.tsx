import { getLearningAsset } from "../../data/learning/contentPool";

export function LearningAssetMissing({ assetId }: { assetId: string }) {
  return (
    <p className="learning-slide__missing">
      Content not found: <code>{assetId}</code>
    </p>
  );
}

export function ContentBlockView({ assetId }: { assetId: string }) {
  const asset = getLearningAsset(assetId);
  if (!asset || asset.kind !== "content") return <LearningAssetMissing assetId={assetId} />;
  return (
    <article className="learning-slide learning-slide--content">
      <h3 className="learning-slide__heading">{asset.title}</h3>
      <p className="learning-slide__body">{asset.body}</p>
      {asset.estimatedMinutes != null && (
        <p className="learning-slide__meta">~{asset.estimatedMinutes} min</p>
      )}
    </article>
  );
}

export function VideoSlideView({ assetId }: { assetId: string }) {
  const asset = getLearningAsset(assetId);
  if (!asset || asset.kind !== "video") return <LearningAssetMissing assetId={assetId} />;
  return (
    <article className="learning-slide learning-slide--video">
      <div className="learning-slide__player" aria-hidden>
        <span className="learning-slide__player-label">{asset.posterLabel}</span>
      </div>
      <h3 className="learning-slide__heading">{asset.title}</h3>
      <p className="learning-slide__body">{asset.description}</p>
      <p className="learning-slide__meta">{asset.durationMinutes} min</p>
    </article>
  );
}

export function QuizSlideView({ assetId }: { assetId: string }) {
  const asset = getLearningAsset(assetId);
  if (!asset || asset.kind !== "quiz") return <LearningAssetMissing assetId={assetId} />;
  return (
    <article className="learning-slide learning-slide--quiz">
      <h3 className="learning-slide__heading">{asset.title}</h3>
      <ol className="learning-slide__quiz-list">
        {asset.questions.map((q, i) => (
          <li key={i} className="learning-slide__quiz-item">
            <p className="learning-slide__quiz-prompt">{q.prompt}</p>
            <ul className="learning-slide__options">
              {q.options.map((opt, j) => (
                <li key={j}>{opt}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function SurveySlideView({ assetId }: { assetId: string }) {
  const asset = getLearningAsset(assetId);
  if (!asset || asset.kind !== "survey") return <LearningAssetMissing assetId={assetId} />;
  return (
    <article className="learning-slide learning-slide--survey">
      <h3 className="learning-slide__heading">{asset.title}</h3>
      <ul className="learning-slide__survey-list">
        {asset.prompts.map((prompt, i) => (
          <li key={i}>{prompt}</li>
        ))}
      </ul>
    </article>
  );
}
