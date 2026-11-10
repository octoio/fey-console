import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ALL_ANCHOR_SLOTS } from "@models/generator.types";
import { GENERATOR_ATD, generatorAtdTitle, hasGeneratorAtd } from "@test-utils/shipped-data";

describe.skipIf(!hasGeneratorAtd)("anchor slots", () => {
  it(generatorAtdTitle("has every anchor_slot variant of generator.atd in the console enum"), () => {
    const atd = readFileSync(GENERATOR_ATD!, "utf8");
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
