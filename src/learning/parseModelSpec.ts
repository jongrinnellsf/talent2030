import {
  compileSpecStream,
  createSpecStreamCompiler,
} from "@json-render/core";

/** Parse model output: flat JSON spec or json-render SpecStream JSONL patches. */
export function parseModelSpec(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : trimmed).trim();

  if (body.includes('"op"') && (body.includes("/elements") || body.includes("/root"))) {
    try {
      return compileSpecStream(body);
    } catch {
      /* try line-by-line */
    }
    try {
      const compiler = createSpecStreamCompiler();
      for (const line of body.split("\n")) {
        const row = line.trim();
        if (row) compiler.push(`${row}\n`);
      }
      return compiler.getResult();
    } catch {
      /* fall through */
    }
  }

  if (body.startsWith("{")) {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }

  try {
    return compileSpecStream(body);
  } catch {
    return null;
  }
}
