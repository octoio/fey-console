import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { GeneratorCard } from "@components/stage-editor/generator-card";
import { GeneratorSpec } from "@models/generator.types";
import { fireEvent, render, screen } from "@testing-library/react";

const stagePath = join(
  __dirname,
  "../../../../../fey/Assets/StreamingAssets/json/stage/thecrypt.stage.json",
);

const inline: GeneratorSpec = {
  generator: "Crypt",
  version: 2,
  requirements: [
    { role: "Entrance", min: 1, max: 1, size: "Medium" },
    {
      role: "Ambush",
      min: 2,
      max: 2,
      size: "Medium",
      path: "MainPath",
      placement: { min_depth: 1, chokepoint: true },
      tags: { min_exits: 2, max_enemies: 6 },
      min_spacing: 2,
    },
    { role: "Treasure", min: 1, max: 1, hard: false, weight: 2, size: "Small" },
  ],
  connections: {
    main_path: { min: 7, max: 9 },
    loops: { min: 1, max: 2 },
    dead_ends: true,
    branch_len: { min: 1, max: 2 },
  },
  fill: "Combat",
  seed_policy: "PerRun",
} as GeneratorSpec;

const shipped = existsSync(stagePath)
  ? (JSON.parse(readFileSync(stagePath, "utf8")).entity.generator as GeneratorSpec)
  : undefined;

const value = (name: string) =>
  (screen.getByRole("spinbutton", { name }) as HTMLInputElement).value;

describe("GeneratorCard field levels", { timeout: 30000 }, () => {
  it("binds each requirement field where the ATD puts it", () => {
    const onChange = vi.fn();
    render(<GeneratorCard spec={inline} prefabKind={() => undefined} onChange={onChange} onRemove={vi.fn()} />);
    expect(value("requirement 1 min spacing")).toBe("2");
    expect(value("requirement 1 min depth")).toBe("1");
    expect(value("requirement 1 min exits")).toBe("2");
    expect(value("requirement 1 max enemies")).toBe("6");
    expect(Number(value("requirement 2 weight"))).toBe(2);

    fireEvent.change(screen.getByRole("spinbutton", { name: "requirement 1 min spacing" }), { target: { value: "4" } });
    let r = onChange.mock.calls.at(-1)?.[0].requirements[1];
    expect(r.min_spacing).toBe(4);
    expect(r.placement).toEqual({ min_depth: 1, chokepoint: true });

    fireEvent.change(screen.getByRole("spinbutton", { name: "requirement 1 min depth" }), { target: { value: "3" } });
    r = onChange.mock.calls.at(-1)?.[0].requirements[1];
    expect(r.placement.min_depth).toBe(3);
    expect(r.min_spacing).toBe(2);

    fireEvent.change(screen.getByRole("spinbutton", { name: "requirement 1 max enemies" }), { target: { value: "8" } });
    r = onChange.mock.calls.at(-1)?.[0].requirements[1];
    expect(r.tags).toEqual({ min_exits: 2, max_enemies: 8 });
    expect(r.placement.max_enemies).toBeUndefined();
  });

  it.skipIf(!shipped)("shows the shipped crypt Ambush min_spacing 2", () => {
    render(<GeneratorCard spec={shipped!} prefabKind={() => undefined} onChange={vi.fn()} onRemove={vi.fn()} />);
    const i = shipped!.requirements.findIndex((r) => r.role === "Ambush");
    expect(value(`requirement ${i} min spacing`)).toBe("2");
    const rest = shipped!.requirements.findIndex((r) => r.role === "Rest");
    expect(value(`requirement ${rest} min spacing`)).toBe("3");
    const combat = shipped!.requirements.findIndex((r) => r.role === "Combat");
    expect(value(`requirement ${combat} max enemies`)).toBe("6");
  });
});
