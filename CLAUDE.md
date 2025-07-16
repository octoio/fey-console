# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the **Fey Game Development Ecosystem**, a comprehensive multi-project system for game asset management and development. The ecosystem consists of three integrated projects:

### 1. **fey-data** (OCaml Data Pipeline)
An OCaml-based data processing pipeline that validates JSON game data definitions, manages entity relationships, and generates type-safe C# code for Unity integration.

### 2. **fey-console** (React/TypeScript Management Interface)  
A modern web-based console for creating, editing, and managing game entities. Features entity-specific editors, multi-entity support, and comprehensive testing.

### 3. **fey-game-mock** (Unity Integration)
Unity project structure with generated C# scripts and StreamingAssets for game integration.

## Key Commands

### fey-data (OCaml Pipeline)

#### Environment Setup
```bash
cd fey-data
# Set up OCaml environment and dependencies
opam switch create . 5.2.0
eval $(opam env --set-switch)
opam install . --deps-only
```

#### Build & Run
```bash
# Build the project
dune build

# Run the main data processing pipeline
dune exec gamedata

# Run the web server interface
dune exec server
```

#### Testing
```bash
# Run all tests
dune runtest

# Run tests with coverage (if bisect_ppx is available)
dune runtest --instrument-with bisect_ppx

# Run comprehensive test suite with setup
fish test.fish

# Run specific test executable
dune exec test/test_gamedata.exe
```

#### Development Workflow
```bash
# Start file watcher for automatic rebuild on changes
fish watch.fish

# Clean build artifacts
dune clean
```

### fey-console (React/TypeScript Interface)

#### Environment Setup
```bash
cd fey-console
# Install dependencies
npm install
```

#### Build & Run
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate test coverage
npm run test:coverage
```

#### Development Workflow
```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Run all quality checks
npm run build && npm test
```

## Architecture

### Ecosystem Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   fey-console   │    │    fey-data     │    │  fey-game-mock  │
│  (Management)   │───▶│  (Processing)   │───▶│   (Unity Game)  │
│                 │    │                 │    │                 │
│ • Entity Editors│    │ • Validation    │    │ • Generated C#  │
│ • JSON Creation │    │ • C# Generation │    │ • StreamingAssets│
│ • File Manager  │    │ • Type Safety   │    │ • Game Integration│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### fey-data (OCaml Pipeline) Architecture

#### Core Data Flow
1. **JSON Input**: Game entity definitions from fey-console or direct files
2. **Processing Pipeline**: `processing.ml` orchestrates file scanning and validation
3. **Dataset Management**: `dataset.ml` manages entity definitions and error collection
4. **Validation**: `validate.ml` ensures data integrity and reference consistency
5. **C# Generation**: `lib/csharp/` modules generate Unity-compatible C# classes
6. **Output**: Generated files for fey-game-mock and entity indices

#### Key Modules
- **`processing.ml`**: Main pipeline orchestrator that processes JSON files
- **`dataset.ml`**: Core data structure for managing entity definitions and errors
- **`validate.ml`**: Validation logic for entity definitions and cross-references
- **`config.ml`**: Configuration constants for paths and namespaces
- **`lib/csharp/main.ml`**: C# code generation from ATD type definitions
- **`io.ml`**: File I/O operations and utilities
- **`server.ml`**: Web interface for the data pipeline

### fey-console (React Interface) Architecture

#### Navigation Flow
```
Landing Page → File Manager (Load Files/File List)
     ↓ (once files loaded)
Home Tab + Entity-Specific Editor Tabs
     ↓ (entity selection)
• Skills → Advanced Skill Editor (with execution trees)
• Others → Generic Entity Editor (forms + JSON preview)
```

#### Component Structure
```
src/components/
├── entity-editors/
│   ├── skill-editor/     # Advanced skill editor with execution trees
│   └── generic/          # Standard form-based editor for all other entities
├── file-manager/         # File loading and management
├── json-import-export/   # JSON operations and preview
└── common/              # Shared components
```

#### Key Features
- **Entity-Specific Routing**: Skills get advanced editor, others get generic forms
- **File Manager First**: Always loads file management interface before main navigation
- **Multi-Entity Support**: Handles all 16 entity types with appropriate interfaces
- **JSON Preview Only**: Read-only JSON viewing with copy-to-clipboard
- **Comprehensive Testing**: 1200+ tests with full coverage

### Entity System (Shared)
The system supports 16 game entity types defined in ATD files:
- **Combat**: Weapons, Characters, Skills, Equipment
- **Assets**: Audio, Animation, Model, Image
- **Systems**: Status effects, Quality definitions, Stats, Requirements
- **Utility**: Drop tables, Cursor definitions, Affixes

### File Naming Convention
JSON files must follow: `<name>.<type>.json`
- Example: `sword.weapon.json`, `hero.character.json`

## Configuration

### fey-data Configuration
Key paths configured in `config.ml`:
- JSON source: `../fey-game-mock/Assets/StreamingAssets/json/`
- C# output: `../fey-game-mock/Assets/Scripts/`
- Base namespace: `Octoio.Fey`
- Entity indices: `../fey-game-mock/Assets/StreamingAssets/entity-reference-indices.json`

### fey-console Configuration
Key configurations in TypeScript:
- Entity Types: 16 supported entity types with display names and descriptions
- Entity Store: Zustand-based state management for entity editing
- File Operations: FileSystem API integration for local file management
- Testing: Vitest with comprehensive coverage reporting

### Project Integration
- **fey-console** creates/edits JSON files
- **fey-data** processes and validates JSON files  
- **fey-data** generates C# code for **fey-game-mock**
- **fey-game-mock** contains generated assets and scripts

## Development Notes

### fey-data Development
#### Testing Strategy
- Unit tests for core modules in `test/` directory
- Integration tests for full pipeline
- Property-based testing with QCheck
- Coverage reporting with bisect_ppx

#### File Watching
The `watch.fish` script provides:
- Automatic OCaml environment setup
- File monitoring for JSON and OCaml changes
- Automatic test execution before build
- Filtered watching (excludes build artifacts)

#### Error Handling
The system provides comprehensive error reporting for:
- Invalid JSON structure
- Missing entity references
- Type mismatches
- Duplicate entity definitions
- Invalid file naming patterns

### fey-console Development
#### Testing Strategy
- **1200+ comprehensive tests** with Vitest
- Unit tests for all components and utilities
- Integration tests for multi-entity workflows
- Property-based testing for entity operations
- Snapshot testing for UI components
- **98%+ test coverage** requirement

#### Architecture Principles
- **Entity-Specific Editors**: Skills get advanced features, others get clean forms
- **Navigation Flow**: File Manager → Entity Selection → Appropriate Editor
- **Component Organization**: Clear separation between generic and specialized editors
- **State Management**: Zustand stores for predictable state updates
- **Type Safety**: Full TypeScript coverage with strict configuration

#### Quality Standards
- **Zero failing tests policy**: "no way we are publishing a commit with failing tests"
- Comprehensive TypeScript checking
- ESLint configuration for code quality
- Automated testing in CI/CD pipeline

### fey-game-mock Integration
#### Unity Integration
Generated C# files include:
- `[Serializable]` attributes for Unity
- Proper namespace organization (`Octoio.Fey.Data.Dto`)
- Type-safe property definitions
- Entity reference indices for runtime lookup

#### Asset Management
- **StreamingAssets**: JSON entity definitions and indices
- **Scripts**: Generated C# DTOs and entity classes
- **Integration**: Seamless data flow from console to game

### Multi-Project Workflow
1. **Create/Edit**: Use fey-console to create and edit entity definitions
2. **Process**: Run fey-data pipeline to validate and generate C# code
3. **Integrate**: Generated files automatically update fey-game-mock assets
4. **Test**: Comprehensive testing at each layer ensures data integrity

### Important Instructions
- **ALWAYS run tests before committing** - especially for fey-console changes
- **Use entity-specific editors appropriately** - Skills → Advanced Editor, Others → Generic Editor  
- **Follow naming conventions** - `<name>.<type>.json` for all entity files
- **Maintain test coverage** - New features require comprehensive tests
- **Respect component organization** - Keep skill-specific and generic components separated

### Additional Documentation
- **`MULTI_ENTITY_SUPPORT_MIGRATION_PLAN.md`**: Detailed migration plan and implementation progress for multi-entity support
- **Project READMEs**: Each sub-project has its own README with specific setup and usage instructions