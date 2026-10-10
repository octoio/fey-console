import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALL_FACTIONS,
  Faction,
  type CharacterEntityDefinition,
} from "@models/character.types";

describe("character.types faction", () => {
  it("lists the factions of the ATD schema", () => {
    expect(ALL_FACTIONS).toEqual([
      "Adventurers",
      "Wilds",
      "Slimes",
      "Crypt",
      "Neutral",
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

  it("is filled in every character of the game data checkout, when there is one", () => {
    const dir = join(
      __dirname,
      "../../../fey/Assets/StreamingAssets/json/character",
    );
    if (!existsSync(dir)) {
      return;
    }
    const files = readdirSync(dir).filter((f) => f.endsWith(".character.json"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const json = JSON.parse(readFileSync(join(dir, file), "utf8"));
      expect(ALL_FACTIONS, file).toContain(json.entity.faction);
    }
  });
});
