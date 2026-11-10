import { EntityReference } from "./common.types";

export type AudioClip = {
  path: string; // audio/*.mp3
  /** Multiplied into the volume of the sound that plays it. */
  relative_volume: number;
};

export type Sound = {
  audio_references: EntityReference[]; // AudioClip, min 1
  /** 0 for 2D, 1 for full 3D spatial. */
  spatial_blend: number;
  volume: number;
  /** The pack sample base the client plays for this sound; absent = the client's own sound for the key. */
  pack_sample?: string;
};

export type SoundBank = {
  hit_miss: EntityReference; // Sound
  item_received: EntityReference;
  gold_received: EntityReference;
  level_up: EntityReference;
  menu_open: EntityReference;
  menu_close: EntityReference;
  equipped: EntityReference;
  message: EntityReference;
};
