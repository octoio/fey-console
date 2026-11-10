import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_GENERATOR_KINDS } from "@models/generator.types";
import { ALL_GATE_OPENINGS } from "@models/stage.types";
import { GENERATOR_ATD, generatorAtdTitle, hasGeneratorAtd } from "@test-utils/shipped-data";

// The variants of `type <name> = [ A | B ]` in an ATD file, comments left out
const variants = (file: string, name: string): string[] => {
  const block = new RegExp(`type ${name} =\\s*\\[([^\\]]*)\\]`).exec(readFileSync(file, "utf8"));
  expect(block).not.toBeNull();
  const code = block![1].replace(/\(\*[\s\S]*?\*\)/g, "");
  return [...code.matchAll(/\b([A-Z]\w*)\b/g)].map((m) => m[1]);
};

describe.skipIf(!hasGeneratorAtd)("enums offer exactly the ATD variants", () => {
  it(generatorAtdTitle("generator_kind (Crypt, Forest, Swamp)"), () => {
    expect([...ALL_GENERATOR_KINDS].sort()).toEqual(variants(GENERATOR_ATD!, "generator_kind").sort());
  });

  it(generatorAtdTitle("gate_opening"), () => {
    const stageAtd = join(dirname(GENERATOR_ATD!), "stage.atd");
    expect([...ALL_GATE_OPENINGS].sort()).toEqual(variants(stageAtd, "gate_opening").sort());
  });
});
