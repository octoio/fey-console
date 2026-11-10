import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

// Where the tests find the game data (fey-rs/data/json). Tried in order: the FEY_JSON_DIR env variable,
// the fey-rs next to this checkout, then the one a level further up (this checkout is a branch worktree
// `<workspace>/<branch>/fey-console` and the data sits in `<workspace>/fey-rs`). The repo is public and may
// be cloned alone, so no data means the dependent tests skip, but the skip says where it looked.
const root = resolve(__dirname, "../..");
const candidates = [
  process.env.FEY_JSON_DIR,
  join(root, "../fey-rs/data/json"),
  join(root, "../../fey-rs/data/json"),
].filter((p): p is string => !!p);

export const SHIPPED_JSON_DIR: string | undefined =
  candidates.find(existsSync);

export const hasShippedData = SHIPPED_JSON_DIR !== undefined;

if (!hasShippedData) {
  console.warn(
    `Shipped-data tests are SKIPPED: no game data found. Tried: ${candidates.join(", ")} (set FEY_JSON_DIR to point at it).`,
  );
}

/** A test title that says so when the shipped data is missing and the test is skipped. */
export const shippedTitle = (title: string): string =>
  hasShippedData ? title : `${title} [SKIPPED: no shipped data, tried ${candidates.join(", ")}]`;
