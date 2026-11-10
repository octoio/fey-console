import { describe, it, expect, vi } from "vitest";
import { GroundCard } from "@components/stage-editor/ground-card";
import { createDefaultGroundEffect } from "@models/generator.types";
import { createDefaultGroundZone, GroundKind, GroundZone, ObstacleShape } from "@models/stage.types";
import { fireEvent, render, screen } from "@testing-library/react";

// The reference picker needs the entity store
vi.mock("@components/common/entity-reference-select", () => ({
  EntityReferenceSelect: ({ value }: { value?: string }) => (
    <input aria-label="reference key" readOnly value={value ?? ""} />
  ),
}));

// What an editor change saves: the JSON text, so a key left undefined counts as absent
const saved = (onChange: ReturnType<typeof vi.fn>): GroundZone[] =>
  JSON.parse(JSON.stringify(onChange.mock.calls.at(-1)?.[0]));

const zoneWithEffect = (): GroundZone => ({
  id: "pond",
  kind: GroundKind.Water,
  shape: ObstacleShape.Box,
  x: 3,
  z: -2,
  half_x: 4,
  half_z: 2,
  yaw: 30,
  effects: [createDefaultGroundEffect()],
});

describe("GroundCard", { timeout: 30000 }, () => {
  const renderCard = (ground: GroundZone[]) => {
    const onChange = vi.fn();
    render(<GroundCard ground={ground} onChange={onChange} />);
    return onChange;
  };

  it("adds a zone with the default circle of water", () => {
    const onChange = renderCard([]);
    fireEvent.click(screen.getByRole("button", { name: "Add Ground" }));
    expect(saved(onChange)).toEqual([{ kind: "Water", shape: "Circle", x: 0, z: 0, radius: 1 }]);
  });

  it("edits the kind and the size, and keeps the place on a shape change", () => {
    const onChange = renderCard([zoneWithEffect()]);
    fireEvent.change(screen.getByRole("spinbutton", { name: "ground 0 half_x" }), { target: { value: "6" } });
    expect(saved(onChange)[0]).toMatchObject({ half_x: 6, half_z: 2, yaw: 30 });
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "ground 0 shape" }));
    fireEvent.click(screen.getAllByText("Circle").at(-1)!);
    const circle = saved(onChange)[0];
    expect(circle).toMatchObject({ shape: "Circle", x: 3, z: -2, radius: 1, id: "pond" });
    expect(circle).not.toHaveProperty("half_x");
    expect(circle).not.toHaveProperty("yaw");
  });

  it("removes the id key when the id is cleared", () => {
    const onChange = renderCard([zoneWithEffect()]);
    const input = screen.getByRole("textbox", { name: "ground 0 id" });
    expect(input).toHaveValue("pond");
    fireEvent.change(input, { target: { value: "" } });
    expect(saved(onChange)[0]).not.toHaveProperty("id");
  });

  it("adds an effect to a zone", () => {
    const onChange = renderCard([createDefaultGroundZone()]);
    fireEvent.click(screen.getByRole("button", { name: "ground 0 add effect" }));
    expect(saved(onChange)[0].effects).toHaveLength(1);
  });

  it("drops the effects key when the last effect is removed", () => {
    const onChange = renderCard([zoneWithEffect()]);
    fireEvent.click(screen.getByRole("button", { name: "ground 0 effect 0 remove" }));
    expect(saved(onChange)[0]).not.toHaveProperty("effects");
  });

  it("removes a zone", () => {
    const onChange = renderCard([createDefaultGroundZone(), zoneWithEffect()]);
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    expect(saved(onChange)).toHaveLength(1);
    expect(saved(onChange)[0].id).toBe("pond");
  });
});
