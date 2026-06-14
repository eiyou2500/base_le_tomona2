import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
const skip = new Set([".git", "node_modules", ".codex/verify-output"]);
const exts = new Set([".md", ".html", ".css", ".js", ".mjs", ".json", ".yml", ".yaml", ".py", ".sh"]);
const failures = [];
async function walk(dir) { for (const e of await readdir(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if ([...skip].some((s) => p === s || p.startsWith(s + path.sep))) continue; if (e.isDirectory()) await walk(p); else if (exts.has(path.extname(p)) || path.basename(p) === "Makefile") await check(p); } }
async function check(file) { const text = await readFile(file, "utf8"); if (text && !text.endsWith("\n")) failures.push(`${file}: missing final newline`); text.split("\n").forEach((line, i) => { if (/[ \t]$/.test(line)) failures.push(`${file}:${i + 1}: trailing whitespace`); if (file !== "Makefile" && /\t/.test(line)) failures.push(`${file}:${i + 1}: tab character`); }); if (path.extname(file) === ".json") { try { JSON.parse(text); } catch (e) { failures.push(`${file}: invalid JSON ${e.message}`); } } }
await walk(".");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("format check passed");
