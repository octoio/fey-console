import { EntityReference } from "@models/common.types";
import {
  AnchorBinding,
  GeneratorKind,
  GeneratorSpec,
  PathRule,
  RoomRequirement,
  RoomRole,
  SeedPolicy,
} from "@models/generator.types";
import { RoomPrefab } from "@models/roomprefab.types";
import { ObstacleShape } from "@models/stage.types";

// Port of the static checks of fey-data's mapgen_check.ml (spec_problems) and of the
// validation rules of room_prefab.atd. The OCaml code is the reference: change both together.
// The quest demand checks (slot counts of a quest) are not ported: they need the quest graph.

const roleName = (role: RoomRole): string => role.toLowerCase();
const satSub = (a: number, b: number): number => (a > b ? a - b : 0);

const isHard = (r: RoomRequirement) => r.hard ?? true;
const pathOf = (r: RoomRequirement): PathRule => r.path ?? PathRule.Any;
const minSpacing = (r: RoomRequirement) => r.min_spacing ?? 0;
const isFarthest = (r: RoomRequirement) => r.placement?.farthest ?? false;
const minDepth = (r: RoomRequirement) => r.placement?.min_depth ?? 0;
const isChokepoint = (r: RoomRequirement) => r.placement?.chokepoint ?? false;

// Resolves a RoomPrefab reference to its generator kind, undefined when it does not exist
export type PrefabKindLookup = (
  reference: EntityReference,
) => GeneratorKind | undefined;

interface Ctx {
  spec: GeneratorSpec;
  out: string[];
  longest: number;
  checkPrefab: (label: string, ref: EntityReference) => void;
}

const connectionProblems = ({ spec, out }: Ctx) => {
  const c = spec.connections;
  if (c.main_path.min < 2 || c.main_path.min > c.main_path.max)
    {out.push(
      `main path [${c.main_path.min}, ${c.main_path.max}] must be at least 2 rooms with min <= max`,
    );}
  if (c.loops.min > c.loops.max)
    out.push(`loops [${c.loops.min}, ${c.loops.max}]: min > max`);
  if (c.branch_len.min > c.branch_len.max)
    {out.push(
      `branch length [${c.branch_len.min}, ${c.branch_len.max}]: min > max`,
    );}
  if ((spec.party_size ?? 4) === 0) out.push("party size 0");
};

const farthestProblems = (ctx: Ctx, r: RoomRequirement, n: string) => {
  const { out, longest } = ctx;
  if (r.max !== 1 || r.min > 1)
    out.push(`${n}: the farthest room is one room (min/max must be 1)`);
  if (pathOf(r) === PathRule.Branch)
    out.push(`${n}: the farthest room is on the main path, not a branch`);
  if (minDepth(r) + 1 > longest)
    {out.push(
      `${n} must be at depth >= ${minDepth(r)} but the main path has at most ${longest} rooms (depth ${satSub(longest, 1)})`,
    );}
};

const mainPathProblems = (ctx: Ctx, r: RoomRequirement, n: string) => {
  const { out, longest } = ctx;
  const lastSlot = satSub(longest, 2);
  if (minDepth(r) > lastSlot)
    {out.push(
      `${n} must be at depth >= ${minDepth(r)} on the main path, whose last free slot is depth ${lastSlot}`,
    );}
  const spacing = Math.max(minSpacing(r), 1);
  const needed = Math.max(minDepth(r), 1) + (r.min - 1) * spacing;
  if (needed > Math.max(lastSlot, 1) && r.min > 1)
    {out.push(
      `${n}: ${r.min} rooms ${spacing} apart from depth ${Math.max(minDepth(r), 1)} need a main path of ${needed + 2} rooms, at most ${longest}`,
    );}
};

const requirementProblems = (ctx: Ctx, r: RoomRequirement) => {
  const { out } = ctx;
  const n = roleName(r.role);
  if (r.min > r.max) out.push(`${n}: min ${r.min} > max ${r.max}`);
  const maxDepth = r.placement?.max_depth;
  if (maxDepth !== undefined && maxDepth < minDepth(r))
    out.push(`${n}: max depth below min depth`);
  if (isFarthest(r)) farthestProblems(ctx, r, n);
  if (isChokepoint(r) && pathOf(r) !== PathRule.MainPath)
    out.push(`${n}: a chokepoint must be on the main path`);
  if (r.role === RoomRole.Entrance && (r.min > 1 || r.max !== 1))
    out.push("entrance: exactly one");
  if (r.prefab) ctx.checkPrefab(n, r.prefab);
  if (
    pathOf(r) === PathRule.MainPath &&
    isHard(r) &&
    !isFarthest(r) &&
    r.min > 0
  )
    mainPathProblems(ctx, r, n);
};

const mainPathBudgetProblems = ({ spec, out, longest }: Ctx) => {
  const farthestCount = spec.requirements.filter(isFarthest).length;
  const mainHard = spec.requirements
    .filter(
      (r) =>
        isHard(r) &&
        pathOf(r) === PathRule.MainPath &&
        !isFarthest(r) &&
        r.role !== RoomRole.Entrance,
    )
    .reduce((acc, r) => acc + r.min, 0);
  const inner = satSub(longest, farthestCount === 0 ? 1 : 2);
  if (mainHard > inner)
    {out.push(
      `the main path needs ${mainHard} required rooms between the entrance and the end, but has at most ${inner}`,
    );}
};

const pinnedProblems = ({ spec, out, checkPrefab }: Ctx) => {
  let pinnedAt = 0;
  for (const pin of spec.pinned ?? []) {
    checkPrefab("pinned", pin.prefab);
    const can =
      pin.role === RoomRole.Entrance ||
      pin.role === spec.fill ||
      spec.requirements.some((r) => r.role === pin.role && r.max > 0);
    if (!can)
      {out.push(
        `pinned prefab ${pin.prefab.key} needs a ${roleName(pin.role)} room but no requirement makes one`,
      );}
    if (pin.at) pinnedAt++;
  }
  if (pinnedAt > 1) out.push("only one pinned prefab may have a fixed position");
};

const dataProblems = ({ spec, out }: Ctx) => {
  if (spec.seed_policy === SeedPolicy.Fixed && spec.fixed_seed === undefined)
    out.push("seed policy Fixed needs fixed_seed");
  if (spec.seed_policy === SeedPolicy.PerRun && spec.fixed_seed !== undefined)
    out.push("fixed_seed is only used by seed policy Fixed");
  const par = spec.par?.boss_path;
  if (par && (par.min < 0 || par.min > par.max))
    out.push(`par boss_path [${par.min}, ${par.max}]: needs 0 <= min <= max`);
  // Schema validators (generator.atd)
  if (spec.version < 1) out.push("version must be at least 1");
  if (spec.requirements.length < 1) out.push("at least one requirement");
  if ((spec.corridor_width ?? 1) < 1) out.push("corridor width must be at least 1");
  if ((spec.max_attempts ?? 1) < 1) out.push("max attempts must be at least 1");
  if ((spec.candidates ?? 1) < 1) out.push("candidates must be at least 1");
  if ((spec.party_size ?? 1) < 0) out.push("party size must be at least 1");
};

export const specProblems = (
  spec: GeneratorSpec,
  prefabKind: PrefabKindLookup = () => undefined,
  options: { checkPrefabExistence?: boolean } = {},
): string[] => {
  const checkExistence = options.checkPrefabExistence ?? true;
  const out: string[] = [];
  const ctx: Ctx = {
    spec,
    out,
    longest: spec.connections.main_path.max,
    checkPrefab: (label, ref) => {
      const kind = prefabKind(ref);
      if (kind === undefined) {
        if (checkExistence) out.push(`${label}: unknown prefab ${ref.key}`);
      } else if (kind !== spec.generator)
        out.push(`${label}: prefab ${ref.key} is not a ${spec.generator} prefab`);
    },
  };
  connectionProblems(ctx);
  if (spec.requirements.filter(isFarthest).length > 1)
    out.push("more than one requirement claims the farthest room");
  for (const r of spec.requirements) requirementProblems(ctx, r);
  mainPathBudgetProblems(ctx);
  pinnedProblems(ctx);
  dataProblems(ctx);
  return out;
};

// Par rules of the M3 design (hints, not build errors): boss path 150..200 u, 7..9 rooms on the
// main path, crypt Ambush rooms at least 2 apart.
export const parHints = (spec: GeneratorSpec): string[] => {
  const out: string[] = [];
  const mp = spec.connections.main_path;
  if (!spec.par)
    out.push("no par: the boss path length is not bounded (shipped specs set boss_path 150..200)");
  if (mp.min < 7 || mp.max > 9)
    {out.push(
      `main path [${mp.min}, ${mp.max}] is outside the 7..9 rooms the shipped specs use`,
    );}
  if (spec.generator === GeneratorKind.Crypt)
    {for (const r of spec.requirements)
      {if (r.role === RoomRole.Ambush && r.min > 1 && (r.min_spacing ?? 0) < 2)
        out.push("ambush rooms should be at least 2 apart (min_spacing 2) so none come back to back");}}
  return out;
};

export const hintsFor = (spec: GeneratorSpec): string[] => {
  const hints = parHints(spec);
  if (spec.version !== 2)
    hints.push(`generator version ${spec.version}: the current version is 2`);
  if (spec.seed_policy === SeedPolicy.Fixed)
    hints.push("Fixed seed: every run gets the same layout");
  return hints;
};

const PREFAB_ID = /^[a-z0-9]+(\.[a-z0-9_]+)+$/;

// Not rejected by fey-data: console-only hints
export const prefabWarnings = (prefab: RoomPrefab): string[] => {
  const out: string[] = [];
  (prefab.obstacles ?? []).forEach((o, i) => {
    if (![o.x, o.z].every(Number.isFinite)) return;
    if (Math.abs(o.x) > prefab.size.x / 2 || Math.abs(o.z) > prefab.size.z / 2)
      out.push(`obstacle ${i}: centre is outside the room`);
    else if (inDoorBand(prefab, o.x, o.z))
      out.push(`obstacle ${i}: stands in a door band (keep it free of props)`);
  });
  return out;
};

export const prefabProblems = (prefab: RoomPrefab): string[] => {
  const out: string[] = [];
  if (!PREFAB_ID.test(prefab.prefab_id))
    {out.push(
      "prefab_id must be lower case words joined by dots, like crypt.hollow_nest",
    );}
  if (!(prefab.size.x > 0) || !(prefab.size.z > 0))
    out.push("size must be positive on both axes");
  if (!(prefab.door_band >= 0)) out.push("door_band must be >= 0");
  if (
    prefab.door_band * 2 > Math.min(prefab.size.x, prefab.size.z) &&
    prefab.size.x > 0 &&
    prefab.size.z > 0
  )
    out.push("door_band is wider than the room");
  (prefab.obstacles ?? []).forEach((o, i) => {
    const pos = (v?: number) => v !== undefined && Number.isFinite(v) && v > 0;
    const ok =
      Number.isFinite(o.x) &&
      Number.isFinite(o.z) &&
      (o.yaw === undefined || Number.isFinite(o.yaw)) &&
      (o.shape === ObstacleShape.Circle
        ? pos(o.radius)
        : pos(o.half_x) && pos(o.half_z));
    if (!ok) out.push(`obstacle ${i}: needs finite coordinates and positive extents`);
  });
  prefab.slots.forEach((s, i) => {
    if (Math.abs(s.x) > prefab.size.x / 2 || Math.abs(s.z) > prefab.size.z / 2)
      out.push(`slot ${i} (${s.slot}): outside the room`);
    if ((s.area ?? 0) < 0) out.push(`slot ${i} (${s.slot}): area must be >= 0`);
  });
  return out;
};

// Doors are cut within door_band of the middle of a wall: a band along each axis through the centre
export const inDoorBand = (prefab: RoomPrefab, x: number, z: number): boolean =>
  Math.abs(x) <= prefab.door_band || Math.abs(z) <= prefab.door_band;

// A generated stage: every anchor needs a binding, and no (slot, ordinal) may be bound twice
export const bindingProblems = (
  anchors: { key: string; binding?: AnchorBinding }[],
): string[] => {
  const out: string[] = [];
  const seen = new Map<string, string>();
  for (const a of anchors) {
    if (!a.binding) {
      out.push(`anchor ${a.key}: no binding on a stage with a generator`);
      continue;
    }
    const id = `${a.binding.slot}#${a.binding.ordinal ?? 0}`;
    const other = seen.get(id);
    if (other)
      out.push(`anchor ${a.key}: same binding as ${other} (${id})`);
    else seen.set(id, a.key);
  }
  // the ordinals per slot are 0..n-1
  const bySlot = new Map<string, Set<number>>();
  for (const a of anchors)
    {if (a.binding) {
      const set = bySlot.get(a.binding.slot) ?? new Set<number>();
      set.add(a.binding.ordinal ?? 0);
      bySlot.set(a.binding.slot, set);
    }}
  for (const [slot, ordinals] of bySlot)
    {for (let i = 0; i < ordinals.size; i++)
      {if (!ordinals.has(i)) {
        out.push(`${slot}: ordinals must be 0..${ordinals.size - 1} without gaps (missing ${i})`);
        break;
      }}}
  return out;
};
