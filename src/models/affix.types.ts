import { FloatRange } from "./common.types";
import { StatType } from "./stat.types";

/**
 * Represents a stat affix that can be applied to items
 * Provides a range of values for a specific stat
 */
export type StatAffix = {
  stat: StatType;
  value: FloatRange;
};
