import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { blocks } from "../src/data/blocks/index";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "content", "catalog.json");

mkdirSync(dirname(outPath), { recursive: true });

writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      blockCount: blocks.length,
      blocks,
    },
    null,
    2
  ),
  "utf-8"
);

console.log(`Catalog exported: ${outPath} (${blocks.length} blocks)`);
