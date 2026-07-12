import { describe, expect, it } from "vitest";
import {
  createAnchorDefinition,
  createStageDefinition,
  entityFileName,
  entityFilePath,
  entityId,
  referenceOf,
  serializeDefinition,
} from "@components/stage-editor/stage-file-utils";
import { AnchorType, createDefaultAnchor } from "@models/anchor.types";
import { EntityType } from "@models/common.types";
import { createDefaultStage } from "@models/stage.types";
import { FileInfo } from "@utils/entity-scanner";

describe("entityId", () => {
  it("matches the pipeline id format", () => {
    expect(entityId("Octoio", EntityType.Stage, "TheVillage", 1)).toBe(
      "Octoio:Stage:TheVillage:1",
    );
  });
});

describe("entityFileName", () => {
  it("lowercases key and type", () => {
    expect(entityFileName(EntityType.Anchor, "TheFarmRallyZone")).toBe(
      "thefarmrallyzone.anchor.json",
    );
  });
});

describe("entityFilePath", () => {
  const files: FileInfo[] = [
    {
      name: "thevillage.stage.json",
      path: "stage/thevillage.stage.json",
      isEntity: true,
      entityType: EntityType.Stage,
    },
    {
      name: "thevillageportal.anchor.json",
      path: "anchor/thevillageportal.anchor.json",
      isEntity: true,
      entityType: EntityType.Anchor,
    },
  ];

  it("returns the existing file path when the entity already has a file", () => {
    expect(entityFilePath(files, EntityType.Stage, "TheVillage")).toBe(
      "stage/thevillage.stage.json",
    );
  });

  it("places new entities next to their siblings", () => {
    expect(entityFilePath(files, EntityType.Anchor, "TheSwampZone")).toBe(
      "anchor/theswampzone.anchor.json",
    );
  });

  it("falls back to a type-named directory when no sibling exists", () => {
    expect(entityFilePath([], EntityType.Stage, "TheSwamp")).toBe(
      "stage/theswamp.stage.json",
    );
  });
});

describe("definition factories", () => {
  it("creates a stage definition with a consistent id", () => {
    const definition = createStageDefinition("TheSwamp", createDefaultStage());
    expect(definition.type).toBe(EntityType.Stage);
    expect(definition.id).toBe("Octoio:Stage:TheSwamp:1");
    expect(definition.entity.anchors).toEqual([]);
  });

  it("creates an anchor definition with a consistent id", () => {
    const definition = createAnchorDefinition(
      "TheSwampZone",
      createDefaultAnchor(AnchorType.Zone),
    );
    expect(definition.type).toBe(EntityType.Anchor);
    expect(definition.id).toBe("Octoio:Anchor:TheSwampZone:1");
    expect(definition.entity.type).toBe(AnchorType.Zone);
  });

  it("builds an entity reference from a definition", () => {
    const definition = createAnchorDefinition(
      "TheSwampZone",
      createDefaultAnchor(AnchorType.Portal),
    );
    expect(referenceOf(definition, EntityType.Anchor)).toEqual({
      owner: "Octoio",
      type: EntityType.Anchor,
      key: "TheSwampZone",
      version: 1,
      id: "Octoio:Anchor:TheSwampZone:1",
    });
  });
});

describe("serializeDefinition", () => {
  it("pretty prints with two spaces and round-trips", () => {
    const definition = createStageDefinition("TheSwamp", createDefaultStage());
    const json = serializeDefinition(definition);
    expect(json).toContain("\n  \"owner\": \"Octoio\"");
    expect(JSON.parse(json)).toEqual(definition);
  });
});
