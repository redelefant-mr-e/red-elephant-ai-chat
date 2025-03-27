import fs from "fs";

export function loadMarkdown(path) {
  return fs.readFileSync(path, "utf-8");
}
