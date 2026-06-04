import type { IntegrationSource } from "../../types";
import type { LearningAsset } from "./types";

type SnippetSeed = {
  id: string;
  source: IntegrationSource;
  sourceTitle: string;
  title: string;
  body: string;
  tags: string[];
  estimatedMinutes?: number;
};

const seeds: SnippetSeed[] = [
  {
    id: "ext-slack:ai-forward-channel",
    source: "slack",
    sourceTitle: "#ai-forward",
    title: "Pinned: how we use AI at work",
    body: "Leadership pinned a thread on approved use cases, red lines on customer data, and when to escalate to Legal. Skim before your first copilot session.",
    tags: ["ai-forward", "governance", "workflow"],
    estimatedMinutes: 4,
  },
  {
    id: "ext-slack:prompting-tips",
    source: "slack",
    sourceTitle: "DM from Enablement",
    title: "Prompt patterns that actually help",
    body: "Enablement shared a one-pager: role + context + constraints + example output. Try it on a low-risk draft before customer-facing work.",
    tags: ["ai-forward", "prompting"],
    estimatedMinutes: 3,
  },
  {
    id: "ext-gmail:policy-update",
    source: "gmail",
    sourceTitle: "IT Policy",
    title: "GenAI acceptable use: Q2 update",
    body: "Email clarifies what you may paste into tools, retention expectations, and how to report a suspected leak. Required reading for AI-forward goals.",
    tags: ["ai-forward", "governance"],
    estimatedMinutes: 5,
  },
  {
    id: "ext-gmail:enablement-series",
    source: "gmail",
    sourceTitle: "Learning nudge",
    title: "Weekly AI lab invite",
    body: "Optional 30-minute labs on prompting and workflow automation. Reply to get calendar holds. No LMS enrollment required.",
    tags: ["ai-forward", "workflow", "prompting"],
    estimatedMinutes: 2,
  },
  {
    id: "ext-meet:office-hours",
    source: "meet",
    sourceTitle: "Recording",
    title: "AI office hours: safe drafting",
    body: "Recording covers anonymizing examples, comparing model output to source docs, and when to loop in a reviewer. Chapters marked in Meet.",
    tags: ["ai-forward", "governance", "fundamentals"],
    estimatedMinutes: 12,
  },
  {
    id: "ext-meet:show-and-tell",
    source: "meet",
    sourceTitle: "All-hands clip",
    title: "Show & tell: copilot in ops",
    body: "Two teams demoed ticket summarization and meeting notes. Focus on time saved and human review checkpoints, not full automation.",
    tags: ["ai-forward", "workflow"],
    estimatedMinutes: 8,
  },
  {
    id: "ext-drive:playbook",
    source: "drive",
    sourceTitle: "Shared drive",
    title: "AI-forward playbook (Google Doc)",
    body: "Living doc with team-specific scenarios, sample prompts, and links to LMS modules. Bookmark for your role’s section.",
    tags: ["ai-forward", "workflow", "prompting"],
    estimatedMinutes: 6,
  },
  {
    id: "ext-drive:checklist",
    source: "drive",
    sourceTitle: "Template",
    title: "Pre-flight checklist before you ship AI output",
    body: "One-page checklist: facts, tone, PII scan, approver. Used by Product and CS before external sends.",
    tags: ["ai-forward", "governance"],
    estimatedMinutes: 4,
  },
  {
    id: "ext-calendar:learning-block",
    source: "calendar",
    sourceTitle: "Focus time",
    title: "Blocked: AI skill sprint",
    body: "Calendar hold suggests 2× 45-minute blocks this week for course modules plus one lab. Protect the time like any customer milestone.",
    tags: ["ai-forward", "workflow"],
    estimatedMinutes: 2,
  },
  {
    id: "ext-calendar:manager-sync",
    source: "calendar",
    sourceTitle: "1:1 agenda",
    title: "Manager 1:1: AI goals check-in",
    body: "Agenda item: share one experiment you ran, one blocker, and one ask. Links to LMS path progress if enrolled.",
    tags: ["ai-forward", "workflow"],
    estimatedMinutes: 3,
  },
  {
    id: "ext-asana:learning-path",
    source: "asana",
    sourceTitle: "Project",
    title: "Personal AI-forward track",
    body: "Asana project template with tasks mirroring LMS modules and Slack labs. Mark done as you finish each asset.",
    tags: ["ai-forward", "workflow"],
    estimatedMinutes: 3,
  },
  {
    id: "ext-asana:experiment-log",
    source: "asana",
    sourceTitle: "Task template",
    title: "Log your first copilot experiment",
    body: "Template task: hypothesis, tool, outcome, reviewer. Feeds into quarterly skills conversations.",
    tags: ["ai-forward", "prompting"],
    estimatedMinutes: 5,
  },
  {
    id: "ext-workday:skill-profile",
    source: "workday",
    sourceTitle: "Skills",
    title: "Skill profile: Digital fluency",
    body: "Workday lists AI literacy as a growing skill for your role family. Suggested learning tied to LMS paths and completion credit.",
    tags: ["ai-forward", "fundamentals"],
    estimatedMinutes: 4,
  },
  {
    id: "ext-workday:development-goal",
    source: "workday",
    sourceTitle: "Development plan",
    title: "Development goal: AI-forward",
    body: "Sample development goal language you can adopt: apply AI safely on two workflows and document reviewer sign-off.",
    tags: ["ai-forward", "governance", "workflow"],
    estimatedMinutes: 5,
  },
];

export const integrationLearningAssets: LearningAsset[] = seeds.map((s) => ({
  id: s.id,
  kind: "content" as const,
  courseId: `integration-${s.source}`,
  title: s.title,
  body: s.body,
  tags: s.tags,
  source: s.source,
  sourceTitle: s.sourceTitle,
  packageLabel: s.sourceTitle,
  estimatedMinutes: s.estimatedMinutes,
}));

/** Meet-style video snippets for VideoSlide */
export const integrationVideoAssets: LearningAsset[] = [
  {
    id: "ext-meet:video-office-hours",
    kind: "video",
    courseId: "integration-meet",
    title: "AI office hours: safe drafting",
    description: "Recording covers anonymizing examples and human review checkpoints.",
    durationMinutes: 12,
    posterLabel: "Meet recording",
    tags: ["ai-forward", "governance"],
    source: "meet",
    sourceTitle: "Google Meet",
    packageLabel: "Meet recording",
  },
];
