/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { DemoWorkspace } from "./components/DemoWorkspace";
import { CoachPage } from "./pages/CoachPage";
import { LandingPage } from "./pages/LandingPage";
import { DemoSettingsPage } from "./pages/DemoSettingsPage";
import { AgentContextProvider } from "./context/AgentContextProvider";
import { CoachSessionProvider } from "./context/CoachSessionContext";
import { LearningSessionProvider } from "./context/LearningSessionContext";
import { ROUTES } from "./routes";

function LegacyCoachRedirect() {
  const location = useLocation();
  return (
    <Navigate
      to={`${ROUTES.talent.coach}${location.search}`}
      replace
    />
  );
}

function LegacyPerformanceRedirect() {
  const location = useLocation();
  const suffix = location.pathname.replace(/^\/performance\/?/, "");
  const target =
    suffix === "coach"
      ? ROUTES.talent.coach
      : ROUTES.talent.root;
  return <Navigate to={`${target}${location.search}`} replace />;
}

function LegacyLearningRedirect() {
  const location = useLocation();
  return (
    <Navigate to={`${ROUTES.talent.coach}${location.search}`} replace />
  );
}

function TalentAppRoutes() {
  return (
    <CoachSessionProvider>
      <LearningSessionProvider>
        <Routes>
          <Route index element={<DemoWorkspace />} />
          <Route path="coach" element={<CoachPage />} />
          <Route path="learn" element={<LegacyLearningRedirect />} />
        </Routes>
      </LearningSessionProvider>
    </CoachSessionProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AgentContextProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/talent/*" element={<TalentAppRoutes />} />
          <Route path="/settings" element={<DemoSettingsPage />} />
          <Route path="/coach" element={<LegacyCoachRedirect />} />
          <Route path="/performance/*" element={<LegacyPerformanceRedirect />} />
          <Route path="/learning/*" element={<LegacyLearningRedirect />} />
          <Route
            path="/dashboard"
            element={<Navigate to={ROUTES.talent.root} replace />}
          />
          <Route
            path="/skill"
            element={<Navigate to={ROUTES.talent.root} replace />}
          />
        </Routes>
      </AgentContextProvider>
      <Analytics />
    </BrowserRouter>
  );
}
