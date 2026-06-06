import { buildRehearsePath } from "../../routes";
import type { DeliveryPlaybook } from "../../types";

export const deliveryPlaybooks: Record<string, DeliveryPlaybook> = {
  "mark-webb": {
    employeeId: "mark-webb",
    headlineTension:
      "Mark self-rated 4/5 and blames shifting requirements. Your written review is 2/5 with PIP watch. You've both read the documents; delivery is about closing the gap without re-litigating the rating.",
    signalsSummary:
      "Slack and Meet recordings show defensive scope pushback and a habit of pointing at Data dependencies. Gmail confirms Q1 goals were agreed in January. Asana shows partial milestone completion and a retro follow-through that landed late. Finance and Workday tie Mark's March scope standoff to checkout slipping out of Q1; completion never improved. Mark's Workday self-review leans on external factors. Your review anchors on product group planning ownership and closed-loop 1:1 commitments.",
    deliveryConsiderations: [
      "Open with COIN on specific behaviors. Nothing new at the rating reveal.",
      "Separate intent from impact when Mark cites shifting requirements.",
      "If Mark challenges fairness, use checkout (launch slipped, completion flat). Pick that one anchor, not a pile of metrics.",
      "Two dated examples beat a stack of misses.",
      "Co-create a recovery plan with weekly check-ins. Partner with HR if milestones slip.",
    ],
    potentialReactions: [
      {
        id: "mark-offended",
        title: "Offended and challenges fairness",
        description:
          "Pushes back on the 2/5, cites the roadmap deck and Data delays, and asks whether you're cherry-picking examples.",
        confidence: "high",
        practiceHref: buildRehearsePath({
          scenario: "defensive",
          autostart: "1",
        }),
      },
      {
        id: "mark-surprised",
        title: "Surprised by the gap",
        description:
          "Expected alignment with their 4/5 self-rating. Asks what they missed and whether prior 1:1s were clear enough.",
        confidence: "medium",
        practiceHref: buildRehearsePath({
          scenario: "default",
          autostart: "1",
        }),
      },
      {
        id: "mark-accepting",
        title: "Accepts and wants a path forward",
        description:
          "Acknowledges follow-through gaps. Asks for concrete recovery milestones and how you'll measure progress.",
        confidence: "low",
        practiceHref: buildRehearsePath({
          scenario: "accepting",
          autostart: "1",
        }),
      },
    ],
    recommendedPractice: {
      reactionId: "mark-offended",
      rationale:
        "Defensive pushback is the highest-risk delivery here. Rehearse staying factual and COIN-grounded before the easier scenarios.",
    },
  },
  "priya-reddy": {
    employeeId: "priya-reddy",
    headlineTension:
      "Priya and you both rate them at the top of the band, but Priya wants principal-track scope formalized while calibration still treats it as informal. This is a growth conversation, not a surprise rating.",
    signalsSummary:
      "Slack shows Priya driving migration cutover decisions and mentoring threads with two L4s. Meet transcripts capture Priya's RFC walkthrough, which two teams adopted. Asana milestones closed 11 days early with zero sev-1 incidents. Priya's Workday self-review asks for clearer leveling criteria; your review agrees on impact but notes principal scope isn't formalized yet.",
    deliveryConsiderations: [
      "Lead with impact recognition. Ask for Priya's read on principal scope before you state calibration nuance.",
      "Anchor promotion evidence with business outcomes and peer feedback, not tenure.",
      "Be direct about what's formal vs. informal in leveling. Skip vague \"keep doing great work.\"",
      "Co-create Q3 milestones that map to the principal-track bar with Eng leadership visibility.",
    ],
    potentialReactions: [
      {
        id: "priya-promotion-gap",
        title: "Focuses on promotion criteria gap",
        description:
          "Thanks you for the 5/5 but presses on why principal scope is still informal after migration impact. Wants names and timelines.",
        confidence: "high",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
      {
        id: "priya-oncall-burden",
        title: "Redirects to on-call load",
        description:
          "Acknowledges impact but argues on-call during cutover undervalues execution risk. Asks how that factors into leveling.",
        confidence: "medium",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
      {
        id: "priya-collaborative",
        title: "Collaborative on next chapter",
        description:
          "Accepts calibration framing. Proposes an external talk and the failover initiative as proof points for principal scope.",
        confidence: "low",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
    ],
    recommendedPractice: {
      reactionId: "priya-promotion-gap",
      rationale:
        "The principal-scope conversation is where managers over-promise or under-explain. Practice holding the calibration line with specifics.",
    },
  },
  "jordan-lee": {
    employeeId: "jordan-lee",
    headlineTension:
      "Jordan self-rated 3/5 and you agree at meets expectations, but Jordan may hear the ownership critique as harsher than the number. Both reviews are written; delivery should balance recognition with one clear stretch.",
    signalsSummary:
      "Slack shows solid design collaboration on checkout and a token refresh two product groups adopted. Meet notes from Growth syncs flag moments where Jordan waited for PM direction on final UX calls. Asana tracks usability study delivery tied to the experiment backlog. Jordan's Workday self-review cites calibration on when to escalate; your review asks for end-to-end ownership through launch metrics.",
    deliveryConsiderations: [
      "Open with two specific strengths before the stretch goal. Don't lead with the gap.",
      "Co-create measurable Q3 targets. Ask what resonates before you move to the rating.",
      "Use one checkout experiment as the ownership anchor. Skip the laundry list of waits.",
      "Offer the facilitation workshop as support, not as a fix for a performance problem.",
    ],
    potentialReactions: [
      {
        id: "jordan-ownership-anxiety",
        title: "Anxious about ownership critique",
        description:
          "Agrees with 3/5 but worries the ownership theme means they're seen as passive. Asks for examples beyond Growth.",
        confidence: "high",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
      {
        id: "jordan-rating-mismatch",
        title: "Feels the narrative is harsher than the rating",
        description:
          "Says the written review reads like a 2/5 while the number says meets. Wants the story and score to line up.",
        confidence: "medium",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
      {
        id: "jordan-motivated",
        title: "Motivated by stretch goals",
        description:
          "Energized by end-to-end checkout ownership. Asks for clarity on decision rights vs. PM partnership.",
        confidence: "medium",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
    ],
    recommendedPractice: {
      reactionId: "jordan-ownership-anxiety",
      rationale:
        "Meets-expectations conversations lose trust when the tone feels like a hidden negative. Practice warmth with one crisp stretch.",
    },
  },
  "alex-rivera": {
    employeeId: "alex-rivera",
    headlineTension:
      "Six-month check-in: Alex self-rated on track and you agree. Delivery is developmental, not a rating reveal. You've both read the write-ups; focus on the L3 bar for prioritization and exec communication.",
    signalsSummary:
      "Slack shows fast responses on ad hoc analysis requests but uneven pushback on prioritization. Meet recordings from product group reviews show concise analysis but hesitant exec-facing delivery. Asana lists the onboarding dashboard and SQL models completed on time. Alex's Workday self-review flags stakeholder thrash; your review matches with specific growth areas, not a formal annual rating deep-dive.",
    deliveryConsiderations: [
      "Set tone as a developmental check-in, not a surprise performance verdict.",
      "Give specific communication feedback with one product group review clip as anchor.",
      "Introduce the intake template as a shared tool with PM, not a criticism of responsiveness.",
      "End with clear Q3 expectations for the L3 bar and what \"own end-to-end\" means here.",
    ],
    potentialReactions: [
      {
        id: "alex-nervous-wording",
        title: "Nervous about formal wording",
        description:
          "Asks whether \"on track\" means safe or whether prioritization feedback implies a PIP path at six months.",
        confidence: "high",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
      {
        id: "alex-overwhelmed",
        title: "Overwhelmed by stakeholder thrash",
        description:
          "Describes conflicting PM requests and wants help saying no. May deflect communication feedback as a capacity issue.",
        confidence: "medium",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
      {
        id: "alex-eager",
        title: "Eager to improve",
        description:
          "Accepts feedback. Asks for a template and a chance to present in the next product group review with your coaching.",
        confidence: "low",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
    ],
    recommendedPractice: {
      reactionId: "alex-nervous-wording",
      rationale:
        "New hires often misread developmental tone as hidden negative. Practice reassuring clarity without softening the L3 bar.",
    },
  },
  "taylor-brooks": {
    employeeId: "taylor-brooks",
    headlineTension:
      "Taylor self-rated 4/5 and you agree on delivery, but Taylor has flagged comp and unsustainable launch load in recent 1:1s. Both reviews are written; listen on retention before you anchor the rating.",
    signalsSummary:
      "Slack shows Taylor keeping three launch threads unblocked through Q1 crunch. Meet 1:1 notes document comp and scope concerns raised twice since March. Asana launch calendars show zero sev-1 incidents across three programs. Taylor's Workday self-review cites workload sustainability; your review praises execution but requires a cap on concurrent launches and a written scope path by June.",
    deliveryConsiderations: [
      "Listen first on retention drivers. Don't dismiss comp concerns in the opening minute.",
      "Deliver the 4/5 with 2–3 launch examples after Taylor feels heard.",
      "Don't promise comp or promotion changes you can't commit to.",
      "Co-create a workload cap and program health metrics as forward goals, not concessions.",
    ],
    potentialReactions: [
      {
        id: "taylor-retention-first",
        title: "Leads with retention before hearing rating",
        description:
          "Opens on compensation and scope path. Asks whether strong delivery matters if the role is unsustainable.",
        confidence: "high",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
      {
        id: "taylor-split-reception",
        title: "Accepts praise, pushes on scope",
        description:
          "Thanks you for launch recognition but returns to concurrent launch load. Wants a firm cap, not another playbook ask.",
        confidence: "medium",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
      {
        id: "taylor-relieved",
        title: "Relieved when sustainability is addressed",
        description:
          "Engages on program health metrics and a platform-programs path once the workload cap feels concrete.",
        confidence: "low",
        practiceHref: buildRehearsePath({ autostart: "1" }),
      },
    ],
    recommendedPractice: {
      reactionId: "taylor-retention-first",
      rationale:
        "High performers with retention flags need listening-first delivery. Practice not rushing to the rating reveal.",
    },
  },
};

export function getDeliveryPlaybook(employeeId: string): DeliveryPlaybook {
  const playbook = deliveryPlaybooks[employeeId];
  if (!playbook) {
    throw new Error(`No delivery playbook for employee: ${employeeId}`);
  }
  return playbook;
}
