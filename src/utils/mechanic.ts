import {
  EffectTargetMechanicType,
  CharacterTeam,
  EffectTargetMechanicCircle,
  EffectTargetMechanicRectangle,
  EffectTargetMechanicSelf,
  EffectTargetMechanicTeam,
  EffectTargetMechanic,
  EffectTargetMechanicSelected,
  EffectTarget,
} from "@models/effect.types";

// Create a new target mechanic based on type
export const mapTargetMechanicChange = (
  value: EffectTargetMechanicType,
): EffectTargetMechanic => {
  switch (value) {
    case EffectTargetMechanicType.Self:
      return {
        type: EffectTargetMechanicType.Self,
      } as EffectTargetMechanicSelf;

    case EffectTargetMechanicType.Team:
      return {
        type: EffectTargetMechanicType.Team,
        team: CharacterTeam.Ally,
      } as EffectTargetMechanicTeam;

    case EffectTargetMechanicType.Selected:
      return {
        type: EffectTargetMechanicType.Selected,
      } as EffectTargetMechanicSelected;

    case EffectTargetMechanicType.Circle:
      return {
        type: EffectTargetMechanicType.Circle,
        hit_count: 1,
        radius: 5,
      } as EffectTargetMechanicCircle;

    case EffectTargetMechanicType.Rectangle:
      return {
        type: EffectTargetMechanicType.Rectangle,
        hit_count: 1,
        width: 5,
        height: 5,
      } as EffectTargetMechanicRectangle;

    default:
      return {
        type: EffectTargetMechanicType.Self,
      } as EffectTargetMechanicSelf;
  }
};

// Get appropriate default target based on mechanic type
export const getDefaultTargetForMechanic = (
  mechanicType: EffectTargetMechanicType,
): EffectTarget => {
  switch (mechanicType) {
    case EffectTargetMechanicType.Team:
      return EffectTarget.Ally;
    case EffectTargetMechanicType.Circle:
    case EffectTargetMechanicType.Rectangle:
      return EffectTarget.Enemy;
    case EffectTargetMechanicType.Selected:
      return EffectTarget.Any;
    default:
      return EffectTarget.Enemy;
  }
};

// Create a complete default target configuration
export const createDefaultTargeting = (
  mechanicType: EffectTargetMechanicType = EffectTargetMechanicType.Self,
) => {
  return {
    target: getDefaultTargetForMechanic(mechanicType),
    target_mechanic: mapTargetMechanicChange(mechanicType),
  };
};
