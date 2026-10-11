import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrefabEditor } from "@components/prefab-editor";
import { StageEditor } from "@components/stage-editor";


import { EntityType, getDefaultEntityReferences } from "@models/common.types";
import { usePrefabStore } from "@store/prefab.store";
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
    deleteFile: vi.fn(),
  },
}));

const mockDelete = vi.mocked(fileUtils.deleteFile);
const mockReadFile = vi.mocked(fileUtils.readFile);
const mockWriteFile = vi.mocked(fileUtils.writeFile);

const directoryHandle = {} as FileSystemDirectoryHandle;


const prefabFile: FileInfo = {
  name: "crypttest.roomprefab.json",
  path: "roomprefab/crypttest.roomprefab.json",
  isEntity: true,
  entityType: EntityType.RoomPrefab,
};

const prefabJson = JSON.stringify({
  owner: "Octoio",
  type: "RoomPrefab",
  key: "CryptTest",
  version: 1,
  id: "Octoio:RoomPrefab:CryptTest:1",
  entity: {
    metadata: { title: "T", description: "" },
    generator: "Crypt",
    prefab_id: "crypt.test",
    size: { x: 30, z: 30 },
    door_band: 2,
    obstacles: [{ kind: "Pillar", x: 5, z: 5, shape: "Circle", radius: 1 }],
    slots: [{ slot: "Shrine", x: 0, z: 0 }],
  },
});

describe("PrefabEditor", { timeout: 30000 }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePrefabStore.getState().close();
  });

  it("opens a prefab file and draws it", async () => {
    mockReadFile.mockResolvedValue(prefabJson);
    render(<PrefabEditor files={[prefabFile]} directoryHandle={directoryHandle} />);
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Room prefab file" }));
    fireEvent.click(screen.getByText("crypttest.roomprefab.json"));
    await waitFor(() =>
      expect(screen.getByText("Room prefab: CryptTest")).toBeInTheDocument(),
    );
    expect(screen.getByTestId("obstacle-0")).toBeInTheDocument();
    expect(screen.getByTestId("slot-0")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Room canvas" })).toBeInTheDocument();
  });

  it("creates, edits and saves a prefab", async () => {
    render(<PrefabEditor files={[]} directoryHandle={directoryHandle} />);
    fireEvent.change(screen.getByPlaceholderText("New prefab key (e.g. CryptHollowNest)"), {
      target: { value: "CryptNew" },
    });
    fireEvent.click(screen.getByText("Create Prefab"));
    await waitFor(() => expect(screen.getByText("Room prefab: CryptNew")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Add Pillar"));
    expect(screen.getByTestId("obstacle-0")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Save Room Prefab"));
    await waitFor(() => expect(mockWriteFile).toHaveBeenCalledTimes(1));
    expect(mockWriteFile).toHaveBeenCalledWith(
      directoryHandle,
      "roomprefab/cryptnew.roomprefab.json",
      expect.stringContaining("\"type\": \"RoomPrefab\""),
    );
  });

  it("shows live problems for a bad prefab id", async () => {
    usePrefabStore.getState().create("Bad");
    usePrefabStore.getState().updatePrefab({ prefab_id: "Bad Id" });
    render(<PrefabEditor files={[]} directoryHandle={directoryHandle} />);
    expect(screen.getByText(/prefab_id must be lower case/)).toBeInTheDocument();
  });

  it("deletes the prefab file", async () => {
    mockReadFile.mockResolvedValue(prefabJson);
    render(<PrefabEditor files={[prefabFile]} directoryHandle={directoryHandle} />);
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Room prefab file" }));
    fireEvent.click(screen.getByText("crypttest.roomprefab.json"));
    await waitFor(() => screen.getByText("Room prefab: CryptTest"));
    fireEvent.click(screen.getByText("Delete"));
    fireEvent.click(await screen.findByText("OK"));
    await waitFor(() =>
      expect(mockDelete).toHaveBeenCalledWith(directoryHandle, "roomprefab/crypttest.roomprefab.json"),
    );
  });
});

describe("StageEditor generator", { timeout: 30000 }, () => {
  beforeEach(() => vi.clearAllMocks());

  const open = async () => {
    render(
      <StageEditor
        entityReferences={getDefaultEntityReferences()}
        files={[]}
        directoryHandle={directoryHandle}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("New stage key (e.g. TheSwamp)"), {
      target: { value: "TheSwamp" },
    });
    fireEvent.click(screen.getByText("Create Stage"));
    await waitFor(() => screen.getByText("Stage: TheSwamp"));
  };

  it("adds a generator, validates it live and saves it", async () => {
    await open();
    fireEvent.click(screen.getByText("Add Generator"));
    expect(screen.getByText("spec checks pass")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("spinbutton", { name: "Par boss path min" }), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Par boss path max" }), {
      target: { value: "150" },
    });
    await waitFor(() =>
      expect(
        screen.getByText("par boss_path [200, 150]: needs 0 <= min <= max"),
      ).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "Main path max" }), {
      target: { value: "1" },
    });
    await waitFor(() =>
      expect(screen.getByText(/main path \[7, 1\] must be at least 2 rooms/)).toBeInTheDocument(),
    );
    expect(screen.getByRole("img", { name: "Requirements schematic" })).toBeInTheDocument();

    fireEvent.click(screen.getByText("Save Stage & Anchors"));
    await waitFor(() => expect(mockWriteFile).toHaveBeenCalled());
    const text = mockWriteFile.mock.calls[0][2] as string;
    const saved = JSON.parse(text);
    expect(saved.entity.generator.version).toBe(2);
    expect(saved.entity.generator.par).toEqual({ boss_path: { min: 200, max: 150 } });
  });

  it("asks for a binding on every anchor of a generated stage", async () => {
    await open();
    fireEvent.click(screen.getByText("Add Generator"));
    fireEvent.change(screen.getByPlaceholderText("New anchor key"), {
      target: { value: "SwampPack" },
    });
    fireEvent.click(screen.getByText("Add Anchor"));
    await waitFor(() =>
      expect(
        screen.getByText("anchor SwampPack: no binding on a stage with a generator"),
      ).toBeInTheDocument(),
    );
  });

  it("adds a requirement", async () => {
    await open();
    fireEvent.click(screen.getByText("Add Generator"));
    fireEvent.click(screen.getByText("Add Requirement"));
    expect(screen.getByText("Requirements (3)")).toBeInTheDocument();
  });
});
