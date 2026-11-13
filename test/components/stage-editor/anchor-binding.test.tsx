import { describe, it, expect, vi } from "vitest";
import { AnchorCard } from "@components/stage-editor/anchor-card";
import { createAnchorDefinition } from "@components/stage-editor/stage-file-utils";
import { AnchorType, createDefaultAnchor } from "@models/anchor.types";
import { AnchorSlot } from "@models/generator.types";
import { fireEvent, render, screen } from "@testing-library/react";

// The reference picker needs the entity store: a stub that shows the key and can set it
vi.mock("@components/common/entity-reference-select", () => ({
  EntityReferenceSelect: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange: (r: { key: string; type: string; owner: string; version: number; id: string }) => void;
  }) => (
    <>
      <input aria-label="reference key" readOnly value={value ?? ""} />
      <button
        onClick={() =>
          onChange({
            id: "Octoio:Equipment:RagCape:1",
            key: "RagCape",
            owner: "Octoio",
            type: "Equipment",
            version: 1,
          })
        }
      >
        set reference
      </button>
    </>
  ),
}));

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

describe("AnchorCard healing shrine", { timeout: 30000 }, () => {
  const saved = createAnchorDefinition(
    "Shrine",
    JSON.parse(
      JSON.stringify({
        type: "HealingShrine",
        metadata: { title: "Healing Shrine", description: "" },
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        model: "HShrine",
        price: 20,
        binding: { slot: "Healing", every: true },
      }),
    ),
  );

  it("round-trips through the editor model without dropping a field", () => {
    expect(JSON.parse(JSON.stringify(saved)).entity).toEqual(saved.entity);
    expect(saved.entity.type).toBe(AnchorType.HealingShrine);
  });

  it("edits the price and keeps the Healing binding", () => {
    const onChange = vi.fn();
    render(<AnchorCard definition={saved} isNew={false} onChange={onChange} onRemove={vi.fn()} />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "Shrine shrine price" }), {
      target: { value: "35" },
    });
    const entity = onChange.mock.calls.at(-1)?.[0].entity;
    expect(entity.price).toBe(35);
    expect(entity.binding).toEqual({ slot: AnchorSlot.Healing, every: true });
  });
});

describe("AnchorCard merchant", { timeout: 30000 }, () => {
  const saved = createAnchorDefinition(
    "Merchant",
    JSON.parse(
      JSON.stringify({
        type: "Merchant",
        metadata: { title: "Merchant", description: "" },
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        model: "VCart",
        outfit: [
          {
            id: "Octoio:Equipment:ReapersCowl:1",
            key: "ReapersCowl",
            owner: "Octoio",
            type: "Equipment",
            version: 1,
          },
        ],
        prices: { common: 15, uncommon: 30, rare: 70, epic: 150, legendary: 300 },
        sell_fraction: 0.2,
        commission_price: 25,
        stock: {
          size: 5,
          rarity: { common: 60, uncommon: 30, rare: 10, epic: 0, legendary: 0 },
          kinds: { equipment: 1, weapon: 1 },
        },
        showcase: {
          rarity: { common: 0, uncommon: 0, rare: 80, epic: 20, legendary: 0 },
        },
      }),
    ),
  );

  it("round-trips through the editor model without dropping a field", () => {
    expect(JSON.parse(JSON.stringify(saved)).entity).toEqual(saved.entity);
    expect(saved.entity.type).toBe(AnchorType.Merchant);
  });

  it("edits one price and leaves the rest of the chart alone", () => {
    const onChange = vi.fn();
    render(<AnchorCard definition={saved} isNew={false} onChange={onChange} onRemove={vi.fn()} />);
    fireEvent.change(screen.getByRole("spinbutton", { name: "price rare" }), {
      target: { value: "80" },
    });
    const entity = onChange.mock.calls.at(-1)?.[0].entity;
    expect(entity.prices).toEqual({ common: 15, uncommon: 30, rare: 80, epic: 150, legendary: 300 });
    expect(entity.stock.size).toBe(5);
  });

  it("lists the outfit and adds a piece to it", () => {
    const onChange = vi.fn();
    render(<AnchorCard definition={saved} isNew={false} onChange={onChange} onRemove={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: "reference key" })).toHaveValue("ReapersCowl");
    fireEvent.click(screen.getByRole("button", { name: /add outfit piece/i }));
    const entity = onChange.mock.calls.at(-1)?.[0].entity;
    expect(entity.outfit.map((p: { key: string }) => p.key)).toEqual(["ReapersCowl", ""]);
    expect(entity.outfit[1].type).toBe("Equipment");
  });

  it("picks a piece of the outfit and removes another", () => {
    const onChange = vi.fn();
    render(<AnchorCard definition={saved} isNew={false} onChange={onChange} onRemove={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "set reference" }));
    expect(onChange.mock.calls.at(-1)?.[0].entity.outfit.map((p: { key: string }) => p.key)).toEqual([
      "RagCape",
    ]);
    fireEvent.click(screen.getByRole("button", { name: /remove outfit piece/i }));
    expect(onChange.mock.calls.at(-1)?.[0].entity.outfit).toEqual([]);
  });

  it("creates a merchant from the type switch with a full default chart", () => {
    const anchor = createDefaultAnchor(AnchorType.Merchant);
    expect(anchor).toMatchObject({ type: "Merchant", sell_fraction: 0.2, outfit: [] });
  });
});

describe("AnchorCard chest", { timeout: 30000 }, () => {
  const chest = createAnchorDefinition("Chest", {
    ...createDefaultAnchor(AnchorType.Chest),
    binding: { slot: AnchorSlot.Chest, ordinal: 0 },
  });

  it("creates a chest with an Uncommon floor and an empty guard", () => {
    expect(createDefaultAnchor(AnchorType.Chest)).toMatchObject({
      type: "Chest",
      model: "",
      min_quality: "Uncommon",
      guard: { type: "Anchor", key: "" },
    });
  });

  it("edits the model and keeps the binding", () => {
    const onChange = vi.fn();
    render(<AnchorCard definition={chest} isNew={false} onChange={onChange} onRemove={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox", { name: "chest model" }), {
      target: { value: "VChest" },
    });
    const entity = onChange.mock.calls.at(-1)?.[0].entity;
    expect(entity.model).toBe("VChest");
    expect(entity.binding).toEqual({ slot: AnchorSlot.Chest, ordinal: 0 });
  });

  it("sets the guard from the reference picker", () => {
    const onChange = vi.fn();
    render(<AnchorCard definition={chest} isNew={false} onChange={onChange} onRemove={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "set reference" }));
    expect(onChange.mock.calls.at(-1)?.[0].entity.guard.key).toBe("RagCape");
  });

  it("offers only Uncommon, Rare and Epic as the floor", () => {
    render(<AnchorCard definition={chest} isNew={false} onChange={vi.fn()} onRemove={vi.fn()} />);
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "chest min quality" }));
    for (const quality of ["Rare", "Epic"]) {
      expect(screen.getAllByText(quality).length).toBeGreaterThan(0);
    }
    expect(screen.queryByText("Legendary")).toBeNull();
    expect(screen.queryByText("Common")).toBeNull();
  });
});
