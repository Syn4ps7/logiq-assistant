import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Guards the chatbot system prompt against link-format regressions.
 *
 * The chat edge function ships a hard-coded list of /reservation deep links
 * that the LLM is instructed to use verbatim. If any of those links breaks
 * (missing &options, malformed query, stray backtick) the chatbot silently
 * sends users to a generic /reservation page with no context — exactly the
 * bug we just fixed. These tests fail fast on regression.
 */

const PROMPT_FILE = resolve(__dirname, "../../supabase/functions/chat/index.ts");
const PROMPT_SOURCE = readFileSync(PROMPT_FILE, "utf8");

// Extract every /reservation?... URL appearing in markdown links (…)
const LINK_RE = /\((\/reservation\?[^)\s]+)\)/g;
const links = Array.from(PROMPT_SOURCE.matchAll(LINK_RE), (m) => m[1]);

const VALID_PLANS = new Set(["week", "weekend", "pack-48h", "flex-pro"]);
const VALID_PACKS = new Set(["standard", "confort", "premium"]);
const VALID_CARNETS = new Set(["carnet-10", "carnet-20", "carnet-40"]);
const VALID_OPTIONS = new Set(["serenite", "diable", "sangles-couverture"]);
const VALID_KEYS = new Set(["plan", "pack", "carnet", "options", "source", "vehicle"]);

describe("chatbot reservation links", () => {
  it("declares at least one /reservation deep link", () => {
    expect(links.length).toBeGreaterThan(0);
  });

  it("includes at least one link with &options=", () => {
    const withOptions = links.filter((l) => /[?&]options=/.test(l));
    expect(withOptions.length).toBeGreaterThan(0);
  });

  it("parses every link without throwing and uses only known params/values", () => {
    for (const href of links) {
      const url = new URL(href, "https://logiq.test");
      expect(url.pathname).toBe("/reservation");

      for (const [key, value] of url.searchParams.entries()) {
        expect(VALID_KEYS, `unknown query key "${key}" in ${href}`).toContain(key);

        if (key === "plan") {
          expect(VALID_PLANS, `bad plan in ${href}`).toContain(value);
        } else if (key === "pack") {
          expect(VALID_PACKS, `bad pack in ${href}`).toContain(value);
        } else if (key === "carnet") {
          expect(VALID_CARNETS, `bad carnet in ${href}`).toContain(value);
        } else if (key === "source") {
          expect(["pro", "direct"], `bad source in ${href}`).toContain(value);
        } else if (key === "options") {
          for (const opt of value.split(",")) {
            expect(VALID_OPTIONS, `bad option "${opt}" in ${href}`).toContain(opt);
          }
        }
      }
    }
  });

  it("contains no unescaped template-literal control chars (` or ${) inside the prompt strings", () => {
    // Pull out every backtick-delimited string and ensure none of its body
    // contains a raw backtick or ${ — that would break Deno parsing again.
    const stringBodies = Array.from(
      PROMPT_SOURCE.matchAll(/`([\s\S]*?)`/g),
      (m) => m[1]
    );
    for (const body of stringBodies) {
      expect(/`/.test(body)).toBe(false);
      expect(/\$\{/.test(body)).toBe(false);
    }
  });

  it("B2B carnet links always carry source=pro", () => {
    const carnetLinks = links.filter((l) => /[?&]carnet=/.test(l));
    expect(carnetLinks.length).toBeGreaterThan(0);
    for (const href of carnetLinks) {
      const url = new URL(href, "https://logiq.test");
      expect(url.searchParams.get("source")).toBe("pro");
    }
  });

  it("B2C pack links always carry plan=pack-48h", () => {
    const packLinks = links.filter((l) => /[?&]pack=/.test(l));
    expect(packLinks.length).toBeGreaterThan(0);
    for (const href of packLinks) {
      const url = new URL(href, "https://logiq.test");
      expect(url.searchParams.get("plan")).toBe("pack-48h");
    }
  });
});
