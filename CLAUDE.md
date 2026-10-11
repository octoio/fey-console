# fey-console - agent guide

React/TypeScript/Vite editor (Ant Design, ReactFlow, Zustand, Vitest) for Fey's entity JSON (`<name>.<type>.json`). The data types come from the ATD schemas of `../fey-data`; the JSON lives in `../fey/Assets/StreamingAssets/json`. Overview: [`README.md`](README.md).

## Commands
```sh
npm test             # vitest --run
npm run lint         # eslint (0 errors required; existing no-explicit-any warnings are known)
npm run build        # vite build
npm run test:coverage
```

## Rules
- **Zero failing tests.** Run `npm test` and `npm run lint` before every commit.
- Public repo: no personal details, absolute home paths or licensed content names (vendor names only).

## Adding an entity type (console side)
Schema first in `../fey-data` (see its `CLAUDE.md`), then here:
- `src/models/common.types.ts`: add to the `EntityType` enum; add a `src/models/<name>.types.ts` model.
- `test/app.test.tsx` hardcodes the entity type count ("Entities: N"): bump it.
- Polymorphic parts (node types) live in `src/components/nodetypes/`; entity pickers in `src/components/node-common/`; the folder scan in `src/utils/entity-scanner.ts`.
