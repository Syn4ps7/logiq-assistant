#!/usr/bin/env node
/**
 * Build & typecheck summarizer.
 *
 * Runs `tsc --noEmit` and `vite build` (in that order) and condenses their
 * output to a short, copy-pasteable list of errors with `file:line:col → message`.
 *
 * Goal: when a syntax / type / bundler error breaks the project, you get a
 * one-screen summary instead of having to scroll through hundreds of lines of
 * Vite/Rollup/TS output. Designed for both Vite (frontend) and Deno-bundled
 * Supabase edge functions when their parse errors surface through the build.
 *
 * Usage:
 *   npm run build:summary
 *   node scripts/build-summary.mjs --quick   # tsc only, skip vite
 *   node scripts/build-summary.mjs --vite    # vite only, skip tsc
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const onlyTsc = args.has("--quick");
const onlyVite = args.has("--vite");
const jsonStdout = args.has("--json"); // emit JSON report on stdout (silences pretty output)
// --json-out=<path> writes the JSON report to disk (pretty output stays).
const jsonOutArg = rawArgs.find((a) => a.startsWith("--json-out="));
const jsonOutPath = jsonOutArg ? jsonOutArg.slice("--json-out=".length) : null;

const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

/** @typedef {{ file: string, line: number, col: number, code?: string, message: string, severity: "error"|"warning", source: string }} Issue */

/** @type {Issue[]} */
const issues = [];

function pushIssue(issue) {
  // Normalize file path to repo-relative for short output.
  const abs = resolve(issue.file);
  issue.file = relative(ROOT, abs) || issue.file;
  issues.push(issue);
}

/** Parse `tsc --noEmit` output. Format:
 *    src/foo.ts(12,34): error TS2304: Cannot find name 'x'.
 */
function parseTsc(out) {
  const re = /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/gm;
  let m;
  while ((m = re.exec(out)) !== null) {
    pushIssue({
      file: m[1],
      line: Number(m[2]),
      col: Number(m[3]),
      severity: m[4],
      code: m[5],
      message: m[6].trim(),
      source: "tsc",
    });
  }
}

/** Parse vite/rollup/esbuild output. Examples:
 *    [plugin:vite:react-swc] x Expected ';', got 'foo'
 *      ╭─[/abs/src/foo.tsx:12:34]
 *    src/foo.ts:12:34: ERROR: Expected ';'
 *    error during build:
 *    file: /abs/src/foo.ts:12:34
 */
function parseVite(out) {
  // esbuild-style: path:line:col: ERROR/WARNING: message
  const reEsbuild = /^([^:\s]+\.[a-zA-Z]+):(\d+):(\d+):\s+(ERROR|WARNING):\s+(.+)$/gm;
  let m;
  while ((m = reEsbuild.exec(out)) !== null) {
    pushIssue({
      file: m[1],
      line: Number(m[2]),
      col: Number(m[3]),
      severity: m[4] === "ERROR" ? "error" : "warning",
      message: m[5].trim(),
      source: "vite/esbuild",
    });
  }

  // SWC-style: ╭─[/abs/path:line:col]
  const reSwc = /╭─\[([^:]+):(\d+):(\d+)\]/g;
  // Pair each location with the preceding "x message" line.
  const lines = out.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const loc = lines[i].match(/╭─\[(.+):(\d+):(\d+)\]/);
    if (!loc) continue;
    // walk back for the nearest "  x <msg>" or "[plugin...] x <msg>"
    let msg = "Parse error";
    for (let j = i - 1; j >= Math.max(0, i - 6); j--) {
      const mm = lines[j].match(/(?:\bx|×)\s+(.+)$/);
      if (mm) {
        msg = mm[1].trim();
        break;
      }
    }
    pushIssue({
      file: loc[1],
      line: Number(loc[2]),
      col: Number(loc[3]),
      severity: "error",
      message: msg,
      source: "vite/swc",
    });
  }

  // Rollup-style: "file: /abs/path:line:col"
  const reRollup = /file:\s+(\/[^\s:]+):(\d+):(\d+)/g;
  while ((m = reRollup.exec(out)) !== null) {
    // Avoid duplicating SWC locations
    const exists = issues.some(
      (i) => i.line === Number(m[2]) && i.col === Number(m[3]) && resolve(i.file) === resolve(m[1])
    );
    if (!exists) {
      pushIssue({
        file: m[1],
        line: Number(m[2]),
        col: Number(m[3]),
        severity: "error",
        message: "Rollup build error (see full log for details)",
        source: "rollup",
      });
    }
  }
}

function run(cmd, argv, label) {
  if (!jsonStdout) process.stdout.write(C.dim(`▸ ${label}: ${cmd} ${argv.join(" ")}\n`));
  const res = spawnSync(cmd, argv, {
    cwd: ROOT,
    encoding: "utf8",
    shell: false,
    env: { ...process.env, FORCE_COLOR: "0" },
  });
  return {
    code: res.status ?? 1,
    out: (res.stdout || "") + "\n" + (res.stderr || ""),
  };
}

const ranSteps = [];
let combinedOut = "";

if (!onlyVite) {
  const r = run("npx", ["--no-install", "tsc", "-p", "tsconfig.app.json", "--noEmit"], "typecheck");
  ranSteps.push({ label: "typecheck", code: r.code });
  combinedOut += r.out + "\n";
  parseTsc(r.out);
}

if (!onlyTsc) {
  const r = run("npx", ["--no-install", "vite", "build", "--logLevel=error"], "build");
  ranSteps.push({ label: "build", code: r.code });
  combinedOut += r.out + "\n";
  parseVite(r.out);
}

// Deduplicate identical issues.
const seen = new Set();
const unique = issues.filter((i) => {
  const key = `${i.file}:${i.line}:${i.col}:${i.message}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const errors = unique.filter((i) => i.severity === "error");
const warnings = unique.filter((i) => i.severity === "warning");

// Build the structured report once — used for both stdout JSON and --json-out.
const report = {
  ok: ranSteps.every((s) => s.code === 0) && errors.length === 0,
  generatedAt: new Date().toISOString(),
  steps: ranSteps,
  totals: { errors: errors.length, warnings: warnings.length },
  issues: unique.map((i) => ({
    file: i.file,
    line: i.line,
    col: i.col,
    severity: i.severity,
    code: i.code ?? null,
    message: i.message,
    source: i.source,
  })),
};

if (jsonOutPath) {
  const abs = resolve(ROOT, jsonOutPath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, JSON.stringify(report, null, 2) + "\n", "utf8");
}

if (jsonStdout) {
  // Pure JSON on stdout — exit code still reflects errors.
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  process.exit(errors.length > 0 ? 1 : 0);
}

console.log("");
console.log(C.bold("── Compilation summary ──"));
for (const s of ranSteps) {
  const tag = s.code === 0 ? C.green("PASS") : C.red("FAIL");
  console.log(`  ${tag}  ${s.label} (exit ${s.code})`);
}
console.log("");

if (unique.length === 0) {
  if (ranSteps.every((s) => s.code === 0)) {
    console.log(C.green("✓ No errors detected."));
  } else {
    console.log(
      C.yellow(
        "! A step failed but no structured error was extracted. Re-run the failing command directly to see raw output."
      )
    );
  }
  if (jsonOutPath) console.log(C.dim(`JSON report written to ${jsonOutPath}`));
  process.exit(ranSteps.some((s) => s.code !== 0) ? 1 : 0);
}

console.log(C.bold(`${errors.length} error(s), ${warnings.length} warning(s):`));
console.log("");

const fmt = (i) => {
  const sev = i.severity === "error" ? C.red("error") : C.yellow("warn ");
  const loc = C.cyan(`${i.file}:${i.line}:${i.col}`);
  const code = i.code ? C.dim(` [${i.code}]`) : "";
  const src = C.dim(` (${i.source})`);
  return `  ${sev}  ${loc}${code} → ${i.message}${src}`;
};

for (const i of errors) console.log(fmt(i));
for (const i of warnings) console.log(fmt(i));

console.log("");
if (jsonOutPath) console.log(C.dim(`JSON report written to ${jsonOutPath}`));
console.log(C.dim(`Tip: --quick (tsc only) · --vite (build only) · --json (stdout) · --json-out=path`));

process.exit(errors.length > 0 ? 1 : 0);
