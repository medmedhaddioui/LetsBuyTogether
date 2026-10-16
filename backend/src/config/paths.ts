import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { fileURLToPath } from "node:url";

// Find the package in both src/ and compiled dist/src/ layouts.
let directory = dirname(fileURLToPath(import.meta.url));
while (!existsSync(join(directory, "package.json"))) {
  const parent = dirname(directory);
  if (parent === directory) throw new Error("Cannot locate the application package.");
  directory = parent;
}
export const backendRoot = directory;
export const projectRoot = dirname(backendRoot);
export const frontendRoot = join(projectRoot, "frontend");
export const frontendDist = join(frontendRoot, "dist");
