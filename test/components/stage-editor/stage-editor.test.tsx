import { describe, it, expect, vi, beforeEach } from "vitest";
import { StageEditor } from "@components/stage-editor";
import {
  createAnchorDefinition,
  createStageDefinition,
  serializeDefinition,
} from "@components/stage-editor/stage-file-utils";
import { AnchorType, createDefaultAnchor } from "@models/anchor.types";
import { EntityType, getDefaultEntityReferences } from "@models/common.types";
import { createDefaultStage } from "@models/stage.types";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { FileInfo } from "@utils/entity-scanner";
import { fileUtils } from "@utils/file-utils";

const mockNotification = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  open: vi.fn(),
  destroy: vi.fn(),
};

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    App: Object.assign(actual.App, {
      useApp: () => ({
        notification: mockNotification,
        message: { success: vi.fn(), error: vi.fn() },
        modal: { confirm: vi.fn() },
      }),
    }),
  };
});

vi.mock("@utils/file-utils", () => ({
  fileUtils: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    requestDirectoryHandle: vi.fn(),
    navigateToDirectory: vi.fn(),
  },
}));

const mockReadFile = vi.mocked(fileUtils.readFile);
const mockWriteFile = vi.mocked(fileUtils.writeFile);

const directoryHandle = {} as FileSystemDirectoryHandle;

const villageStage = createStageDefinition("TheVillage", {
  ...createDefaultStage(),
  scene_name: "Scenes/TheVillage/TheVillage",
  anchors: [
    {
      owner: "Octoio",
      type: EntityType.Anchor,
      key: "TheVillagePortal",
      version: 1,
      id: "Octoio:Anchor:TheVillagePortal:1",
    },
  ],
});

const villagePortal = createAnchorDefinition(
  "TheVillagePortal",
  createDefaultAnchor(AnchorType.Portal),
);

const stageFiles: FileInfo[] = [
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

const renderEditor = (files: FileInfo[] = stageFiles) =>
  render(
    <StageEditor
      entityReferences={getDefaultEntityReferences()}
      files={files}
      directoryHandle={directoryHandle}
    />,
  );

describe("StageEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty state until a stage is opened", () => {
    renderEditor();
    expect(
      screen.getByText("Open a stage file or create a new stage"),
    ).toBeInTheDocument();
  });

  it("creates a new stage from a key", async () => {
    renderEditor();

    fireEvent.change(
      screen.getByPlaceholderText("New stage key (e.g. TheSwamp)"),
      { target: { value: "TheSwamp" } },
    );
    fireEvent.click(screen.getByText("Create Stage"));

    await waitFor(() => {
      expect(screen.getByText("Stage: TheSwamp")).toBeInTheDocument();
    });
    expect(screen.getByText("No anchors in this stage")).toBeInTheDocument();
  });

  it("loads a stage and its anchors from disk", async () => {
    mockReadFile.mockImplementation(async (_handle, path) => {
      if (path === "stage/thevillage.stage.json")
        return serializeDefinition(villageStage);
      if (path === "anchor/thevillageportal.anchor.json")
        return serializeDefinition(villagePortal);
      throw new Error(`Unexpected read: ${path}`);
    });

    renderEditor();

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Stage file" }));
    fireEvent.click(screen.getByText("thevillage.stage.json"));

    await waitFor(() => {
      expect(screen.getByText("Stage: TheVillage")).toBeInTheDocument();
    });
    expect(screen.getByText("TheVillagePortal")).toBeInTheDocument();
    expect(screen.getByText("Anchors (1)")).toBeInTheDocument();
  });

  it("adds an anchor to a new stage", async () => {
    renderEditor();

    fireEvent.change(
      screen.getByPlaceholderText("New stage key (e.g. TheSwamp)"),
      { target: { value: "TheSwamp" } },
    );
    fireEvent.click(screen.getByText("Create Stage"));
    await waitFor(() => {
      expect(screen.getByText("Stage: TheSwamp")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("New anchor key"), {
      target: { value: "TheSwampZone" },
    });
    fireEvent.click(screen.getByText("Add Anchor"));

    await waitFor(() => {
      expect(screen.getByText("TheSwampZone")).toBeInTheDocument();
    });
    expect(screen.getByText("not saved yet")).toBeInTheDocument();
    // Default anchor type is Zone, so zone fields are editable
    expect(
      screen.getByRole("spinbutton", { name: "TheSwampZone zone radius" }),
    ).toBeInTheDocument();
  });

  it("saves the stage and all anchors to disk", async () => {
    renderEditor([]);

    fireEvent.change(
      screen.getByPlaceholderText("New stage key (e.g. TheSwamp)"),
      { target: { value: "TheSwamp" } },
    );
    fireEvent.click(screen.getByText("Create Stage"));
    await waitFor(() => {
      expect(screen.getByText("Stage: TheSwamp")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("New anchor key"), {
      target: { value: "TheSwampZone" },
    });
    fireEvent.click(screen.getByText("Add Anchor"));

    fireEvent.click(screen.getByText("Save Stage & Anchors"));

    await waitFor(() => {
      expect(mockWriteFile).toHaveBeenCalledTimes(2);
    });
    expect(mockWriteFile).toHaveBeenCalledWith(
      directoryHandle,
      "stage/theswamp.stage.json",
      expect.stringContaining("\"key\": \"TheSwamp\""),
    );
    expect(mockWriteFile).toHaveBeenCalledWith(
      directoryHandle,
      "anchor/theswampzone.anchor.json",
      expect.stringContaining("\"key\": \"TheSwampZone\""),
    );

    // The saved stage must reference the anchor
    const stageJson = JSON.parse(
      mockWriteFile.mock.calls.find(
        (call) => call[1] === "stage/theswamp.stage.json",
      )?.[2] as string,
    );
    expect(stageJson.entity.anchors).toEqual([
      {
        owner: "Octoio",
        type: EntityType.Anchor,
        key: "TheSwampZone",
        version: 1,
        id: "Octoio:Anchor:TheSwampZone:1",
      },
    ]);

    expect(mockNotification.success).toHaveBeenCalled();
  });

  it("removes an anchor and its stage reference", async () => {
    renderEditor([]);

    fireEvent.change(
      screen.getByPlaceholderText("New stage key (e.g. TheSwamp)"),
      { target: { value: "TheSwamp" } },
    );
    fireEvent.click(screen.getByText("Create Stage"));
    await waitFor(() => {
      expect(screen.getByText("Stage: TheSwamp")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("New anchor key"), {
      target: { value: "TheSwampZone" },
    });
    fireEvent.click(screen.getByText("Add Anchor"));
    await waitFor(() => {
      expect(screen.getByText("TheSwampZone")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Remove"));

    await waitFor(() => {
      expect(screen.queryByText("TheSwampZone")).not.toBeInTheDocument();
    });
    expect(screen.getByText("No anchors in this stage")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Save Stage & Anchors"));
    await waitFor(() => {
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
    });
    const stageJson = JSON.parse(mockWriteFile.mock.calls[0][2] as string);
    expect(stageJson.entity.anchors).toEqual([]);
  });

  it("warns when adding a duplicate anchor key", async () => {
    renderEditor([]);

    fireEvent.change(
      screen.getByPlaceholderText("New stage key (e.g. TheSwamp)"),
      { target: { value: "TheSwamp" } },
    );
    fireEvent.click(screen.getByText("Create Stage"));
    await waitFor(() => {
      expect(screen.getByText("Stage: TheSwamp")).toBeInTheDocument();
    });

    for (let i = 0; i < 2; i++) {
      fireEvent.change(screen.getByPlaceholderText("New anchor key"), {
        target: { value: "TheSwampZone" },
      });
      fireEvent.click(screen.getByText("Add Anchor"));
    }

    await waitFor(() => {
      expect(mockNotification.warning).toHaveBeenCalledWith({
        message: "Anchor TheSwampZone is already in the stage",
      });
    });
    expect(screen.getByText("Anchors (1)")).toBeInTheDocument();
  });
});
