import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Character } from "@models/character.types";
import type { PersonalQuest } from "@models/personalquest.types";
import {
  SHIPPED_JSON_DIR,
  hasShippedData,
  shippedTitle,
} from "@test-utils/shipped-data";

const load = <T>(path: string): T =>
  JSON.parse(readFileSync(join(SHIPPED_JSON_DIR ?? "", path), "utf8"))
    .entity as T;

const questFiles = (): string[] =>
  readdirSync(join(SHIPPED_JSON_DIR ?? "", "personalquest")).filter((f) =>
    f.endsWith(".personalquest.json"),
  );

describe("personal quest data", () => {
  it.runIf(hasShippedData)(
    shippedTitle("every shipped quest has rewards the schema accepts"),
    () => {
      for (const file of questFiles()) {
        const quest = load<PersonalQuest>(join("personalquest", file));
        expect(quest.rewards.length, file).toBeGreaterThan(0);
        expect(quest.goal.count, file).toBeGreaterThanOrEqual(1);
        expect(quest.goal.growth ?? 0, file).toBeGreaterThanOrEqual(0);
        for (const r of quest.rewards) {
          expect(r.weight ?? 1, file).toBeGreaterThanOrEqual(1);
          if (r.kind === "WeaponCache")
            expect(r.weapons?.length, file).toBeGreaterThan(0);
          else expect(r.weapons, file).toBeUndefined();
          if (r.kind === "Gold") expect(r.gold, file).toBeGreaterThan(0);
          else expect(r.gold, file).toBeUndefined();
        }
      }
    },
  );

  it.runIf(hasShippedData)(
    shippedTitle("a character's quest pool names quests that exist"),
    () => {
      const adventurer = load<Character>("character/adventurer.character.json");
      expect(adventurer.personal_quests?.length).toBeGreaterThan(0);
      for (const ref of adventurer.personal_quests ?? [])
        expect(
          existsSync(
            join(
              SHIPPED_JSON_DIR ?? "",
              "personalquest",
              `${ref.key.toLowerCase()}.personalquest.json`,
            ),
          ),
          ref.key,
        ).toBe(true);
    },
  );

  it.runIf(hasShippedData)(
    shippedTitle(
      "a sworn quest has only pieces with a quality floor, and a floor is on pieces only",
    ),
    () => {
      const sworn = questFiles()
        .map((f) => load<PersonalQuest>(join("personalquest", f)))
        .filter((q) => q.oath);
      expect(sworn.map((q) => q.oath).sort()).toEqual(["NoDeath", "NoFlask"]);
      for (const quest of sworn)
        for (const r of quest.rewards) {
          expect(r.kind).toBe("Piece");
          expect(r.min_quality).toBeDefined();
        }
      for (const file of questFiles())
        for (const r of load<PersonalQuest>(join("personalquest", file))
          .rewards)
          if (r.kind !== "Piece") expect(r.min_quality, file).toBeUndefined();
    },
  );
});
