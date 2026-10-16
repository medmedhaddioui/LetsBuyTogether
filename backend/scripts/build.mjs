import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const compiler = fileURLToPath(new URL("../node_modules/typescript/bin/tsc", import.meta.url));

// Removed or renamed modules should not remain in the deployment output.
rmSync(new URL("../dist/", import.meta.url), { recursive: true, force: true });
const result = spawnSync(process.execPath, [compiler], { cwd: packageRoot, stdio: "inherit" });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
