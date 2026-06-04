import type { ReactNode } from "react";

/** Collapse odd spacing the model sometimes inserts around bold markers. */
function normalizeAiMarkdown(text: string): string {
  return text.replace(/\*\*\s+\(/g, "**(");
}

const INLINE_MARKDOWN_PATTERN =
  /(\*\*[^*]+\*\*|[A-Z][A-Za-z0-9\s(),\-/'&]*?:\*\*)/g;

export const LEARNING_TEXT_ACCENT_CLASS = "learning-text-accent";

export function renderLearningInline(text: string): ReactNode {
  return renderInlineMarkdown(text, { accent: true });
}

/** Renders inline markdown: **bold**, **Label:**, and Label:** */
export function renderInlineMarkdown(
  text: string,
  options?: { strongClassName?: string; accent?: boolean }
): ReactNode {
  const strongClassName =
    options?.strongClassName ??
    (options?.accent ? LEARNING_TEXT_ACCENT_CLASS : undefined);
  const normalized = normalizeAiMarkdown(text);

  if (/^_[^_]+_$/.test(normalized.trim())) {
    return <em className="text-[var(--text-muted)]">{normalized.trim().slice(1, -1)}</em>;
  }

  const parts = normalized.split(INLINE_MARKDOWN_PATTERN).filter((part) => part.length > 0);

  return parts.map((part, i) => {
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      return (
        <em key={i} className="text-[var(--text-muted)]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      const label = part.slice(2, -2).trim();
      return (
        <strong key={i} className={strongClassName}>
          {label}
        </strong>
      );
    }
    if (part.endsWith(":**")) {
      return (
        <strong key={i} className={strongClassName}>
          {part.slice(0, -2).trim()}:
        </strong>
      );
    }
    return part;
  });
}

/** Strip list markers only — never strip markdown asterisks. */
export function normalizeBulletText(text: string): string {
  let line = text.trim();
  line = line.replace(/^[\s•·▪\-–—]+/, "");
  if (/^[•·▪]\s/.test(line)) line = line.slice(2).trimStart();
  if (/^-\s/.test(line)) line = line.slice(2).trimStart();
  return line;
}

function looksLikeListLine(line: string): boolean {
  const trimmed = line.trim();
  if (/^[\s•·▪\-–—]/.test(trimmed)) return true;
  if (/^\*\*[^*]+:\*\*/.test(trimmed)) return true;
  if (/^[A-Z][^:\n]{1,80}:\*\*\s/.test(trimmed)) return true;
  return false;
}

/** Split intro prose from list lines when the model puts bullets in body. */
export function splitSlideBodyAndBullets(
  body: string,
  bullets?: string[]
): { intro: string; items: string[] } {
  const expandedFromBullets = (bullets ?? []).flatMap((item) => {
    const lines = item.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    return lines.length > 1 ? lines : [item];
  });

  if (expandedFromBullets.length > 0) {
    return { intro: body.trim(), items: expandedFromBullets };
  }

  const lines = body.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return { intro: body.trim(), items: [] };
  }

  const listStart = lines.findIndex(looksLikeListLine);
  if (listStart === -1) {
    return { intro: body.trim(), items: [] };
  }
  if (listStart === 0) {
    return { intro: "", items: lines };
  }

  return {
    intro: lines.slice(0, listStart).join(" "),
    items: lines.slice(listStart),
  };
}
