import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");

await copyFile(
  join(root, "manifest.json"),
  join(root, "dist", "manifest.json"),
);
