import { Link } from "react-router-dom";
import { LandingShell } from "../components/layout/LandingShell";
import { LandingAbout } from "../components/landing/LandingAbout";
import { LandingConcept } from "../components/landing/LandingConcept";
import { LandingHeroHeadline } from "../components/landing/LandingHeroHeadline";
import { LandingContextHub } from "../components/landing/LandingContextHub";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { manager } from "../data/manager";
import { ORG_NAME } from "../data/agent-context/talentManagementSeed";
import { ROUTES } from "../routes";

export function LandingPage() {
  return (
    <LandingShell>
      <section className="landing-hero">
        <p className="landing-hero__eyebrow">Talent2030 · June 2026</p>
        <LandingHeroHeadline />
        <p className="landing-hero__lead">
          An exploration on what learning and performance could look like at
          work, built as a live demo. Sign in as {manager.name}, {manager.title} at{" "}
          {ORG_NAME}: structured context, voice on a canvas, and agentic coaching for performance reviews.

        </p>
        <Link to={ROUTES.talent.root} className="btn-primary landing-hero__cta">
          Open the demo
        </Link>
      </section>

      <LandingConcept />

      <LandingContextHub />

      <LandingFeatures />

      <LandingAbout />
    </LandingShell>
  );
}
