import { describe, it, expect } from "vitest";
import { FileList } from "@components/file-list";
import { render } from "@testing-library/react";
import { FileInfo } from "@utils/entity-scanner";

const mockFiles: FileInfo[] = [
  {
    name: "fire-sword.json",
    path: "/weapons/fire-sword.json",
    isEntity: true,
    entityType: "Weapon",
  },
  {
    name: "heal-potion.json",
    path: "/items/heal-potion.json",
    isEntity: true,
    entityType: "Equipment",
  },
  {
    name: "fireball.json",
    path: "/skills/fireball.json",
    isEntity: true,
    entityType: "Skill",
  },
  {
    name: "config.json",
    path: "/config/config.json",
    isEntity: false,
  },
  {
    name: "readme.txt",
    path: "/docs/readme.txt",
    isEntity: false,
  },
];

describe("FileList Snapshots", () => {
  it("should match snapshot with standard file list", () => {
    const { container } = render(<FileList files={mockFiles} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot with empty file list", () => {
    const { container } = render(<FileList files={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot with single file", () => {
    const singleFile: FileInfo[] = [
      {
        name: "single-file.json",
        path: "/single-file.json",
        isEntity: true,
        entityType: "Weapon",
      },
    ];

    const { container } = render(<FileList files={singleFile} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot with files without entity types", () => {
    const nonEntityFiles: FileInfo[] = [
      {
        name: "config.json",
        path: "/config.json",
        isEntity: false,
      },
      {
        name: "settings.xml",
        path: "/settings.xml",
        isEntity: false,
      },
    ];

    const { container } = render(<FileList files={nonEntityFiles} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot with mixed file types", () => {
    const mixedFiles: FileInfo[] = [
      {
        name: "weapon.json",
        path: "/weapons/weapon.json",
        isEntity: true,
        entityType: "Weapon",
      },
      {
        name: "data.csv",
        path: "/data/data.csv",
        isEntity: false,
      },
      {
        name: "script.js",
        path: "/scripts/script.js",
        isEntity: false,
      },
      {
        name: "style.css",
        path: "/assets/style.css",
        isEntity: false,
      },
    ];

    const { container } = render(<FileList files={mixedFiles} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
