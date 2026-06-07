import type { ReactNode } from "react";

const THEMES: { title: string; body: ReactNode }[] = [
  {
    title: "Structured context",
    body: (
      <>
        When AI has useful files on your work (tasks, goals, team, tools), it makes better
        calls. Talent2030 wires that up through <code>employee.md</code> and{" "}
        <code>talentmanagement.md</code> automatically.
      </>
    ),
  },
  {
    title: "AI that learns",
    body: "Models already keep memories and grow context windows. Pair that with a living employee ledger and you get coaching and microlearning that stays relevant as your week changes.",
  },
] as const;

export function LandingConcept() {
  return (
    <section className="landing-concept" aria-labelledby="landing-concept-heading">
      <div className="landing-concept__inner">
        <p className="landing-concept__eyebrow">The idea</p>
        <h2 id="landing-concept-heading" className="landing-concept__title">
          What if the agent already knew your context?
        </h2>
        <ul className="landing-concept__themes">
          {THEMES.map((theme) => (
            <li key={theme.title} className="landing-concept__theme">
              <h3 className="landing-concept__theme-title">{theme.title}</h3>
              <p className="landing-concept__theme-body">{theme.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
