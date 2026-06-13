import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const required = ["AGENTS.md", "Makefile", "README.md", "package.json", "scripts/verify.sh", "scripts/lint.mjs", "scripts/format-check.mjs", "scripts/build.mjs", "scripts/test.mjs", "scripts/verify-content.mjs", "scripts/verify-release.mjs", "src/templates/base-theme.html", "src/styles/base.css", "src/scripts/main.js"];
const failures = [];
for (const f of required) if (!existsSync(f)) failures.push(`missing ${f}`);
for (const f of ["scripts/verify.sh", ".codex/hooks/stop_verify.py"]) if (existsSync(f) && !((await stat(f)).mode & 0o111)) failures.push(`${f}: not executable`);
const forbidden = ["裏予約", "顔戸452", "Shipping", "Pickup reservation", "Add to cart", "Read more", "lorem ipsum", "TODO", "最高級", "完全再現", "健康に良い", "無添加", "保存料不使用"];
async function walk(dir) { for (const e of await readdir(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if ([".git", "node_modules", ".codex/verify-output"].some((s) => p === s || p.startsWith(s + path.sep))) continue; if (e.isDirectory()) await walk(p); else await check(p); } }
async function check(file) { const text = await readFile(file, "utf8").catch(() => ""); if (text && !text.endsWith("\n")) failures.push(`${file}: missing final newline`); text.split("\n").forEach((line, i) => { if (/[ \t]$/.test(line)) failures.push(`${file}:${i + 1}: trailing whitespace`); }); if (file.endsWith(".html") && !text.includes('lang="ja"')) failures.push(`${file}: missing lang=ja`); if (file.startsWith("src/") || file.startsWith("dist/")) { for (const bad of forbidden) if (text.includes(bad)) failures.push(`${file}: forbidden ${bad}`); } if (file.endsWith(".mjs") || file.endsWith(".js")) { const r = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" }); if (r.status !== 0) failures.push(`${file}: syntax error ${r.stderr}`); } }
await walk(".");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("lint passed");
