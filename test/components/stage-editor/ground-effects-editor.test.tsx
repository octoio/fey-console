import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { GroundEffectsEditor } from "@components/stage-editor/ground-effects-editor";
import { createDefaultGroundEffect, GroundEffect } from "@models/generator.types";
import { fireEvent, render, screen } from "@testing-library/react";

// The reference picker needs the entity store: a stub that can set and clear the key
vi.mock("@components/common/entity-reference-select", () => ({
  EntityReferenceSelect: ({ value, onChange }: { value?: string; onChange: (r: { key: string }) => void }) => (
    <>
      <input aria-label="reference key" readOnly value={value ?? ""} />
      <button onClick={() => onChange({ key: "Poison" })}>set reference</button>
    </>
  ),
}));

// What an editor change saves: the JSON text, so a key left undefined counts as absent
const saved = (onChange: ReturnType<typeof vi.fn>): GroundEffect[] =>
  JSON.parse(JSON.stringify(onChange.mock.calls.at(-1)?.[0]));

const withPathCost = (): GroundEffect => ({
  ...createDefaultGroundEffect(),
  durations: [{ type: "Chrono" as never, value: 5 }],
  path_cost: 6,
});

describe("GroundEffectsEditor", { timeout: 30000 }, () => {
  const renderEditor = (effects: GroundEffect[], minCount?: number) => {
    const onChange = vi.fn();
    render(<GroundEffectsEditor label="zone" effects={effects} onChange={onChange} minCount={minCount} />);
    return onChange;
  };

  it("adds an effect with the defaults", () => {
    const onChange = renderEditor([]);
    fireEvent.click(screen.getByRole("button", { name: "zone add effect" }));
    expect(saved(onChange)).toEqual([
      {
        status: { id: "", key: "", owner: "Octoio", type: "Status", version: 1 },
        who: "Everyone",
        period: 1,
        durations: [],
        magnitude: 0,
      },
    ]);
  });

  it("edits status, period, magnitude and duration", () => {
    const onChange = renderEditor([withPathCost()]);
    fireEvent.click(screen.getByText("set reference"));
    expect(saved(onChange)[0].status.key).toBe("Poison");
    fireEvent.change(screen.getByRole("spinbutton", { name: "zone effect 0 period" }), { target: { value: "2" } });
    expect(saved(onChange)[0].period).toBe(2);
    fireEvent.change(screen.getByRole("spinbutton", { name: "zone effect 0 magnitude" }), { target: { value: "-0.5" } });
    expect(saved(onChange)[0].magnitude).toBe(-0.5);
    fireEvent.change(screen.getByRole("spinbutton", { name: "zone effect 0 duration 0 value" }), { target: { value: "8" } });
    expect(saved(onChange)[0].durations).toEqual([{ type: "Chrono", value: 8 }]);
  });

  it("adds and removes a duration", () => {
    const onChange = renderEditor([withPathCost()]);
    fireEvent.click(screen.getByRole("button", { name: "zone effect 0 add duration" }));
    expect(saved(onChange)[0].durations).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "zone effect 0 duration 0 remove" }));
    expect(saved(onChange)[0].durations).toEqual([]);
  });

  it("writes path cost and removes the key when cleared", () => {
    const onChange = renderEditor([withPathCost()]);
    const input = screen.getByRole("spinbutton", { name: "zone effect 0 path cost" }) as HTMLInputElement;
    expect(input.value).toBe("6");
    fireEvent.change(input, { target: { value: "" } });
    expect("path_cost" in saved(onChange)[0]).toBe(false);
  });

  it("removes an effect", () => {
    const onChange = renderEditor([createDefaultGroundEffect(), withPathCost()]);
    fireEvent.click(screen.getByRole("button", { name: "zone effect 0 remove" }));
    expect(saved(onChange)).toHaveLength(1);
    expect(saved(onChange)[0].path_cost).toBe(6);
  });

  it("refuses to remove below the minimum count", () => {
    renderEditor([createDefaultGroundEffect()], 1);
    expect(screen.queryByRole("button", { name: "zone effect 0 remove" })).toBeNull();
  });

  it("keeps edits across renders (controlled by the parent)", () => {
    const Host = () => {
      const [effects, setEffects] = useState<GroundEffect[]>([]);
      return <GroundEffectsEditor label="zone" effects={effects} onChange={setEffects} />;
    };
    render(<Host />);
    fireEvent.click(screen.getByRole("button", { name: "zone add effect" }));
    expect(screen.getByRole("spinbutton", { name: "zone effect 0 period" })).toBeInTheDocument();
  });
});
