import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { GeneratorCard } from "@components/stage-editor/generator-card";
import { GroundCard } from "@components/stage-editor/ground-card";
import { serializeDefinition } from "@components/stage-editor/stage-file-utils";
import {
  createDefaultGeneratorSpec,
  createDefaultGroundEffect,
  createDefaultWaterRules,
  GeneratorSpec,
} from "@models/generator.types";
import { GroundZone } from "@models/stage.types";
import { SHIPPED_JSON_DIR, hasShippedData, shippedTitle } from "@test-utils/shipped-data";
import { fireEvent, render, screen } from "@testing-library/react";

// The reference picker needs the entity store
vi.mock("@components/common/entity-reference-select", () => ({
  EntityReferenceSelect: ({ value }: { value?: string }) => (
    <input aria-label="reference key" readOnly value={value ?? ""} />
  ),
}));

// What an editor change saves: the JSON text, so a key left undefined counts as absent
const saved = (onChange: ReturnType<typeof vi.fn>): GeneratorSpec =>
  JSON.parse(JSON.stringify(onChange.mock.calls.at(-1)?.[0]));

describe("GeneratorCard sewer and water", { timeout: 30000 }, () => {
  const renderSpec = (spec: GeneratorSpec) => {
    const onChange = vi.fn();
    render(<GeneratorCard spec={spec} prefabKind={() => undefined} onChange={onChange} onRemove={vi.fn()} />);
    return onChange;
  };

  it("adds the sewer record with one effect and does not touch water", () => {
    const onChange = renderSpec(createDefaultGeneratorSpec());
    fireEvent.click(screen.getByRole("button", { name: "Add sewer" }));
    const spec = saved(onChange);
    expect(spec.sewer?.effects).toHaveLength(1);
    expect(spec).not.toHaveProperty("water");
  });

  it("adds the water record", () => {
    const onChange = renderSpec(createDefaultGeneratorSpec());
    fireEvent.click(screen.getByRole("button", { name: "Add water" }));
    expect(saved(onChange).water?.effects).toHaveLength(1);
    expect(saved(onChange)).not.toHaveProperty("sewer");
  });

  it("edits an effect of the record", () => {
    const spec = createDefaultGeneratorSpec();
    spec.water = {
      effects: [{ ...createDefaultGroundEffect(), status: { ...createDefaultGroundEffect().status, key: "Wade" } }],
    };
    const onChange = renderSpec(spec);
    fireEvent.change(screen.getByRole("spinbutton", { name: "water effect 0 magnitude" }), { target: { value: "0.3" } });
    expect(saved(onChange).water?.effects[0]).toMatchObject({ magnitude: 0.3, status: { key: "Wade" } });
  });

  it("adds a second effect, and the last effect cannot be removed", () => {
    const spec = createDefaultGeneratorSpec();
    spec.sewer = createDefaultWaterRules();
    const onChange = renderSpec(spec);
    expect(screen.queryByRole("button", { name: "sewer effect 0 remove" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "sewer add effect" }));
    expect(saved(onChange).sewer?.effects).toHaveLength(2);
  });

  it("removes the whole record and the key with it", () => {
    const spec = createDefaultGeneratorSpec();
    spec.sewer = createDefaultWaterRules();
    const onChange = renderSpec(spec);
    fireEvent.click(screen.getByRole("button", { name: "Remove sewer" }));
    expect(saved(onChange)).not.toHaveProperty("sewer");
  });
});

// Opening a shipped stage in the new controls and putting back what was taken leaves it as it was
const stageEntity = (name: string) =>
  JSON.parse(readFileSync(join(SHIPPED_JSON_DIR ?? "", "stage", `${name}.stage.json`), "utf8"));

describe.skipIf(!hasShippedData)(shippedTitle("shipped stages through the ground, sewer and water controls"), () => {
  const reSaved = (entity: { ground?: GroundZone[]; generator?: GeneratorSpec }) => {
    let latest = entity;
    const Host = () => {
      const [state, setState] = useState(entity);
      latest = state;
      return (
        <>
          <GroundCard ground={state.ground ?? []} onChange={(ground) => setState({ ...state, ground: ground.length ? ground : undefined })} />
          {state.generator && (
            <GeneratorCard
              spec={state.generator}
              prefabKind={() => undefined}
              onChange={(generator) => setState({ ...state, generator })}
              onRemove={vi.fn()}
            />
          )}
        </>
      );
    };
    render(<Host />);
    return () => latest;
  };

  it("The Warrens: add an effect to the sewer, remove it again", () => {
    const original = stageEntity("thewarrens").entity;
    expect(original.generator.sewer.effects.length).toBeGreaterThan(0);
    const latest = reSaved(structuredClone(original));
    const count = original.generator.sewer.effects.length;
    fireEvent.click(screen.getByRole("button", { name: "sewer add effect" }));
    fireEvent.click(screen.getByRole("button", { name: `sewer effect ${count} remove` }));
    expect(serializeDefinition(latest())).toBe(serializeDefinition(original));
  });

  it("The Forest: add an effect to the water, remove it again", () => {
    const original = stageEntity("theforest").entity;
    const latest = reSaved(structuredClone(original));
    const count = original.generator.water.effects.length;
    fireEvent.click(screen.getByRole("button", { name: "water add effect" }));
    fireEvent.click(screen.getByRole("button", { name: `water effect ${count} remove` }));
    expect(serializeDefinition(latest())).toBe(serializeDefinition(original));
  });

  it("Blackwater Mire: add a zone, remove it; add an effect to a zone, remove it; same for water", () => {
    const original = stageEntity("blackwatermire").entity;
    expect(original.ground.length).toBeGreaterThan(1);
    const latest = reSaved(structuredClone(original));
    fireEvent.click(screen.getByRole("button", { name: "Add Ground" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" }).at(original.ground.length)!);
    // a zone with no effects: add one, remove it, the effects key goes again
    const bare = original.ground.findIndex((z: GroundZone) => !z.effects);
    fireEvent.click(screen.getByRole("button", { name: `ground ${bare} add effect` }));
    fireEvent.click(screen.getByRole("button", { name: `ground ${bare} effect 0 remove` }));
    const count = original.generator.water.effects.length;
    fireEvent.click(screen.getByRole("button", { name: "water add effect" }));
    fireEvent.click(screen.getByRole("button", { name: `water effect ${count} remove` }));
    expect(serializeDefinition(latest())).toBe(serializeDefinition(original));
  });
});
