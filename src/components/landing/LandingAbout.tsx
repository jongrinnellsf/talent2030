import { ORG_NAME } from "../../data/agent-context/talentManagementSeed";
import { PERSONAL_SITE } from "../../data/personalSite";

export function LandingAbout() {
  return (
    <section className="landing-about" aria-labelledby="landing-about-heading">
      <div className="landing-about__inner">
        <p className="landing-about__eyebrow">About</p>
        <h2 id="landing-about-heading" className="landing-about__title">
          A research project on learning and performance at work
        </h2>
        <div className="landing-about__body">
          <p>
            You'll explore the demo as <strong>Will Ray</strong>, a fictitious VP of
            Product at <strong>{ORG_NAME}</strong>. Will has an agentic coach grounded
            in <code>employee.md</code> (a structured ledger of his work) and{" "}
            <code>talentmanagement.md</code> (the corporate perf blueprint). Voice
            drives the experience on a fixed audio-visual canvas: cameras off, low
            latency text that reinforces what you hear.
          </p>
          <p>
            I like the word <em>exposition</em>: this is an exposition on agent-first
            talent work. Managers get planning, hyper-personalized skill paths, and
            Meet-style rehearsal before a hard review. Learners get 5-slide micro paths
            with a verbal knowledge check that logs back to the ledger. If the write-up
            helps,{" "}
            <a
              className="landing-about__link"
              href={PERSONAL_SITE.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              read the full article
            </a>
            . If it resonated,{" "}
            <a
              className="landing-about__link"
              href={PERSONAL_SITE.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              say hi on LinkedIn
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
