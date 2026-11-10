import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { PROPERTIES_TYPES, parsePropertiesFile } from "@components/properties-editor/properties-file";
import { serializeDefinition } from "@components/stage-editor/stage-file-utils";
import { SHIPPED_JSON_DIR, hasShippedData, shippedTitle } from "@test-utils/shipped-data";

// -0 and 0 are the same number in the data; the editor writes 0
const noNegativeZero = (_key: string, value: unknown) => (Object.is(value, -0) ? 0 : value);

// Every shipped Quest, QuestDifficulty and Character file goes through the Properties editor's load
// and save and must come back with the same content and the same key order (the shipped text spells
// some numbers differently, 1.0 for 1, which no JSON writer keeps).
describe.skipIf(!hasShippedData)(shippedTitle("Properties editor on shipped data"), () => {
  it("opens and saves every file with the same content and key order", () => {
    const dir = SHIPPED_JSON_DIR ?? "";
    const damaged: string[] = [];
    let checked = 0;
    for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) {
      if (!path.endsWith(".json")) continue;
      const text = readFileSync(join(dir, path), "utf8");
      if (!PROPERTIES_TYPES.includes(JSON.parse(text).type)) continue;
      checked++;
      const read = JSON.stringify(JSON.parse(text, noNegativeZero));
      const written = JSON.stringify(JSON.parse(serializeDefinition(parsePropertiesFile(text)), noNegativeZero));
      if (read !== written) damaged.push(path);
    }
    expect(checked).toBeGreaterThan(0);
    expect(damaged).toEqual([]);
  });
});
