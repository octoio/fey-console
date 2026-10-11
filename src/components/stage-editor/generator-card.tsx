import {
  Alert,
  Button,
  Card,
  Checkbox,
  Empty,
  InputNumber,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import React from "react";
import { EntityReferenceSelect } from "@components/common/entity-reference-select";
import { EntityType } from "@models/common.types";
import {
  ALL_FACINGS,
  ALL_GENERATOR_KINDS,
  ALL_PATH_RULES,
  ALL_ROOM_ROLES,
  ALL_ROOM_SIZES,
  ALL_SEED_POLICIES,
  createDefaultRequirement,
  dropUndefined,
  GeneratorSpec,
  PinnedPrefab,
  RoomRequirement,
  SeedPolicy,
} from "@models/generator.types";
import { hintsFor, PrefabKindLookup, specProblems } from "@utils/mapgen-check";
import { GeneratorSchematic } from "./generator-schematic";

const { Text } = Typography;

interface GeneratorCardProps {
  spec: GeneratorSpec;
  prefabKind: PrefabKindLookup;
  onChange: (spec: GeneratorSpec) => void;
  onRemove: () => void;
}

// An optional field is absent from the JSON when cleared
const num = (v: number | null): number | undefined => v ?? undefined;

const roleOptions = ALL_ROOM_ROLES.map((r) => ({ value: r, label: r }));

const Field: React.FC<{
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number;
  step?: number;
}> = ({ label, value, onChange, min, step }) => (
  <InputNumber
    size="small"
    style={{ width: 150 }}
    min={min}
    step={step}
    prefix={<Text type="secondary">{label.replace(/^requirement \d+ /, "")}</Text>}
    aria-label={label}
    value={value}
    onChange={(v) => onChange(num(v))}
  />
);

const RequirementRow: React.FC<{
  index: number;
  r: RoomRequirement;
  onChange: (r: RoomRequirement) => void;
  onRemove: () => void;
}> = ({ index, r, onChange, onRemove }) => {
  const label = `requirement ${index}`;
  const placement = r.placement ?? {};
  const setPlacement = (patch: Partial<NonNullable<RoomRequirement["placement"]>>) => {
    const next = dropUndefined({ ...placement, ...patch });
    // false is the default: do not write it
    const clean = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== false),
    );
    onChange({
      ...r,
      placement: Object.keys(clean).length > 0 ? clean : undefined,
    });
  };
  const setTags = (patch: Partial<NonNullable<RoomRequirement["tags"]>>) => {
    const next = Object.fromEntries(
      Object.entries({ ...(r.tags ?? {}), ...patch }).filter(
        ([, v]) => v !== undefined && v !== false,
      ),
    );
    onChange({ ...r, tags: Object.keys(next).length > 0 ? next : undefined });
  };
  return (
    <Card
      size="small"
      title={<Text strong>{`${label}: ${r.role}`}</Text>}
      extra={
        <Button danger size="small" onClick={onRemove}>
          Remove
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Space wrap>
          <Select size="small" style={{ width: 120 }} aria-label={`${label} role`} value={r.role} options={roleOptions} onChange={(role) => onChange({ ...r, role })} />
          <InputNumber size="small" min={0} prefix={<Text type="secondary">min</Text>} aria-label={`${label} min`} value={r.min} onChange={(v) => onChange({ ...r, min: v ?? 0 })} />
          <InputNumber size="small" min={0} prefix={<Text type="secondary">max</Text>} aria-label={`${label} max`} value={r.max} onChange={(v) => onChange({ ...r, max: v ?? 0 })} />
          <Select size="small" style={{ width: 100 }} aria-label={`${label} size`} value={r.size} options={ALL_ROOM_SIZES.map((s) => ({ value: s, label: s }))} onChange={(size) => onChange({ ...r, size })} />
          <Select size="small" style={{ width: 110 }} aria-label={`${label} path`} value={r.path} allowClear placeholder="path (Any)" options={ALL_PATH_RULES.map((s) => ({ value: s, label: s }))} onChange={(path) => onChange({ ...r, path: path ?? undefined })} />
          <Checkbox checked={r.hard ?? true} onChange={(e) => onChange({ ...r, hard: e.target.checked ? undefined : false })}>hard</Checkbox>
          {r.hard === false && (
            <Field label={`${label} weight`} value={r.weight} min={0} step={0.5} onChange={(weight) => onChange({ ...r, weight })} />
          )}
        </Space>
        <Space wrap>
          <Checkbox checked={placement.farthest ?? false} onChange={(e) => setPlacement({ farthest: e.target.checked })}>farthest</Checkbox>
          <Checkbox checked={placement.chokepoint ?? false} onChange={(e) => setPlacement({ chokepoint: e.target.checked })}>chokepoint</Checkbox>
          <Field label={`${label} min depth`} value={placement.min_depth} min={0} onChange={(min_depth) => setPlacement({ min_depth })} />
          <Field label={`${label} max depth`} value={placement.max_depth} min={0} onChange={(max_depth) => setPlacement({ max_depth })} />
          <Field label={`${label} min spacing`} value={r.min_spacing} min={0} onChange={(min_spacing) => onChange({ ...r, min_spacing })} />
        </Space>
        <Space wrap>
          <Field label={`${label} max enemies`} value={r.tags?.max_enemies} min={0} onChange={(max_enemies) => setTags({ max_enemies })} />
          <Field label={`${label} min exits`} value={r.tags?.min_exits} min={0} onChange={(min_exits) => setTags({ min_exits })} />
          <Checkbox checked={r.tags?.torches ?? false} onChange={(e) => setTags({ torches: e.target.checked })}>torches</Checkbox>
        </Space>
        <Space>
          <Text strong>prefab</Text>
          <EntityReferenceSelect
            entityType={EntityType.RoomPrefab}
            value={r.prefab?.key}
            onChange={(reference) => onChange({ ...r, prefab: reference.key ? reference : undefined })}
          />
        </Space>
      </Space>
    </Card>
  );
};

const PinnedMap: React.FC<{ pinned: PinnedPrefab[] }> = ({ pinned }) => {
  const placed = pinned.filter((p) => p.at);
  if (placed.length === 0) return null;
  const arrow = { PosX: [1, 0], PosZ: [0, 1], NegX: [-1, 0], NegZ: [0, -1] } as const;
  return (
    <svg role="img" aria-label="Pinned prefab positions" viewBox="-100 -100 200 200" style={{ width: 200, background: "#f8f9fa" }}>
      <line x1={-100} y1={0} x2={100} y2={0} stroke="#ced4da" />
      <line x1={0} y1={-100} x2={0} y2={100} stroke="#ced4da" />
      {placed.map((p, i) => {
        const [dx, dz] = p.facing ? arrow[p.facing] : [0, 0];
        return (
          <g key={i}>
            <circle cx={p.at!.x / 4} cy={p.at!.z / 4} r={5} fill="#862e9c" />
            {p.facing && (
              <line x1={p.at!.x / 4} y1={p.at!.z / 4} x2={p.at!.x / 4 + dx * 14} y2={p.at!.z / 4 + dz * 14} stroke="#862e9c" strokeWidth={2} />
            )}
            <text x={p.at!.x / 4 + 7} y={p.at!.z / 4 - 7} fontSize={9}>{p.role}</text>
          </g>
        );
      })}
    </svg>
  );
};

export const GeneratorCard: React.FC<GeneratorCardProps> = ({
  spec,
  prefabKind,
  onChange,
  onRemove,
}) => {
  const problems = specProblems(spec, prefabKind);
  const hints = hintsFor(spec);
  const set = (patch: Partial<GeneratorSpec>) => onChange({ ...spec, ...patch });
  const c = spec.connections;
  const setConn = (patch: Partial<GeneratorSpec["connections"]>) =>
    set({ connections: { ...c, ...patch } });
  const pinned = spec.pinned ?? [];
  const setPinned = (next: PinnedPrefab[]) =>
    set({ pinned: next.length > 0 ? next : undefined });
  const forbidden = spec.forbidden_adjacent ?? [];
  const setForbidden = (next: typeof forbidden) =>
    set({ forbidden_adjacent: next.length > 0 ? next : undefined });

  return (
    <Card
      size="small"
      title={`Generator (${spec.generator}, version ${spec.version})`}
      extra={
        <Button danger size="small" onClick={onRemove}>
          Remove generator
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Space wrap>
          <Select size="small" style={{ width: 100 }} aria-label="Generator kind" value={spec.generator} options={ALL_GENERATOR_KINDS.map((k) => ({ value: k, label: k }))} onChange={(generator) => set({ generator })} />
          <InputNumber size="small" min={1} prefix={<Text type="secondary">version</Text>} aria-label="Generator version" value={spec.version} onChange={(v) => set({ version: v ?? 1 })} />
          <Select size="small" style={{ width: 120 }} aria-label="Fill role" value={spec.fill} options={roleOptions} onChange={(fill) => set({ fill })} />
          <Text type="secondary">fill role</Text>
        </Space>
        <Space wrap>
          <Select size="small" style={{ width: 110 }} aria-label="Seed policy" value={spec.seed_policy} options={ALL_SEED_POLICIES.map((k) => ({ value: k, label: k }))} onChange={(seed_policy) => set({ seed_policy, fixed_seed: seed_policy === SeedPolicy.Fixed ? spec.fixed_seed ?? 0 : undefined })} />
          {spec.seed_policy === SeedPolicy.Fixed && (
            <Field label="Fixed seed" value={spec.fixed_seed} min={0} onChange={(fixed_seed) => set({ fixed_seed })} />
          )}
          <Field label="Party size" value={spec.party_size} min={1} onChange={(party_size) => set({ party_size })} />
          <Field label="Corridor width" value={spec.corridor_width} min={1} step={0.5} onChange={(corridor_width) => set({ corridor_width })} />
          <Field label="Max attempts" value={spec.max_attempts} min={1} onChange={(max_attempts) => set({ max_attempts })} />
          <Field label="Candidates" value={spec.candidates} min={1} onChange={(candidates) => set({ candidates })} />
        </Space>

        <Space wrap>
          <Text strong>par boss path</Text>
          <InputNumber size="small" min={0} prefix={<Text type="secondary">min</Text>} aria-label="Par boss path min" value={spec.par?.boss_path.min} onChange={(v) => set({ par: v === null && spec.par?.boss_path.max === undefined ? undefined : { boss_path: { min: v ?? 0, max: spec.par?.boss_path.max ?? v ?? 0 } } })} />
          <InputNumber size="small" min={0} prefix={<Text type="secondary">max</Text>} aria-label="Par boss path max" value={spec.par?.boss_path.max} onChange={(v) => set({ par: v === null ? undefined : { boss_path: { min: spec.par?.boss_path.min ?? 0, max: v } } })} />
        </Space>

        <Space wrap>
          <Text strong>main path</Text>
          <InputNumber size="small" min={0} prefix={<Text type="secondary">min</Text>} aria-label="Main path min" value={c.main_path.min} onChange={(v) => setConn({ main_path: { ...c.main_path, min: v ?? 0 } })} />
          <InputNumber size="small" min={0} prefix={<Text type="secondary">max</Text>} aria-label="Main path max" value={c.main_path.max} onChange={(v) => setConn({ main_path: { ...c.main_path, max: v ?? 0 } })} />
          <Text strong>loops</Text>
          <InputNumber size="small" min={0} aria-label="Loops min" value={c.loops.min} onChange={(v) => setConn({ loops: { ...c.loops, min: v ?? 0 } })} />
          <InputNumber size="small" min={0} aria-label="Loops max" value={c.loops.max} onChange={(v) => setConn({ loops: { ...c.loops, max: v ?? 0 } })} />
          <Text strong>branch length</Text>
          <InputNumber size="small" min={0} aria-label="Branch length min" value={c.branch_len.min} onChange={(v) => setConn({ branch_len: { ...c.branch_len, min: v ?? 0 } })} />
          <InputNumber size="small" min={0} aria-label="Branch length max" value={c.branch_len.max} onChange={(v) => setConn({ branch_len: { ...c.branch_len, max: v ?? 0 } })} />
          <Checkbox checked={c.dead_ends} onChange={(e) => setConn({ dead_ends: e.target.checked })}>dead ends</Checkbox>
        </Space>

        <Card
          size="small"
          title={`Requirements (${spec.requirements.length})`}
          extra={
            <Button size="small" onClick={() => set({ requirements: [...spec.requirements, createDefaultRequirement()] })}>
              Add Requirement
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {spec.requirements.length === 0 && <Empty description="No requirements" />}
            {spec.requirements.map((r, i) => (
              <RequirementRow
                key={i}
                index={i}
                r={r}
                onChange={(next) => set({ requirements: spec.requirements.map((x, j) => (j === i ? next : x)) })}
                onRemove={() => set({ requirements: spec.requirements.filter((_, j) => j !== i) })}
              />
            ))}
          </Space>
        </Card>

        <Card
          size="small"
          title={`Pinned prefabs (${pinned.length})`}
          extra={
            <Button size="small" onClick={() => setPinned([...pinned, { prefab: { owner: "Octoio", type: EntityType.RoomPrefab, key: "", version: 1, id: "" }, role: spec.fill }])}>
              Add Pinned
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {pinned.map((p, i) => {
              const upd = (patch: Partial<PinnedPrefab>) => setPinned(pinned.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <Space key={i} wrap>
                  <EntityReferenceSelect entityType={EntityType.RoomPrefab} value={p.prefab.key} onChange={(prefab) => upd({ prefab })} />
                  <Select size="small" style={{ width: 120 }} aria-label={`pinned ${i} role`} value={p.role} options={roleOptions} onChange={(role) => upd({ role })} />
                  <Select size="small" style={{ width: 90 }} aria-label={`pinned ${i} facing`} allowClear placeholder="facing" value={p.facing} options={ALL_FACINGS.map((f) => ({ value: f, label: f }))} onChange={(facing) => upd({ facing: facing ?? undefined })} />
                  <Checkbox checked={!!p.at} aria-label={`pinned ${i} fixed`} onChange={(e) => upd({ at: e.target.checked ? { x: 0, z: 0 } : undefined })}>at</Checkbox>
                  {p.at && (["x", "z"] as const).map((axis) => (
                    <InputNumber key={axis} size="small" prefix={<Text type="secondary">{axis}</Text>} aria-label={`pinned ${i} at ${axis}`} value={p.at![axis]} onChange={(v) => upd({ at: { ...p.at!, [axis]: v ?? 0 } })} />
                  ))}
                  <Button danger size="small" onClick={() => setPinned(pinned.filter((_, j) => j !== i))}>Remove</Button>
                </Space>
              );
            })}
            <PinnedMap pinned={pinned} />
          </Space>
        </Card>

        <Card
          size="small"
          title={`Forbidden adjacent roles (${forbidden.length})`}
          extra={<Button size="small" onClick={() => setForbidden([...forbidden, { a: spec.fill, b: spec.fill }])}>Add Pair</Button>}
        >
          <Space direction="vertical">
            {forbidden.map((pair, i) => (
              <Space key={i}>
                <Select size="small" style={{ width: 120 }} aria-label={`forbidden ${i} a`} value={pair.a} options={roleOptions} onChange={(a) => setForbidden(forbidden.map((x, j) => (j === i ? { ...x, a } : x)))} />
                <Select size="small" style={{ width: 120 }} aria-label={`forbidden ${i} b`} value={pair.b} options={roleOptions} onChange={(b) => setForbidden(forbidden.map((x, j) => (j === i ? { ...x, b } : x)))} />
                <Button danger size="small" onClick={() => setForbidden(forbidden.filter((_, j) => j !== i))}>Remove</Button>
              </Space>
            ))}
          </Space>
        </Card>

        <Card size="small" title="Requirements schematic (not the generator)">
          <GeneratorSchematic spec={spec} />
        </Card>

        <Space direction="vertical" style={{ width: "100%" }} aria-label="Generator checks">
          {problems.length === 0 && <Tag color="green">spec checks pass</Tag>}
          {problems.map((p) => (
            <Alert key={p} type="error" showIcon message={p} />
          ))}
          {hints.map((h) => (
            <Alert key={h} type="info" showIcon message={h} />
          ))}
        </Space>
      </Space>
    </Card>
  );
};
