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
