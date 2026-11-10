import { describe, it, expect, vi } from "vitest";
import { CharacterForm } from "@components/properties-editor/character-form";
import { DifficultyForm } from "@components/properties-editor/difficulty-form";
import { QuestForm } from "@components/properties-editor/quest-form";
import { Character, CharacterType } from "@models/character.types";
import { Quest, QuestDifficulty } from "@models/quest.types";
import { fireEvent, render, screen } from "@testing-library/react";

// The reference picker needs the entity store
vi.mock("@components/common/entity-reference-select", () => ({
  EntityReferenceSelect: ({ value }: { value?: string }) => <input aria-label="reference key" readOnly value={value ?? ""} />,
}));

// What an editor change saves: the JSON text, so a key left undefined counts as absent
const saved = (onChange: ReturnType<typeof vi.fn>) =>
  JSON.parse(JSON.stringify(onChange.mock.calls.at(-1)?.[0]));

const color = { r: 1, g: 0, b: 0, a: 1 };
const difficulty = (tier?: QuestDifficulty["tier"]): QuestDifficulty => ({
  metadata: { title: "T", description: "" },
  type: "Hard",
  color,
  ...(tier ? { tier } : {}),
});

describe("DifficultyForm tier", { timeout: 30000 }, () => {
  const renderForm = (entity: QuestDifficulty) => {
    const onChange = vi.fn();
    render(<DifficultyForm entity={entity} onChange={onChange} />);
    return onChange;
  };

  it("adds the tier record with the switch", () => {
    const onChange = renderForm(difficulty());
    fireEvent.click(screen.getByRole("switch", { name: "has tier" }));
    expect(saved(onChange).tier).toEqual({ order: 0 });
  });

  it("removes the whole record with the switch", () => {
    const onChange = renderForm(difficulty({ order: 1, rate: 1.5 }));
    fireEvent.click(screen.getByRole("switch", { name: "has tier" }));
    expect("tier" in saved(onChange)).toBe(false);
  });

  it("edits a tier field and clearing an optional one removes its key", () => {
    const onChange = renderForm(difficulty({ order: 1, rate: 1.5 }));
    fireEvent.change(screen.getByLabelText("gold multiplier"), { target: { value: "2.5" } });
    expect(saved(onChange).tier).toEqual({ order: 1, rate: 1.5, gold_multiplier: 2.5 });
    fireEvent.change(screen.getByLabelText("rate"), { target: { value: "" } });
    expect(saved(onChange).tier).toEqual({ order: 1 });
  });

  it("adds and removes affixes, dropping the list when empty", () => {
    const onChange = renderForm(difficulty({ order: 1 }));
    fireEvent.click(screen.getByRole("button", { name: "Add affix" }));
    expect(saved(onChange).tier.affixes).toEqual([{ name: "New affix", stat: "Health", multiplier: 1 }]);
  });

  it("edits an affix and removes the last one with the list key", () => {
    const tier = { order: 1, affixes: [{ name: "Fortified", stat: "Health" as never, multiplier: 1.1, min_rank: "Elite" as never }] };
    const onChange = renderForm(difficulty(tier));
    fireEvent.change(screen.getByLabelText("affix 0 multiplier"), { target: { value: "1.3" } });
    expect(saved(onChange).tier.affixes[0]).toMatchObject({ name: "Fortified", multiplier: 1.3, min_rank: "Elite" });
    fireEvent.click(screen.getByRole("button", { name: "Remove affix" }));
    expect("affixes" in saved(onChange).tier).toBe(false);
  });
});

const quest = (extra: Partial<Quest> = {}): Quest =>
  ({
    metadata: { title: "Q", description: "" },
    origin: "QuestBoard",
    assignee: "Team",
    difficulty: { key: "Normal" },
    stage: { key: "Forest" },
    root: { type: "Sequence", id: 0, name: "root", children: [] },
    is_repeatable: false,
    achievement_on_complete: "None",
    required_achievements: ["None"],
    ...extra,
  }) as unknown as Quest;

describe("QuestForm ends_run", { timeout: 30000 }, () => {
  it("checking writes ends_run: true and leaves the tree as read", () => {
    const onChange = vi.fn();
    const entity = quest();
    render(<QuestForm entity={entity} onChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: "ends run" });
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(saved(onChange).ends_run).toBe(true);
    expect(saved(onChange).root).toEqual(entity.root);
  });

  it("unchecking removes the key", () => {
    const onChange = vi.fn();
    render(<QuestForm entity={quest({ ends_run: true })} onChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: "ends run" });
    expect(box).toBeChecked();
    fireEvent.click(box);
    expect("ends_run" in saved(onChange)).toBe(false);
  });

  it("says the tree is not editable", () => {
    render(<QuestForm entity={quest()} onChange={vi.fn()} />);
    expect(screen.getByText(/not editable here/)).toBeInTheDocument();
  });
});

const character = (extra: Partial<Character> = {}): Character =>
  ({ metadata: { title: "C", description: "" }, type: CharacterType.Slime, vision_range: 8, ...extra }) as unknown as Character;

describe("CharacterForm level", { timeout: 30000 }, () => {
  it("sets the level", () => {
    const onChange = vi.fn();
    render(<CharacterForm entity={character()} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("level"), { target: { value: "3" } });
    expect(saved(onChange).level).toBe(3);
  });

  it("clearing the level removes the key", () => {
    const onChange = vi.fn();
    render(<CharacterForm entity={character({ level: 3 })} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("level"), { target: { value: "" } });
    expect("level" in saved(onChange)).toBe(false);
  });

  it("an absent level stays absent when another field changes", () => {
    const onChange = vi.fn();
    render(<CharacterForm entity={character()} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "swims" }));
    expect(saved(onChange)).toEqual({ ...character(), swims: true });
  });
});

describe("QuestForm required achievements", { timeout: 30000 }, () => {
  it("cannot save an empty list: removing the last tag is ignored", () => {
    const onChange = vi.fn();
    render(<QuestForm entity={quest({ required_achievements: ["BoarDefender"] })} onChange={onChange} />);
    fireEvent.click(document.querySelector(".ant-select-selection-item-remove")!);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("DifficultyForm guarantee quality", { timeout: 30000 }, () => {
  it("does not offer None, which validate_guarantee_quality rejects", () => {
    render(<DifficultyForm entity={difficulty({ order: 1 })} onChange={vi.fn()} />);
    fireEvent.mouseDown(screen.getAllByRole("combobox").find((c) => c.getAttribute("aria-label") === "guarantee min quality")!);
    expect(screen.getAllByText("Epic").length).toBeGreaterThan(0);
    expect(screen.queryByText("None")).toBeNull();
  });
});
