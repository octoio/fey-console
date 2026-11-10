// Visual effects named by skills, projectiles and statuses (vfx.atd). Presentation only: the
// simulation never reads them. A key is lowercase words joined by "-", groups joined by "/"
// ("fire/gather"); the client owns the recipe behind each key.

export enum VfxElement {
  Physical = "Physical",
  Fire = "Fire",
  Frost = "Frost",
  Arcane = "Arcane",
  Poison = "Poison",
  Holy = "Holy",
  Heal = "Heal",
  Nature = "Nature",
  Void = "Void",
}

export const ALL_VFX_ELEMENTS: VfxElement[] = Object.values(VfxElement);

/** Effects of a skill by phase; `element` is the colour family of all of them. */
export type SkillVfx = {
  element: VfxElement;
  /** On the caster from the start of the cast until it lands. */
  cast?: string;
  /** On the caster at the landing tick. */
  release?: string;
  /** On every character the skill hits. */
  impact?: string;
  /** On the ground over the telegraphed area when it lands. */
  area?: string;
};

/** Effects of a projectile, coloured by the element of the skill that fired it. */
export type ProjectileVfx = {
  body?: string;
  trail?: string;
  impact?: string;
};

/** The effect on a character while it has the status. */
export type StatusVfx = {
  element: VfxElement;
  effect: string;
};
