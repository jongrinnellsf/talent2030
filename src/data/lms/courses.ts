import type { LmsCourse } from "./types";

export const lmsCourses: LmsCourse[] = [
  {
    id: "ai-fundamentals",
    title: "AI fundamentals for non-technical staff",
    summary:
      "What AI is at work, where it helps, and how to spot limits without needing to read model papers.",
    tags: ["ai-forward", "fundamentals", "literacy"],
    scormPackageId: "scorm-ai-fundamentals-v2",
    assets: [
      {
        id: "ai-fundamentals:block-welcome",
        kind: "content",
        courseId: "ai-fundamentals",
        title: "Welcome",
        body: "You'll leave with a plain-language map of AI at Acme AI Co.: useful patterns, honest limits, and when to loop in a human reviewer.",
        tags: ["ai-forward", "fundamentals"],
        scormPackageId: "scorm-ai-fundamentals-v2",
        estimatedMinutes: 5,
      },
      {
        id: "ai-fundamentals:video-what-is-ai",
        kind: "video",
        courseId: "ai-fundamentals",
        title: "What AI is (and isn't) at work",
        description: "Short explainer on prediction, tools, and why outputs need a human check.",
        durationMinutes: 8,
        posterLabel: "Module 1 · Video",
        tags: ["ai-forward", "fundamentals"],
      },
      {
        id: "ai-fundamentals:quiz-check",
        kind: "quiz",
        courseId: "ai-fundamentals",
        title: "Quick check: AI literacy",
        tags: ["ai-forward", "fundamentals"],
        questions: [
          {
            prompt: "When should you treat an AI draft as final?",
            options: [
              "When it sounds confident",
              "When a subject-matter expert has reviewed it",
              "When it matches your gut",
              "Never, AI is always wrong",
            ],
            correctIndex: 1,
          },
          {
            prompt: "What's a healthy first step with a new AI tool?",
            options: [
              "Paste customer PII to see what happens",
              "Run a low-risk internal task and compare to your usual process",
              "Replace your team's workflow in one day",
              "Skip documentation",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "ai-fundamentals:survey-confidence",
        kind: "survey",
        courseId: "ai-fundamentals",
        title: "Confidence pulse",
        tags: ["ai-forward", "fundamentals"],
        prompts: [
          "How confident do you feel explaining AI to a teammate?",
          "What would make you more willing to try AI on real work?",
        ],
      },
    ],
  },
  {
    id: "prompting",
    title: "Prompting effectively",
    summary:
      "Write prompts that pull useful answers from models: context, constraints, examples, and iteration.",
    tags: ["ai-forward", "prompting", "workflow"],
    scormPackageId: "scorm-prompting-v1",
    assets: [
      {
        id: "prompting:block-framework",
        kind: "content",
        courseId: "prompting",
        title: "A simple prompting frame",
        body: "Role, task, context, constraints, and output format. You'll practice each piece with Acme AI Co. templates.",
        tags: ["prompting", "ai-forward", "workflow"],
        scormPackageId: "scorm-prompting-v1",
        estimatedMinutes: 6,
      },
      {
        id: "prompting:video-demo",
        kind: "video",
        courseId: "prompting",
        title: "Walkthrough: from vague ask to useful draft",
        description: "See a mediocre prompt tightened into something you could ship after one review pass.",
        durationMinutes: 11,
        posterLabel: "Lab · Video",
        tags: ["prompting", "workflow"],
      },
      {
        id: "prompting:quiz-patterns",
        kind: "quiz",
        courseId: "prompting",
        title: "Prompt patterns quiz",
        tags: ["prompting"],
        questions: [
          {
            prompt: "Which line best adds useful context?",
            options: [
              "Be creative",
              "Audience: new managers; tone: direct; max 150 words",
              "Make it good",
              "Use AI magic",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "safe-use",
    title: "Using AI tools safely and responsibly",
    summary:
      "Data handling, bias checks, and escalation paths before AI touches customer or employee information.",
    tags: ["governance", "ai-forward", "security"],
    scormPackageId: "scorm-safe-use-v3",
    assets: [
      {
        id: "safe-use:block-policy",
        kind: "content",
        courseId: "safe-use",
        title: "Acme AI Co. guardrails",
        body: "Approved tools, data classes you must not paste, and when Legal or Security needs a ticket before you proceed.",
        tags: ["governance", "security"],
        scormPackageId: "scorm-safe-use-v3",
        estimatedMinutes: 7,
      },
      {
        id: "safe-use:video-red-flags",
        kind: "video",
        courseId: "safe-use",
        title: "Red flags in AI output",
        description: "Hallucinated citations, overconfident policy advice, and sensitive data leaks.",
        durationMinutes: 9,
        posterLabel: "Compliance · Video",
        tags: ["governance", "security"],
      },
      {
        id: "safe-use:survey-escalation",
        kind: "survey",
        courseId: "safe-use",
        title: "Where you'd escalate",
        tags: ["governance"],
        prompts: [
          "Which work tasks still feel risky to run through AI?",
          "Who on your team do you ask when you're unsure?",
        ],
      },
    ],
  },
  {
    id: "ai-in-role",
    title: "Applying AI to your role",
    summary:
      "Translate AI-forward habits into your actual job: meetings, docs, analysis, and handoffs.",
    tags: ["ai-forward", "workflow", "role"],
    assets: [
      {
        id: "ai-in-role:block-playbook",
        kind: "content",
        courseId: "ai-in-role",
        title: "Role-based starter playbook",
        body: "Pick one recurring task this week, define done, and pair AI output with a human sign-off you already trust.",
        tags: ["ai-forward", "workflow", "role"],
        estimatedMinutes: 5,
      },
      {
        id: "ai-in-role:video-examples",
        kind: "video",
        courseId: "ai-in-role",
        title: "Three workflows that actually stuck",
        description: "Examples from ops, product, and customer teams inside Acme AI Co..",
        durationMinutes: 10,
        posterLabel: "Stories · Video",
        tags: ["workflow", "role"],
      },
      {
        id: "ai-in-role:quiz-apply",
        kind: "quiz",
        courseId: "ai-in-role",
        title: "Apply it quiz",
        tags: ["workflow", "role"],
        questions: [
          {
            prompt: "Best next step after your first AI-assisted draft?",
            options: [
              "Send it immediately",
              "Compare to your checklist and edit for facts and tone",
              "Run the same prompt ten times",
              "Disable logging",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
];

const assetIndex = new Map<string, LmsCourse["assets"][number]>();
const courseIndex = new Map<string, LmsCourse>();

for (const course of lmsCourses) {
  courseIndex.set(course.id, course);
  for (const asset of course.assets) {
    assetIndex.set(asset.id, asset);
  }
}

export function getLmsCourse(courseId: string): LmsCourse | undefined {
  return courseIndex.get(courseId);
}

export function getLmsAsset(assetId: string) {
  return assetIndex.get(assetId);
}

export function getAllLmsAssetIds(): string[] {
  return [...assetIndex.keys()];
}
