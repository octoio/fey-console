import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALL_FACTIONS,
  Faction,
  type CharacterEntityDefinition,
} from "@models/character.types";
import { SHIPPED_JSON_DIR, hasShippedData, shippedTitle } from "@test-utils/shipped-data";

describe("character.types faction", () => {
  it("lists the factions of the ATD schema", () => {
    expect(ALL_FACTIONS).toEqual([
      "Adventurers",
      "Wilds",
      "Slimes",
      "Crypt",
      "Neutral",
      "Folk",
    ]);
  });

  it("is optional on a character and independent of anything a controller does", () => {
    const withFaction: Pick<CharacterEntityDefinition["entity"], "faction"> = {
      faction: Faction.Wilds,
    };
    const without: Pick<CharacterEntityDefinition["entity"], "faction"> = {};
    expect(withFaction.faction).toBe("Wilds");
    expect(without.faction).toBeUndefined();
  });

  it.skipIf(!hasShippedData)(shippedTitle("is filled in every character of the game data checkout"), () => {
    const dir = join(SHIPPED_JSON_DIR!, "character");
    const files = readdirSync(dir).filter((f) => f.endsWith(".character.json"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const json = JSON.parse(readFileSync(join(dir, file), "utf8"));
      expect(ALL_FACTIONS, file).toContain(json.entity.faction);
    }
  });
});

describe("character.types body_radius", () => {
  it("is optional: absent means the type's base radius times the variant scale", () => {
    const stated: Pick<CharacterEntityDefinition["entity"], "body_radius"> = { body_radius: 0.6 };
    const absent: Pick<CharacterEntityDefinition["entity"], "body_radius"> = {};
    expect(stated.body_radius).toBe(0.6);
    expect(absent.body_radius).toBeUndefined();
  });

  it.skipIf(!hasShippedData)(shippedTitle("is at least 0.1 where the game data states it, the Plague Rat states 0.6, the barn doors 2 (#408), the sheep 0.5 and the hen 0.3 (#438)"), () => {
    const dir = join(SHIPPED_JSON_DIR!, "character");
    const stated: Record<string, number> = {};
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".character.json"))) {
      const json = JSON.parse(readFileSync(join(dir, file), "utf8"));
      if (json.entity.body_radius !== undefined) {
        expect(json.entity.body_radius, file).toBeGreaterThanOrEqual(0.1);
        stated[json.key] = json.entity.body_radius;
      }
    }
    expect(stated).toEqual({ BarnDoors: 2, Hen: 0.3, PlagueRat: 0.6, Sheep: 0.5 });
  });
});
