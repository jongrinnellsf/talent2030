import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildVoiceDnaMarkdown,
  VOICE_DNA_SKILL_PATHS,
} from "../src/data/skills/voiceDnaSkill.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const markdown = buildVoiceDnaMarkdown();

for (const relativePath of Object.values(VOICE_DNA_SKILL_PATHS)) {
  const absolutePath = join(root, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, markdown, "utf8");
  console.log(`Wrote ${relativePath}`);
}
