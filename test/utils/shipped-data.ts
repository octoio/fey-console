import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

// Where the tests find sibling checkouts (the game data in fey-rs, the schemas in fey-data). Tried in
// order: an env variable, the sibling next to this checkout, then the one a level further up (this
// checkout is a branch worktree `<workspace>/<branch>/fey-console` and the siblings sit in `<workspace>`).
// The repo is public and may be cloned alone, so nothing found means the dependent tests skip, but the
// skip says where it looked.
const root = resolve(__dirname, "../..");

const locate = (envVar: string | undefined, rel: string) => {
  const candidates = [envVar, join(root, "..", rel), join(root, "../..", rel)].filter(
    (p): p is string => !!p,
  );
  return { found: candidates.find(existsSync), candidates };
};

const json = locate(process.env.FEY_JSON_DIR, "fey-rs/data/json");
const generatorAtd = locate(
  process.env.FEY_DATA_DIR && join(process.env.FEY_DATA_DIR, "lib/data/generator.atd"),
  "fey-data/lib/data/generator.atd",
);

export const SHIPPED_JSON_DIR: string | undefined = json.found;
export const GENERATOR_ATD: string | undefined = generatorAtd.found;

export const hasShippedData = SHIPPED_JSON_DIR !== undefined;
export const hasGeneratorAtd = GENERATOR_ATD !== undefined;

if (!hasShippedData) {
  console.warn(
    `Shipped-data tests are SKIPPED: no game data found. Tried: ${json.candidates.join(", ")} (set FEY_JSON_DIR to point at it).`,
  );
}
if (!hasGeneratorAtd) {
  console.warn(
    `The anchor-slot test is SKIPPED: no generator.atd found. Tried: ${generatorAtd.candidates.join(", ")} (set FEY_DATA_DIR to the fey-data checkout).`,
  );
}

/** A test title that says so when the shipped data is missing and the test is skipped. */
export const shippedTitle = (title: string): string =>
  hasShippedData ? title : `${title} [SKIPPED: no shipped data, tried ${json.candidates.join(", ")}]`;

/** Like shippedTitle, for the fey-data schema file. */
export const generatorAtdTitle = (title: string): string =>
  hasGeneratorAtd
    ? title
    : `${title} [SKIPPED: no generator.atd, tried ${generatorAtd.candidates.join(", ")}]`;
