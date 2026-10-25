import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_ANCHOR_SLOTS } from "@models/generator.types";

// The sibling fey-data checkout, when there is one
const ATD = join(__dirname, "../../../fey-data/lib/data/generator.atd");

describe.skipIf(!existsSync(ATD))("anchor slots", () => {
  it("has every anchor_slot variant of generator.atd in the console enum", () => {
    const atd = readFileSync(ATD, "utf8");
    const block = /type anchor_slot =\s*\[([^\]]*)\]/.exec(atd);
    expect(block).not.toBeNull();
    const withoutComments = block![1].replace(/\(\*[\s\S]*?\*\)/g, "");
    const variants = [...withoutComments.matchAll(/\b([A-Z]\w*)\b/g)].map((m) => m[1]);
    expect(variants.length).toBeGreaterThan(0);
    for (const v of variants) {
      expect(ALL_ANCHOR_SLOTS).toContain(v);
    }
  });
});
