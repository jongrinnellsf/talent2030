import { lazy, Suspense } from "react";

const ContextHubDiagram = lazy(() =>
  import("./ContextHubDiagram").then((module) => ({
    default: module.ContextHubDiagram,
  }))
);

export function LandingContextHub() {
  return (
    <section className="landing-context-hub" aria-labelledby="landing-context-hub-heading">
      <div className="landing-context-hub__inner">
        <p className="landing-context-hub__eyebrow">Connected context</p>
        <h2 id="landing-context-hub-heading" className="landing-context-hub__title">
          Your work tools feed one agent
        </h2>
        <p className="landing-context-hub__lead">
          Signals stack from <code>talentmanagement.md</code> at the top. Each one connects
          into the agent on its own line. The coach grounds on <code>employee.md</code>, then
          outputs manager advice, review simulation, and personalized learning paths.
        </p>
        <Suspense
          fallback={
            <div className="context-hub-diagram__canvas context-hub-diagram__canvas--loading" />
          }
        >
          <ContextHubDiagram />
        </Suspense>
      </div>
    </section>
  );
}
