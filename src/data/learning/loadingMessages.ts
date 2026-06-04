/** How long each loading line stays visible before rotating. */
export const LOADING_MESSAGE_INTERVAL_MS = 3500;

export const PATH_GENERATION_LOADING_MESSAGES = [
  "Researching sources and building your path…",
  "Scanning the web for up-to-date material…",
  "Tailoring slides to what you shared in intake…",
  "Shaping examples for your role and context…",
  "Lining up five slides and your knowledge check…",
  "Almost there—polishing your path…",
] as const;

export const CANVAS_UPDATE_LOADING_MESSAGES = [
  "Updating canvas…",
  "Refreshing what's on your canvas…",
  "Laying out the next take…",
  "Organizing that for the screen…",
] as const;

export const COACH_PROCESSING_LOADING_MESSAGES = [
  "Looking into it…",
  "Thinking through your question…",
  "Connecting this to what you already know…",
  "Pulling together a clear answer…",
] as const;

export const SLIDE_BUILD_LOADING_MESSAGES = [
  "Building slides…",
  "Rendering your next step…",
  "Assembling the deck…",
] as const;
