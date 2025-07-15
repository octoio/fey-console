import { describe, it, expect } from "vitest";
import {
  ShadowCastingMode,
  ALL_SHADOW_CASTING_MODES,
  ModelAnchorPosition,
  ALL_MODEL_ANCHOR_POSITIONS,
  ModelVariant,
  ALL_MODEL_VARIANTS,
} from "@models/model.types";

describe("model.types", () => {
  describe("ShadowCastingMode enum", () => {
    it("should have correct values", () => {
      expect(ShadowCastingMode.Off).toBe("Off");
      expect(ShadowCastingMode.On).toBe("On");
      expect(ShadowCastingMode.TwoSided).toBe("TwoSided");
      expect(ShadowCastingMode.ShadowsOnly).toBe("ShadowsOnly");
    });

    it("should have all values in ALL_SHADOW_CASTING_MODES", () => {
      expect(ALL_SHADOW_CASTING_MODES).toEqual([
        ShadowCastingMode.Off,
        ShadowCastingMode.On,
        ShadowCastingMode.TwoSided,
        ShadowCastingMode.ShadowsOnly,
      ]);
    });

    it("should have correct number of shadow casting modes", () => {
      expect(ALL_SHADOW_CASTING_MODES).toHaveLength(4);
    });
  });

  describe("ModelAnchorPosition enum", () => {
    it("should have correct number of anchor positions", () => {
      expect(ALL_MODEL_ANCHOR_POSITIONS).toHaveLength(23);
    });

    it("should include all anchor positions", () => {
      const expectedPositions = [
        "BackAnchor",
        "ChestAnchor",
        "EaringsAnchor",
        "EyesAnchor",
        "FaceAccessoryAnchor",
        "FootLeftAnchor",
        "FootRightAnchor",
        "ForearmLeftAnchor",
        "ForearmRightAnchor",
        "HandLeftAnchor",
        "HandRightAnchor",
        "HeadAnchor",
        "HipLeftAnchor",
        "HipRightAnchor",
        "LegsAnchor",
        "MainHandAnchor",
        "NeckAnchor",
        "None",
        "OffHandAnchor",
        "ShoulderLeftAnchor",
        "ShoulderRightAnchor",
        "TwoHandAnchor",
        "WaistAnchor",
      ];
      expect(ALL_MODEL_ANCHOR_POSITIONS).toEqual(expectedPositions);
    });

    it("should be sorted alphabetically", () => {
      const sortedPositions = [...ALL_MODEL_ANCHOR_POSITIONS].sort();
      expect(ALL_MODEL_ANCHOR_POSITIONS).toEqual(sortedPositions);
    });

    it("should have None position", () => {
      expect(ModelAnchorPosition.None).toBe("None");
      expect(ALL_MODEL_ANCHOR_POSITIONS).toContain(ModelAnchorPosition.None);
    });

    it("should have body anchor positions", () => {
      expect(ModelAnchorPosition.HeadAnchor).toBe("HeadAnchor");
      expect(ModelAnchorPosition.ChestAnchor).toBe("ChestAnchor");
      expect(ModelAnchorPosition.WaistAnchor).toBe("WaistAnchor");
      expect(ModelAnchorPosition.LegsAnchor).toBe("LegsAnchor");
    });

    it("should have hand anchor positions", () => {
      expect(ModelAnchorPosition.HandLeftAnchor).toBe("HandLeftAnchor");
      expect(ModelAnchorPosition.HandRightAnchor).toBe("HandRightAnchor");
      expect(ModelAnchorPosition.MainHandAnchor).toBe("MainHandAnchor");
      expect(ModelAnchorPosition.OffHandAnchor).toBe("OffHandAnchor");
      expect(ModelAnchorPosition.TwoHandAnchor).toBe("TwoHandAnchor");
    });
  });

  describe("ModelVariant enum", () => {
    it("should have correct values", () => {
      expect(ModelVariant.Primary).toBe("Primary");
      expect(ModelVariant.Sheathed).toBe("Sheathed");
    });

    it("should have all values in ALL_MODEL_VARIANTS", () => {
      expect(ALL_MODEL_VARIANTS).toEqual([
        ModelVariant.Primary,
        ModelVariant.Sheathed,
      ]);
    });

    it("should have correct number of model variants", () => {
      expect(ALL_MODEL_VARIANTS).toHaveLength(2);
    });
  });

  describe("Constants validation", () => {
    it("should have consistent enum values and arrays", () => {
      // Verify that ALL_* arrays contain exactly the enum values
      const shadowModeValues = Object.values(ShadowCastingMode);
      expect(ALL_SHADOW_CASTING_MODES).toEqual(shadowModeValues);

      const anchorPositionValues = Object.values(ModelAnchorPosition);
      const sortedAnchorValues = anchorPositionValues.sort();
      expect(ALL_MODEL_ANCHOR_POSITIONS).toEqual(sortedAnchorValues);

      const variantValues = Object.values(ModelVariant);
      expect(ALL_MODEL_VARIANTS).toEqual(variantValues);
    });

    it("should not have duplicate values in arrays", () => {
      const uniqueShadowModes = [...new Set(ALL_SHADOW_CASTING_MODES)];
      expect(uniqueShadowModes).toHaveLength(ALL_SHADOW_CASTING_MODES.length);

      const uniqueAnchorPositions = [...new Set(ALL_MODEL_ANCHOR_POSITIONS)];
      expect(uniqueAnchorPositions).toHaveLength(
        ALL_MODEL_ANCHOR_POSITIONS.length,
      );

      const uniqueVariants = [...new Set(ALL_MODEL_VARIANTS)];
      expect(uniqueVariants).toHaveLength(ALL_MODEL_VARIANTS.length);
    });
  });
});
