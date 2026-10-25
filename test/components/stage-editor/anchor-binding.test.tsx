import { describe, it, expect, vi } from "vitest";
import { AnchorCard } from "@components/stage-editor/anchor-card";
import { createAnchorDefinition } from "@components/stage-editor/stage-file-utils";
import { AnchorType, createDefaultAnchor } from "@models/anchor.types";
import { AnchorSlot } from "@models/generator.types";
import { fireEvent, render, screen } from "@testing-library/react";

describe("AnchorCard binding", { timeout: 30000 }, () => {
  const bound = createAnchorDefinition("Pack", {
    ...createDefaultAnchor(AnchorType.SpawnPoint),
    binding: { slot: AnchorSlot.PackSpawn },
  });

  it("edits the ordinal and keeps the slot", () => {
    const onChange = vi.fn();
    render(<AnchorCard definition={bound} isNew={false} onChange={onChange} onRemove={vi.fn()} />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Pack binding ordinal" }), {
      target: { value: "2" },
    });
    expect(onChange.mock.calls.at(-1)?.[0].entity.binding).toEqual({
      slot: "PackSpawn",
      ordinal: 2,
    });
  });

  it("has no ordinal input without a binding", () => {
    const plain = createAnchorDefinition("P", createDefaultAnchor(AnchorType.Portal));
    render(<AnchorCard definition={plain} isNew={false} onChange={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.queryByRole("spinbutton", { name: "P binding ordinal" })).toBeNull();
  });
});

describe("AnchorCard lamp post", { timeout: 30000 }, () => {
  // Shape of a saved lamp post anchor with a Marker template binding
  const saved = createAnchorDefinition(
    "Lamp",
    JSON.parse(
      JSON.stringify({
        type: "LampPost",
        metadata: { title: "Lamp Post", description: "" },
        transform: {
          position: { x: 0.5, y: 0, z: -1.5 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        model: "HStreetlamp",
        binding: { slot: "Marker", every: true },
      }),
    ),
  );

  it("round-trips through the editor model without dropping a field", () => {
    expect(JSON.parse(JSON.stringify(saved)).entity).toEqual(saved.entity);
    expect(saved.entity.type).toBe(AnchorType.LampPost);
  });

  it("edits the model and keeps the Marker binding", () => {
    const onChange = vi.fn();
    render(<AnchorCard definition={saved} isNew={false} onChange={onChange} onRemove={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Lamp lamp post model" }), {
      target: { value: "Other" },
    });
    const entity = onChange.mock.calls.at(-1)?.[0].entity;
    expect(entity.model).toBe("Other");
    expect(entity.binding).toEqual({ slot: AnchorSlot.Marker, every: true });
  });

  it("creates a lamp post from the type switch with its model field", () => {
    const anchor = createDefaultAnchor(AnchorType.LampPost);
    expect(anchor).toMatchObject({ type: "LampPost", model: "" });
  });
});
