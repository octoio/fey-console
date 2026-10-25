import React, { useRef } from "react";
import { AnchorSlot } from "@models/generator.types";
import { RoomPrefab } from "@models/roomprefab.types";
import { ObstacleShape } from "@models/stage.types";
import { PrefabSelection } from "@store/prefab.store";

export const SLOT_COLORS: Record<AnchorSlot, string> = {
  [AnchorSlot.PlayerSpawn]: "#2f9e44",
  [AnchorSlot.EntryPortal]: "#1c7ed6",
  [AnchorSlot.PackSpawn]: "#e03131",
  [AnchorSlot.BossSpawn]: "#862e9c",
  [AnchorSlot.ExitPortal]: "#0c8599",
  [AnchorSlot.Shrine]: "#f08c00",
  [AnchorSlot.Chest]: "#a67c00",
  [AnchorSlot.ObjectiveZone]: "#5c940d",
  [AnchorSlot.Marker]: "#868e96",
};

interface PrefabCanvasProps {
  prefab: RoomPrefab;
  selection: PrefabSelection;
  onSelect: (selection: PrefabSelection) => void;
  onMove: (
    selection: NonNullable<PrefabSelection>,
    x: number,
    z: number,
  ) => void;
}

const MARGIN = 3;

// Top-down view of the room in room coordinates: +x right, +z up (screen y = -z), centre at 0, 0.
// The four doors are cut within door_band of the middle of each wall.
export const PrefabCanvas: React.FC<PrefabCanvasProps> = ({
  prefab,
  selection,
  onSelect,
  onMove,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<NonNullable<PrefabSelection> | null>(null);
  const hx = Math.max(prefab.size.x, 1) / 2;
  const hz = Math.max(prefab.size.z, 1) / 2;
  const band = Math.max(prefab.door_band, 0);

  const toRoom = (event: React.PointerEvent) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(ctm.inverse());
    return { x: local.x, z: -local.y };
  };

  const startDrag =
    (item: NonNullable<PrefabSelection>) => (event: React.PointerEvent) => {
      event.stopPropagation();
      drag.current = item;
      onSelect(item);
      (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    };

  const handleMove = (event: React.PointerEvent) => {
    if (!drag.current) return;
    const p = toRoom(event);
    if (p) onMove(drag.current, p.x, p.z);
  };

  const isSelected = (kind: "obstacle" | "slot", index: number) =>
    selection?.kind === kind && selection.index === index;

  const wall = "#495057";
  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label="Room canvas"
      viewBox={`${-hx - MARGIN} ${-hz - MARGIN} ${hx * 2 + MARGIN * 2} ${hz * 2 + MARGIN * 2}`}
      style={{ width: 480, maxWidth: "100%", background: "#f8f9fa", touchAction: "none" }}
      onPointerMove={handleMove}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
      onPointerDown={() => onSelect(null)}
    >
      <rect x={-hx} y={-hz} width={hx * 2} height={hz * 2} fill="#e9ecef" />
      {/* door bands, drawn under the walls */}
      <rect x={-band} y={-hz} width={band * 2} height={hz * 2} fill="#74c0fc" opacity={0.18} data-testid="door-band-z" />
      <rect x={-hx} y={-band} width={hx * 2} height={band * 2} fill="#74c0fc" opacity={0.18} data-testid="door-band-x" />
      {/* walls with a gap for each door */}
      {[
        [-hx, -hz, -band, -hz],
        [band, -hz, hx, -hz],
        [-hx, hz, -band, hz],
        [band, hz, hx, hz],
        [-hx, -hz, -hx, -band],
        [-hx, band, -hx, hz],
        [hx, -hz, hx, -band],
        [hx, band, hx, hz],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={wall} strokeWidth={0.4} />
      ))}
      {[
        [0, -hz, "N"],
        [0, hz, "S"],
        [-hx, 0, "W"],
        [hx, 0, "E"],
      ].map(([x, y, label]) => (
        <circle key={String(label)} cx={x as number} cy={y as number} r={0.35} fill="#1c7ed6">
          <title>{`door ${label}`}</title>
        </circle>
      ))}

      {(prefab.obstacles ?? []).map((o, i) => {
        const selected = isSelected("obstacle", i);
        const common = {
          fill: "#868e96",
          stroke: selected ? "#e8590c" : "#343a40",
          strokeWidth: selected ? 0.3 : 0.12,
          style: { cursor: "move" },
          onPointerDown: startDrag({ kind: "obstacle", index: i }),
          "data-testid": `obstacle-${i}`,
        };
        return o.shape === ObstacleShape.Circle ? (
          <circle key={i} cx={o.x} cy={-o.z} r={o.radius ?? 1} {...common} />
        ) : (
          <rect
            key={i}
            x={o.x - (o.half_x ?? 1)}
            y={-o.z - (o.half_z ?? 1)}
            width={(o.half_x ?? 1) * 2}
            height={(o.half_z ?? 1) * 2}
            transform={`rotate(${-(o.yaw ?? 0)} ${o.x} ${-o.z})`}
            {...common}
          />
        );
      })}

      {prefab.slots.map((s, i) => {
        const selected = isSelected("slot", i);
        const color = SLOT_COLORS[s.slot];
        return (
          <g
            key={i}
            style={{ cursor: "move" }}
            data-testid={`slot-${i}`}
            onPointerDown={startDrag({ kind: "slot", index: i })}
          >
            {(s.area ?? 0) > 0 && (
              <circle cx={s.x} cy={-s.z} r={s.area} fill={color} opacity={0.15} stroke={color} strokeDasharray="0.4 0.3" strokeWidth={0.1} />
            )}
            <polygon
              points={`${s.x},${-s.z - 0.7} ${s.x + 0.7},${-s.z} ${s.x},${-s.z + 0.7} ${s.x - 0.7},${-s.z}`}
              fill={color}
              stroke={selected ? "#e8590c" : "#fff"}
              strokeWidth={selected ? 0.25 : 0.1}
            />
            <text x={s.x} y={-s.z - 0.95} fontSize={0.9} textAnchor="middle" fill="#212529">
              {s.slot}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
