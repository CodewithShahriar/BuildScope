import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const clientDir = resolve("dist/client");

await copyFile(resolve(clientDir, "_shell.html"), resolve(clientDir, "index.html"));
