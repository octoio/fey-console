import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Character } from "@models/character.types";
import { StatType } from "@models/stat.types";
import type { Status } from "@models/status.types";
import { SHIPPED_JSON_DIR, hasShippedData, shippedTitle } from "@test-utils/shipped-data";

const load = <T>(path: string): T =>
  JSON.parse(readFileSync(join(SHIPPED_JSON_DIR ?? "", path), "utf8")).entity as T;

const files = (dir: string, suffix: string): string[] =>
  readdirSync(join(SHIPPED_JSON_DIR ?? "", dir)).filter((f) => f.endsWith(suffix));

describe("health modifier and statuses kept through death (fey-rs#356)", () => {
  it("the stat is one of the stat types", () => {
    expect(Object.values(StatType)).toContain("HealthModifier");
  });

  it.runIf(hasShippedData)(shippedTitle("every character sheet carries a health modifier"), () => {
    for (const file of files("character", ".character.json")) {
      const sheet = load<Character>(join("character", file)).stat_sheet;
      expect(sheet.health_modifier, file).toBe(1);
    }
  });

  it.runIf(hasShippedData)(shippedTitle("only a stat change status keeps through death"), () => {
    for (const file of files("status", ".status.json")) {
      const status = load<Status>(join("status", file));
      if (status.keeps_through_death) expect(status.mechanic.type, file).toBe("StatChange");
    }
  });
});
