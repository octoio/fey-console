import {
  SkillEffectTargetMechanicType,
  CharacterTeam,
  SkillEffectTargetMechanicCircle,
  SkillEffectTargetMechanicRectangle,
  SkillEffectTargetMechanicSelf,
  SkillEffectTargetMechanicTeam,
  SkillEffectTargetMechanic,
  SkillEffectTargetMechanicSelected,
  SkillEffectTarget,
} from "@models/skill.types";

// Create a new target mechanic based on type
export const mapTargetMechanicChange = (
  value: SkillEffectTargetMechanicType,
): SkillEffectTargetMechanic => {
  switch (value) {
    case SkillEffectTargetMechanicType.Self:
      return {
        type: SkillEffectTargetMechanicType.Self,
      } as SkillEffectTargetMechanicSelf;

    case SkillEffectTargetMechanicType.Team:
      return {
        type: SkillEffectTargetMechanicType.Team,
        team: CharacterTeam.Ally,
      } as SkillEffectTargetMechanicTeam;

    case SkillEffectTargetMechanicType.Selected:
      return {
        type: SkillEffectTargetMechanicType.Selected,
      } as SkillEffectTargetMechanicSelected;

    case SkillEffectTargetMechanicType.Circle:
      return {
        type: SkillEffectTargetMechanicType.Circle,
        hit_count: 1,
        radius: 5,
      } as SkillEffectTargetMechanicCircle;

    case SkillEffectTargetMechanicType.Rectangle:
      return {
        type: SkillEffectTargetMechanicType.Rectangle,
        hit_count: 1,
        width: 5,
        height: 5,
      } as SkillEffectTargetMechanicRectangle;

    default:
      return {
        type: SkillEffectTargetMechanicType.Self,
      } as SkillEffectTargetMechanicSelf;
  }
};

// Get appropriate default target based on mechanic type
export const getDefaultTargetForMechanic = (
  mechanicType: SkillEffectTargetMechanicType,
): SkillEffectTarget => {
  switch (mechanicType) {
    case SkillEffectTargetMechanicType.Team:
      return SkillEffectTarget.Ally;
    case SkillEffectTargetMechanicType.Circle:
    case SkillEffectTargetMechanicType.Rectangle:
      return SkillEffectTarget.Enemy;
    case SkillEffectTargetMechanicType.Selected:
      return SkillEffectTarget.Any;
    default:
      return SkillEffectTarget.Enemy;
  }
};

// Create a complete default target configuration
export const createDefaultTargeting = (
  mechanicType: SkillEffectTargetMechanicType = SkillEffectTargetMechanicType.Self,
) => {
  return {
    target: getDefaultTargetForMechanic(mechanicType),
    target_mechanic: mapTargetMechanicChange(mechanicType),
  };
};
