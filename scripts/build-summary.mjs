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
import { mkdirSync, readdirSync, statSync, watch, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const onlyTsc = args.has("--quick");
const onlyVite = args.has("--vite");
const onlyEdge = args.has("--edge"); // run ONLY the edge functions check
const skipEdge = args.has("--no-edge"); // skip edge functions check (default: included)
const jsonStdout = args.has("--json"); // emit JSON report on stdout (silences pretty output)
// --json-out=<path> writes the JSON report to disk (pretty output stays).
const jsonOutArg = rawArgs.find((a) => a.startsWith("--json-out="));
const jsonOutPath = jsonOutArg ? jsonOutArg.slice("--json-out=".length) : null;
// GitHub Actions workflow commands: opt-in via flag OR auto-detected when run on CI.
const ghAnnotations = args.has("--github") || process.env.GITHUB_ACTIONS === "true";
// --watch: re-run the configured steps whenever source files change. Disables
// hard process.exit so the loop survives multiple runs.
const watchMode = args.has("--watch");

/**
 * Escape a string for the *message* part of a GitHub workflow command.
 * See: https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#example-masking-and-passing-an-environment-variable
 */
function ghEscapeData(s) {
  return String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
/** Escape a string for property *values* (file=, line=, etc.). */
function ghEscapeProp(s) {
  return ghEscapeData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");
}
function emitGhAnnotations(items) {
  for (const i of items) {
    const level = i.severity === "error" ? "error" : "warning";
    const props = [
      `file=${ghEscapeProp(i.file)}`,
      `line=${i.line}`,
      `col=${i.col}`,
      `title=${ghEscapeProp(`${i.source}${i.code ? ` ${i.code}` : ""}`)}`,
    ].join(",");
    // Written to stderr so it never pollutes --json stdout.
    process.stderr.write(`::${level} ${props}::${ghEscapeData(i.message)}\n`);
  }
}

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

/** Strip ANSI color escapes — Deno always colors errors even with NO_COLOR
 *  in some shells, so we sanitize before regex matching. */
function stripAnsi(s) {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Parse `deno check` output. Two formats matter:
 *
 * 1. Type errors:
 *      TS2322 [ERROR]: Type 'string' is not assignable to type 'number'.
 *      const x: number = "string";
 *            ^
 *          at file:///abs/path:1:7
 *
 * 2. Parse errors:
 *      error: The module's source code could not be parsed: Expected ';' …
 *      at file:///abs/path:2:5
 */
function parseDeno(rawOut) {
  const out = stripAnsi(rawOut);

  // Type-check errors: capture code + message + the trailing `at file://…:L:C`
  const reType =
    /^(TS\d+)\s+\[(ERROR|WARNING)\]:\s+(.+?)$[\s\S]*?at\s+(?:file:\/\/)?(\S+?):(\d+):(\d+)/gm;
  let m;
  while ((m = reType.exec(out)) !== null) {
    pushIssue({
      file: m[4].replace(/^file:\/\//, ""),
      line: Number(m[5]),
      col: Number(m[6]),
      severity: m[2] === "WARNING" ? "warning" : "error",
      code: m[1],
      message: m[3].trim(),
      source: "deno",
    });
  }

  // Parse errors: "error: <message> at file://path:L:C"
  // (also matches the bundler "could not be parsed" message format)
  const reParse =
    /^error:\s+(.+?)\s+at\s+(?:file:\/\/)?(\S+?):(\d+):(\d+)/gm;
  while ((m = reParse.exec(out)) !== null) {
    pushIssue({
      file: m[2].replace(/^file:\/\//, ""),
      line: Number(m[3]),
      col: Number(m[4]),
      severity: "error",
      message: m[1].trim(),
      source: "deno",
    });
  }
}

/** List every supabase/functions/<name>/index.ts to type-check. */
function listEdgeFunctionEntrypoints() {
  const dir = resolve(ROOT, "supabase/functions");
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const out = [];
  for (const name of entries) {
    if (name.startsWith("_") || name.startsWith(".")) continue;
    const entry = join(dir, name, "index.ts");
    try {
      if (statSync(entry).isFile()) out.push(entry);
    } catch {
      /* missing index.ts — skip */
    }
  }
  return out;
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

// Frontend typecheck (skipped when --vite, --edge)
if (!onlyVite && !onlyEdge) {
  const r = run("npx", ["--no-install", "tsc", "-p", "tsconfig.app.json", "--noEmit"], "typecheck");
  ranSteps.push({ label: "typecheck", code: r.code });
  combinedOut += r.out + "\n";
  parseTsc(r.out);
}

// Frontend build (skipped when --quick, --edge)
if (!onlyTsc && !onlyEdge) {
  const r = run("npx", ["--no-install", "vite", "build", "--logLevel=error"], "build");
  ranSteps.push({ label: "build", code: r.code });
  combinedOut += r.out + "\n";
  parseVite(r.out);
}

// Edge functions check (skipped when --no-edge, --quick, --vite)
// Uses `deno check` per function so we get the same file:line:col format
// as tsc/vite. Requires `deno` on PATH; otherwise the step is reported as
// FAIL with a single synthetic issue rather than crashing the script.
if (!skipEdge && !onlyTsc && !onlyVite) {
  const entries = listEdgeFunctionEntrypoints();
  if (entries.length > 0) {
    // One spawn for all entrypoints — Deno handles them concurrently and
    // prints all diagnostics at the end.
    const r = run("deno", ["check", "--quiet", ...entries], "edge-functions");
    ranSteps.push({ label: "edge-functions", code: r.code });
    combinedOut += r.out + "\n";

    if (r.code !== 0 && /command not found|ENOENT|not recognized/i.test(r.out)) {
      pushIssue({
        file: "supabase/functions",
        line: 1,
        col: 1,
        severity: "error",
        message: "deno CLI not found on PATH — install Deno to enable edge function checks",
        source: "deno",
      });
    } else {
      parseDeno(r.out);
    }
  }
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


// GitHub annotations are independent of pretty/JSON modes — they go to stderr
// so the PR shows inline error/warning markers regardless of the chosen output.
if (ghAnnotations) emitGhAnnotations(unique);

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
console.log(C.dim(`Tip: --quick · --vite · --edge · --no-edge · --json · --json-out=path · --github`));

process.exit(errors.length > 0 ? 1 : 0);
