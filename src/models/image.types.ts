import { Size } from "./common.types";

export enum ImageType {
  Texture = "Texture",
  Sprite = "Sprite",
}

export const ALL_IMAGE_TYPES: ImageType[] = Object.values(ImageType);

export type Image = {
  type: ImageType;
  path: string; // image/*.png
  size: Size;
};
