const SHIMMER_WORDS = new Set(["learning", "performance"]);

const WORDS = [
  "What",
  "learning",
  "and",
  "performance",
  "could",
  "look",
  "like",
  "in",
  "2030",
] as const;

export function LandingHeroHeadline() {
  return (
    <h1 className="landing-hero__headline">
      {WORDS.map((word, index) => {
        const shimmer = SHIMMER_WORDS.has(word);

        return (
          <span
            key={`${word}-${index}`}
            className={[
              "landing-hero__word",
              shimmer ? "landing-hero__word--shimmer" : "",
              word === "performance" ? "landing-hero__word--shimmer-offset" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {word}
          </span>
        );
      })}
    </h1>
  );
}
