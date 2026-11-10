import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { CharacterForm } from "@components/properties-editor/character-form";
import { DifficultyForm } from "@components/properties-editor/difficulty-form";
import { withField } from "@components/properties-editor/fields";
import {
  PropertiesDefinition,
  PROPERTIES_TYPES,
  parsePropertiesFile,
} from "@components/properties-editor/properties-file";
import { QuestForm } from "@components/properties-editor/quest-form";
import { serializeDefinition } from "@components/stage-editor/stage-file-utils";
import { EntityType } from "@models/common.types";
import { SHIPPED_JSON_DIR, hasShippedData, shippedTitle } from "@test-utils/shipped-data";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@components/common/entity-reference-select", () => ({
  EntityReferenceSelect: () => null,
}));

// -0 and 0 are the same number in the data; the editor writes 0
const noNegativeZero = (_key: string, value: unknown) => (Object.is(value, -0) ? 0 : value);

// Content and key order, as the shipped text spells some numbers differently (1.0 for 1)
const canonical = (text: string) => JSON.stringify(JSON.parse(text, noNegativeZero));

type Entity = PropertiesDefinition["entity"];

// Holds the entity the way the editor does and reports the latest one
const mount = (definition: PropertiesDefinition) => {
  let latest = definition.entity;
  const Harness = () => {
    const [entity, setEntity] = useState<Entity>(definition.entity);
    const onChange = (next: Entity) => {
      latest = next;
      setEntity(next);
    };
    switch (definition.type) {
      case EntityType.QuestDifficulty:
        return <DifficultyForm entity={entity as never} onChange={onChange} />;
      case EntityType.Quest:
        return <QuestForm entity={entity as never} onChange={onChange} />;
      default:
        return <CharacterForm entity={entity as never} onChange={onChange} />;
    }
  };
  const view = render(<Harness />);
  return { latest: () => latest, unmount: view.unmount };
};

const flag = (name: string) => fireEvent.click(screen.getByRole("checkbox", { name }));
const number = (name: string, value: string) =>
  fireEvent.change(screen.getByLabelText(name), { target: { value } });

// One real edit through a control, then its undo, per type
const editAndUndo = (definition: PropertiesDefinition) => {
  const entity = definition.entity as unknown as Record<string, unknown>;
  if (definition.type === EntityType.Quest) {
    flag("is repeatable");
    flag("is repeatable");
    if (!("ends_run" in entity)) {
      flag("ends run");
      flag("ends run");
    }
  } else if (definition.type === EntityType.Character) {
    if ("level" in entity) {
      number("level", "99");
      number("level", String(entity.level));
    } else {
      number("level", "3");
      number("level", "");
    }
  } else if (entity.tier) {
    fireEvent.click(screen.getByRole("button", { name: "Add affix" }));
    const remove = screen.getAllByRole("button", { name: "Remove affix" });
    fireEvent.click(remove[remove.length - 1]);
  } else {
    fireEvent.click(screen.getByRole("switch", { name: "has tier" }));
    fireEvent.click(screen.getByRole("switch", { name: "has tier" }));
  }
};

// Every shipped Quest, QuestDifficulty and Character file: (a) the patch every form edit goes through,
// with nothing to patch, and (b) the form rendered, one real edit made through a control and undone,
// each must save equal to what was read. Fields no form shows are covered by being spread untouched.
describe.skipIf(!hasShippedData)(shippedTitle("Properties editor on shipped data"), () => {
  const dir = SHIPPED_JSON_DIR ?? "";
  const files = hasShippedData
    ? readdirSync(dir, { recursive: true, encoding: "utf8" })
        .filter((p) => p.endsWith(".json"))
        .sort()
        .map((path) => ({ path, text: readFileSync(join(dir, path), "utf8") }))
        .filter((f) => PROPERTIES_TYPES.includes(JSON.parse(f.text).type))
    : [];

  it("finds the shipped files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((f) => [f.path, f.text]))("%s: untouched patch saves as read", (_path, text) => {
    const definition = parsePropertiesFile(text);
    const patched = { ...definition, entity: withField(definition.entity, {}) };
    expect(canonical(serializeDefinition(patched))).toBe(canonical(text));
  });

  it.each(files.map((f) => [f.path, f.text]))("%s: an edit and its undo save as read", (_path, text) => {
    const definition = parsePropertiesFile(text);
    const view = mount(definition);
    editAndUndo(definition);
    expect(canonical(serializeDefinition({ ...definition, entity: view.latest() }))).toBe(canonical(text));
    view.unmount();
  });
});
