import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { buildRehearsePath, ROUTES } from "../../routes";

const FEATURES: {
  href: string;
  eyebrow: string;
  title: string;
  description: ReactNode;
  cta: string;
}[] = [
  {
    href: buildRehearsePath(),
    eyebrow: "Simulations",
    title: "Practice the hard conversation",
    description:
      "Rehearse a performance review delivery with full team context: ratings, process stage, frameworks, and optional live coaching HUD before the real meeting.",
    cta: "Try review simulation",
  },
  {
    href: ROUTES.talent.coach,
    eyebrow: "Personalized learning paths",
    title: "Upskill on your terms",
    description: (
      <>
        A short consultation, then 5 voice-driven slides grounded on the web and your
        employee ledger. Pause, ask questions, finish with a verbal check that logs to{" "}
        <code>employee.md</code>.
      </>
    ),
    cta: "Start a skill path",
  },
];

export function LandingFeatures() {
  return (
    <section className="landing-features" aria-label="Demo features">
      {FEATURES.map((feature) => (
        <article key={feature.href} className="landing-feature-card">
          <p className="landing-feature-card__eyebrow">{feature.eyebrow}</p>
          <h2 className="landing-feature-card__title">{feature.title}</h2>
          <p className="landing-feature-card__description">{feature.description}</p>
          <Link to={feature.href} className="btn-primary landing-feature-card__cta">
            {feature.cta}
          </Link>
        </article>
      ))}
    </section>
  );
}
