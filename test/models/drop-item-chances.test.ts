import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DropType, type DropTable } from "@models/drop.types";
import { SHIPPED_JSON_DIR, hasShippedData, shippedTitle } from "@test-utils/shipped-data";

const tables = (): { file: string; table: DropTable }[] =>
  readdirSync(join(SHIPPED_JSON_DIR ?? "", "drop"))
    .filter((f) => f.endsWith(".droptable.json"))
    .map((file) => ({
      file,
      table: JSON.parse(readFileSync(join(SHIPPED_JSON_DIR ?? "", "drop", file), "utf8"))
        .entity as DropTable,
    }));

describe("item chances per rank and per-player guarantees (fey-rs#369)", () => {
  it("the model carries a chance of equipment and weapons for each rank", () => {
    const table: DropTable = {
      metadata: { title: "t", description: "d" },
      equipment_drops: [],
      weapon_drops: [],
      skill_book_drops: [],
      item_chances: {
        normal: { equipment: 0.02, weapon: 0.01 },
        elite: { equipment: 0.17, weapon: 0.08 },
        boss: { equipment: 0.17, weapon: 0.08 },
      },
    };
    expect(JSON.parse(JSON.stringify(table))).toEqual(table);
  });

  it.runIf(hasShippedData)(
    shippedTitle("a table with equipment or weapon entries has item chances in 0..1"),
    () => {
      for (const { file, table } of tables()) {
        const hasGear = table.equipment_drops.length + table.weapon_drops.length > 0;
        if (!hasGear) continue;
        const chances = table.item_chances;
        expect(chances, file).toBeDefined();
        for (const rule of [chances!.normal, chances!.elite, chances!.boss]) {
          for (const p of [rule.equipment, rule.weapon]) {
            expect(p, file).toBeGreaterThanOrEqual(0);
            expect(p, file).toBeLessThanOrEqual(1);
          }
        }
      }
    },
  );

  it.runIf(hasShippedData)(
    shippedTitle("a per-player guarantee is about equipment or a weapon"),
    () => {
      for (const { file, table } of tables()) {
        for (const g of table.guarantees ?? []) {
          if (g.per_player) {
            expect([DropType.Equipment, DropType.Weapon], file).toContain(g.kind);
          }
        }
      }
    },
  );
});
