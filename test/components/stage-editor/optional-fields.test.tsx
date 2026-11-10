import { describe, it, expect, vi } from "vitest";
import { AnchorCard } from "@components/stage-editor/anchor-card";
import { GateCard } from "@components/stage-editor/gate-card";
import { GeneratorCard } from "@components/stage-editor/generator-card";
import { createAnchorDefinition } from "@components/stage-editor/stage-file-utils";
import { AnchorType, createDefaultAnchor } from "@models/anchor.types";
import {
  AnchorSlot,
  createDefaultGeneratorSpec,
  GeneratorKind,
  GeneratorSpec,
} from "@models/generator.types";
import { createDefaultGate, Gate, GateOpening } from "@models/stage.types";
import { fireEvent, render, screen } from "@testing-library/react";

// The reference picker needs the entity store: a stub that shows the key and can clear it
vi.mock("@components/common/entity-reference-select", () => ({
  EntityReferenceSelect: ({ value, onChange }: { value?: string; onChange: (r: { key: string }) => void }) => (
    <>
      <input aria-label="reference key" readOnly value={value ?? ""} />
      <button onClick={() => onChange({ key: "" })}>clear reference</button>
      <button onClick={() => onChange({ key: "NewLever" })}>set reference</button>
    </>
  ),
}));

// What an editor change saves: the JSON text, so a key left undefined counts as absent
const saved = (onChange: ReturnType<typeof vi.fn>) =>
  JSON.parse(JSON.stringify(onChange.mock.calls.at(-1)?.[0]));

describe("GeneratorCard maze", { timeout: 30000 }, () => {
  const renderSpec = (spec: GeneratorSpec) => {
    const onChange = vi.fn();
    render(<GeneratorCard spec={spec} prefabKind={() => undefined} onChange={onChange} onRemove={vi.fn()} />);
    return onChange;
  };

  it("shows unchecked when absent and checking writes maze: true", () => {
    const onChange = renderSpec(createDefaultGeneratorSpec());
    const box = screen.getByRole("checkbox", { name: "Maze" });
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(saved(onChange).connections.maze).toBe(true);
  });

  it("shows checked and unchecking removes the key", () => {
    const spec = createDefaultGeneratorSpec();
    spec.connections.maze = true;
    const onChange = renderSpec(spec);
    const box = screen.getByRole("checkbox", { name: "Maze" });
    expect(box).toBeChecked();
    fireEvent.click(box);
    expect("maze" in saved(onChange).connections).toBe(false);
  });

  it("shows a Swamp generator (the kind list is checked against the ATD in atd-variants.test.ts)", () => {
    renderSpec(createDefaultGeneratorSpec(GeneratorKind.Swamp));
    expect(screen.getByText("Generator (Swamp, version 13)")).toBeInTheDocument();
    expect(screen.getByText("Swamp", { selector: ".ant-select-selection-item" })).toBeInTheDocument();
  });
});

describe("AnchorCard binding min count", { timeout: 30000 }, () => {
  const template = (min_count?: number) =>
    createAnchorDefinition("Pack", {
      ...createDefaultAnchor(AnchorType.SpawnPoint),
      binding: { slot: AnchorSlot.PackSpawn, every: true, ...(min_count ? { min_count } : {}) },
    });
  const name = "Pack binding min count";

  it("shows the value, writes it and removes the key when cleared", () => {
    const onChange = vi.fn();
    render(<AnchorCard definition={template(3)} isNew={false} onChange={onChange} onRemove={vi.fn()} />);
    const input = screen.getByRole("spinbutton", { name }) as HTMLInputElement;
    expect(input.value).toBe("3");
    fireEvent.change(input, { target: { value: "5" } });
    expect(saved(onChange).entity.binding).toEqual({ slot: "PackSpawn", every: true, min_count: 5 });
    fireEvent.change(input, { target: { value: "" } });
    expect(saved(onChange).entity.binding).toEqual({ slot: "PackSpawn", every: true });
  });

  it("is only there for a template (every)", () => {
    const single = createAnchorDefinition("P", {
      ...createDefaultAnchor(AnchorType.SpawnPoint),
      binding: { slot: AnchorSlot.PackSpawn },
    });
    render(<AnchorCard definition={single} isNew={false} onChange={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.queryByRole("spinbutton", { name: "P binding min count" })).toBeNull();
  });
});

describe("GateCard", { timeout: 30000 }, () => {
  const full: Gate = {
    ...createDefaultGate(),
    id: "ShortcutGate",
    opening: GateOpening.FromSide,
    starts_open: true,
    side_x: 1.5,
    side_z: -2,
    drains: ["Pond"],
  };
  const renderGate = (gate: Gate) => {
    const onChange = vi.fn();
    render(<GateCard index={0} gate={gate} groundIds={["Pond"]} onChange={onChange} onRemove={vi.fn()} />);
    return onChange;
  };
  const num = (name: string) => screen.getByRole("spinbutton", { name }) as HTMLInputElement;

  it("shows every value read", () => {
    renderGate(full);
    expect((screen.getByRole("textbox", { name: "gate 0 id" }) as HTMLInputElement).value).toBe("ShortcutGate");
    expect(screen.getByRole("checkbox", { name: "gate 0 starts open" })).toBeChecked();
    expect(num("gate 0 side_x").value).toBe("1.5");
    expect(num("gate 0 side_z").value).toBe("-2");
    expect(screen.getByText("FromSide", { selector: ".ant-select-selection-item" })).toBeInTheDocument();
    expect(screen.getByText("Pond", { selector: ".ant-select-selection-item-content" })).toBeInTheDocument();
    expect(num("gate 0 obstacle half_x")).toBeInTheDocument();
  });

  it("writes the id, the sides and starts open, and clearing removes the keys", () => {
    const onChange = renderGate(full);
    fireEvent.change(screen.getByRole("textbox", { name: "gate 0 id" }), { target: { value: "Other" } });
    expect(saved(onChange).id).toBe("Other");
    fireEvent.change(num("gate 0 side_x"), { target: { value: "4" } });
    expect(saved(onChange).side_x).toBe(4);
    for (const field of ["side_x", "side_z"]) {
      fireEvent.change(num(`gate 0 ${field}`), { target: { value: "" } });
      expect(field in saved(onChange)).toBe(false);
    }
    fireEvent.click(screen.getByRole("checkbox", { name: "gate 0 starts open" }));
    expect("starts_open" in saved(onChange)).toBe(false);
  });

  it("checking starts open writes true and a fresh gate has no optional key", () => {
    const fresh = createDefaultGate();
    expect(Object.keys(fresh).sort()).toEqual(["id", "obstacle", "opening"]);
    const onChange = renderGate(fresh);
    fireEvent.click(screen.getByRole("checkbox", { name: "gate 0 starts open" }));
    expect(saved(onChange).starts_open).toBe(true);
  });

  it("writes the drains and clearing the last one removes the key", () => {
    const onChange = renderGate({ ...full, drains: undefined });
    const input = screen.getByRole("combobox", { name: "gate 0 drains" });
    fireEvent.change(input, { target: { value: "Pond" } });
    fireEvent.keyDown(input, { key: "Enter", keyCode: 13 });
    expect(saved(onChange).drains).toEqual(["Pond"]);
  });

  it("shows the lever read and clearing it removes the key", () => {
    const lever = { id: "", key: "ShortcutLever", owner: "Octoio", type: "Anchor", version: 1 };
    const onChange = renderGate({ ...full, lever } as Gate);
    expect(screen.getByDisplayValue("ShortcutLever")).toBeInTheDocument();
    fireEvent.click(screen.getByText("clear reference"));
    expect("lever" in saved(onChange)).toBe(false);
    fireEvent.click(screen.getByText("set reference"));
    expect(saved(onChange).lever.key).toBe("NewLever");
  });

  it("edits the obstacle of the gate", () => {
    const onChange = renderGate(full);
    fireEvent.change(num("gate 0 obstacle half_x"), { target: { value: "3" } });
    expect(saved(onChange).obstacle.half_x).toBe(3);
    expect(saved(onChange).id).toBe("ShortcutGate");
  });
});
