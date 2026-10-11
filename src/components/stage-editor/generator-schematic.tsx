import React from "react";
import {
  GeneratorSpec,
  PathRule,
  RoomRole,
} from "@models/generator.types";

const ROLE_COLORS: Record<RoomRole, string> = {
  [RoomRole.Entrance]: "#2f9e44",
  [RoomRole.Combat]: "#e03131",
  [RoomRole.Ambush]: "#d9480f",
  [RoomRole.Rest]: "#f08c00",
  [RoomRole.Treasure]: "#a67c00",
  [RoomRole.Objective]: "#5c940d",
  [RoomRole.Boss]: "#862e9c",
  [RoomRole.Filler]: "#868e96",
};

const CELL = 44;
const LANE = 22;

// A schematic of the requirements against the main path: one lane per requirement, spanning the
// depths it may use (entrance = 0). This is not the generator, only a picture of the spec.
export const GeneratorSchematic: React.FC<{ spec: GeneratorSpec }> = ({
  spec,
}) => {
  const longest = Math.max(spec.connections.main_path.max, 2);
  const shortest = Math.max(spec.connections.main_path.min, 2);
  const width = longest * CELL;
  const height = 24 + spec.requirements.length * LANE + 8;
  return (
    <svg
      role="img"
      aria-label="Requirements schematic"
      viewBox={`0 0 ${width + 150} ${height}`}
      style={{ width: "100%", maxWidth: width + 150 }}
    >
      {Array.from({ length: longest }, (_, d) => (
        <g key={d}>
          <rect
            x={150 + d * CELL}
            y={0}
            width={CELL - 2}
            height={18}
            rx={3}
            fill={d < shortest ? "#dee2e6" : "#f1f3f5"}
            stroke="#adb5bd"
          />
          <text x={150 + d * CELL + CELL / 2} y={13} fontSize={10} textAnchor="middle" fill="#343a40">
            {d}
          </text>
        </g>
      ))}
      {spec.requirements.map((r, i) => {
        const y = 24 + i * LANE;
        const farthest = r.placement?.farthest ?? false;
        const main = (r.path ?? PathRule.Any) !== PathRule.Branch;
        let from = r.placement?.min_depth ?? 0;
        let to = r.placement?.max_depth ?? longest - 1;
        if (r.role === RoomRole.Entrance) to = 0;
        if (farthest) {
          from = Math.max(from, shortest - 1);
          to = longest - 1;
        }
        to = Math.min(to, longest - 1);
        const soft = !(r.hard ?? true);
        return (
          <g key={i} data-testid={`lane-${i}`}>
            <text x={146} y={y + 14} fontSize={11} textAnchor="end" fill="#212529">
              {`${r.role} ${r.min}-${r.max}${soft ? " (soft)" : ""}`}
            </text>
            {to >= from && (
              <rect
                x={150 + from * CELL}
                y={y + 2}
                width={(to - from + 1) * CELL - 2}
                height={LANE - 6}
                rx={3}
                fill={ROLE_COLORS[r.role]}
                opacity={main ? 0.75 : 0.35}
                strokeDasharray={main ? undefined : "4 3"}
                stroke={ROLE_COLORS[r.role]}
              />
            )}
            {(r.placement?.chokepoint ?? false) && (
              <text x={150 + from * CELL + 4} y={y + 14} fontSize={9} fill="#fff">
                choke
              </text>
            )}
            {r.path === PathRule.Branch && (
              <text x={150 + from * CELL + 4} y={y + 14} fontSize={9} fill="#212529">
                branch
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
