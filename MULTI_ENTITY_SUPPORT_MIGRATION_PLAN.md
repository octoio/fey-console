# Multi-Entity Support Migration Plan

## Executive Summary

This document outlines a step-by-step plan to transform the current Skill Editor into a Multi-Entity Console (fey-console) that can handle all 16 entity types defined in the Fey game system. The migration follows a clear architectural vision where Skills get specialized editors while other entities use generic forms, with a proper navigation flow from file loading to entity editing.

## Table of Contents

1. [Architectural Vision](#architectural-vision)
2. [Current State Analysis](#current-state-analysis)
3. [Target Architecture](#target-architecture)
4. [Migration Steps](#migration-steps)
5. [Component Organization](#component-organization)
6. [Testing Strategy](#testing-strategy)
7. [Future Extensibility](#future-extensibility)

## Architectural Vision

### Core Principles

1. **Navigation Flow**: Landing Page → File Manager → Home + Entity-specific Editors
2. **Entity-Specific Editors**: Only Skills get advanced/custom editors (like execution tree)
3. **Generic Forms**: All other entities use standardized forms with JSON preview
4. **Component Organization**: Clear structure for future extensibility (3D model viewers, stat calculators, etc.)
5. **Server-Ready**: Architecture prepared for future server connectivity and bundles

### User Experience Flow

```
Landing Page
    ↓
File Manager (Load Files + File List tabs)
    ↓ (once files loaded)
Home Tab + Entity-Specific Editor Tabs
    ↓ (entity selection)
• Skills → Advanced Skill Editor (execution trees, visual editor)
• Others → Generic Entity Editor (forms + JSON preview)
```

### Key Requirements

- File Manager and Advanced Skill Editor should NOT always be visible
- Advanced Skill Editor only appears when Skills entity is selected
- Generic Entity Editor handles all other 15 entity types
- JSON functionality is primarily for viewing/previewing
- Component structure organized for future custom editors per entity type

## Current State Analysis

### What Works
- ✅ Robust skill editing with execution trees and visual editor
- ✅ Comprehensive testing (1200+ tests)
- ✅ File scanning and entity detection
- ✅ JSON import/export functionality
- ✅ TypeScript type safety
- ✅ Zustand state management

### What Needs Change
- ❌ Always-visible File Manager and Advanced Skill Editor tabs
- ❌ Skill-specific navigation that doesn't scale
- ❌ No generic entity editing capability
- ❌ Component organization not structured for multi-entity support

## Target Architecture

### Navigation Structure

```
App.tsx (Main Container)
├── When !filesLoaded:
│   └── File Manager Interface
│       ├── Load Files Tab (FolderSelector)
│       └── File List Tab (FileList)
├── When filesLoaded:
│   ├── Home Tab (EntitySelector)
│   └── Entity-Specific Tabs (conditional):
│       ├── Skills → Advanced Skill Editor
│       └── Others → Generic Entity Editor
```

### Component Organization

```
src/components/
├── file-manager/              # File loading and management
│   ├── folder-selector.tsx
│   └── file-list.tsx
├── entity-selector.tsx        # Home dashboard for entity selection
├── entity-editors/
│   ├── skill-editor/          # Advanced skill editing (existing)
│   │   ├── skill-editor.tsx
│   │   ├── execution-tree-editor.tsx
│   │   ├── skill-form/
│   │   └── node-common/
│   └── generic/               # Generic entity editing
│       ├── generic-entity-editor.tsx
│       ├── entity-definition-form.tsx
│       ├── entity-metadata-form.tsx
│       └── json-viewer.tsx
├── json-import-export/        # JSON operations
└── navigation/                # Future navigation components
```

### Supported Entity Types

**Skills (Advanced Editor):**
- ✅ Skill - Full execution tree editor, visual editor, advanced forms

**Generic Editor (15 entities):**
- 🔄 Weapon, Equipment, Character, Model, Image, Status, DropTable
- 🔄 Sound, AudioClip, SoundBank, Animation, AnimationSource
- 🔄 Cursor, Stat, Quality

All generic entities get:
- Entity definition form (owner, key, version, type)
- Entity metadata form (title, description)
- JSON preview (read-only)
- JSON import/export functionality

## Migration Steps

### Step 1: Component Reorganization (1-2 days)

**Goal**: Organize components for multi-entity support without breaking existing functionality

**Actions**:
1. Create `src/components/entity-editors/` directory
2. Move existing skill components to `src/components/entity-editors/skill-editor/`
3. Create `src/components/entity-editors/generic/` directory
4. Create `src/components/file-manager/` directory
5. Update import paths in all files

**Testing**: Can temporarily delete and recreate tests after component moves

### Step 2: Create Generic Entity Types (1 day)

**Goal**: Define generic entity structure for non-skill entities

**Actions**:
1. Create `src/models/entity.types.ts` with:
   - `EntityType` enum (16 types)
   - `SimpleEntity` interface (basic entity structure)
   - `EntityDefinition<T>` generic type
   - `createEmptyEntity()` utility function
   - Display names and descriptions for all entity types

**Testing**: Unit tests for entity type utilities

### Step 3: Create Generic Entity Store (1 day)

**Goal**: Generic Zustand store for non-skill entities

**Actions**:
1. Create `src/store/entity.store.ts` with:
   - Generic entity state management
   - CRUD operations for entities
   - JSON import/export functionality
   - Entity validation

**Testing**: Unit tests for store operations

### Step 4: Create Entity Selector Component (1 day)

**Goal**: Home dashboard for entity type selection

**Actions**:
1. Create `src/components/entity-selector.tsx` with:
   - Grid layout showing all 16 entity types
   - Cards with entity type icons and descriptions
   - onClick handler to select entity type

**Testing**: Component tests for entity selection

### Step 5: Create Generic Entity Editor (2 days)

**Goal**: Generic editor for all non-skill entities

**Actions**:
1. Create `src/components/entity-editors/generic/generic-entity-editor.tsx` with:
   - Tabs: Entity Definition, Entity Metadata, JSON Preview, JSON Import/Export
   - Forms for basic entity properties
   - Integration with generic entity store

**Testing**: Component tests for generic editing

### Step 6: Update App Navigation (1 day)

**Goal**: Implement correct navigation flow

**Actions**:
1. Update `src/app.tsx` to:
   - Show File Manager when !filesLoaded
   - Show Home + Entity-specific tabs when filesLoaded
   - Conditionally show Advanced Skill Editor or Generic Editor
   - Remove always-visible tabs

**Testing**: Integration tests for navigation flow

### Step 7: Update Tests (2-3 days)

**Goal**: Ensure comprehensive test coverage

**Actions**:
1. Fix/update all existing tests to work with new structure
2. Add tests for new generic components
3. Add integration tests for multi-entity workflows
4. Ensure >90% test coverage maintained

**Testing**: Full test suite running and passing

### Step 8: Polish and Documentation (1 day)

**Goal**: Final cleanup and documentation

**Actions**:
1. Update README with new architecture
2. Update CLAUDE.md with navigation flow
3. Fix any remaining TypeScript errors
4. Performance and bundle size optimization

**Testing**: Final QA and smoke tests

## Component Organization

### Final Directory Structure

```
src/components/
├── file-manager/              # File loading and management
│   ├── folder-selector.tsx    # Select directories
│   └── file-list.tsx          # Display loaded files
├── entity-selector.tsx        # Home dashboard for entity type selection
├── entity-editors/
│   ├── skill-editor/          # Advanced skill editing (keep existing)
│   │   ├── skill-editor.tsx
│   │   ├── execution-tree-editor.tsx
│   │   ├── skill-form/
│   │   │   ├── basic-info-form.tsx
│   │   │   ├── cast-distance-section.tsx
│   │   │   ├── entity-definition-section.tsx
│   │   │   ├── icon-reference-section.tsx
│   │   │   ├── indicators-section.tsx
│   │   │   └── skill-properties-section.tsx
│   │   ├── skill-properties-form.tsx
│   │   ├── node-common/        # Node editing components
│   │   └── nodetypes/          # Execution tree node types
│   └── generic/               # Generic entity editing
│       ├── generic-entity-editor.tsx
│       ├── entity-definition-form.tsx
│       ├── entity-metadata-form.tsx
│       └── json-viewer.tsx
├── json-import-export/        # JSON operations (keep existing)
├── common/                    # Shared components
└── navigation/                # Future navigation components
```

### Key Implementation Details

**Entity Selector Grid Layout**:
- 4x4 grid of entity type cards
- Each card shows entity type icon, name, and description
- Click handler selects entity type and opens appropriate editor

**Generic Entity Editor Tabs**:
- **Entity Definition**: Owner, key, version, type selection
- **Entity Metadata**: Title, description (if entity has metadata)
- **JSON Preview**: Read-only formatted JSON view
- **JSON Import/Export**: Full JSON editing and file operations

**Navigation Logic**:
- `isFilesLoaded` determines File Manager vs Main interface
- `selectedEntityType` determines which editor tab to show
- Skills → Advanced Skill Editor
- All others → Generic Entity Editor

## Testing Strategy

### During Component Reorganization (Step 1)

**Option A: Temporary Test Deletion**
- Delete existing test files during component moves
- Recreate tests after reorganization is complete
- Faster development, but temporary loss of test coverage

**Option B: Parallel Test Updates**
- Update import paths in tests as components are moved
- Maintain test coverage throughout reorganization
- Slower development, but continuous coverage

**Recommendation**: Use Option A for speed, then recreate comprehensive tests

### Test Coverage Requirements

**Unit Tests**:
- Entity type utilities (display names, entity creation)
- Generic entity store operations
- Component rendering and user interactions
- Form validation and error handling

**Integration Tests**:
- File loading → Entity selection → Editor opening
- Entity creation → Editing → Saving workflows
- Skills → Advanced Editor vs Others → Generic Editor
- JSON import/export functionality

**Test Structure**:
```
test/
├── components/
│   ├── entity-editors/
│   │   ├── skill-editor/      # Keep existing skill tests
│   │   └── generic/           # New generic editor tests
│   ├── entity-selector.test.tsx
│   └── file-manager/
├── store/
│   ├── entity.store.test.ts   # Generic entity store tests
│   └── skill.store.test.ts    # Keep existing skill store tests
├── models/
│   └── entity.types.test.ts   # Entity type utilities
└── integration/
    └── multi-entity-workflows.test.tsx
```

### Test Quality Standards

- Maintain >90% test coverage
- All new components must have comprehensive tests
- Integration tests for all major workflows
- "No way we are publishing a commit with failing tests"

## Future Extensibility

### Planned Custom Entity Editors

The generic editor provides a solid foundation, but some entities will benefit from specialized editors:

**Character Editor Extensions**:
- Interactive stat point allocation
- Skill tree visualization
- Equipment slot management
- 3D model preview

**Model Editor Extensions**:
- 3D model viewer/preview
- File upload functionality
- Model anchor point editor
- Animation preview

**DropTable Editor Extensions**:
- Visual probability editor
- Drag-and-drop item assignment
- Probability calculation previews
- Loot simulation testing

**Stat Editor Extensions**:
- Calculation formula editor
- Stat relationship visualization
- Balance testing tools

### Server Integration Preparation

**Bundle Management**:
- Entity selection for bundles
- Server-side validation
- Bundle conflict resolution
- Multi-user collaboration

**Server API Integration**:
- Entity synchronization
- Version control for entities
- Collaborative editing
- Asset management

**Authentication & Permissions**:
- Role-based entity access
- Entity ownership management
- Team collaboration features

### Performance Considerations

**Code Splitting**:
- Lazy load entity editors
- Dynamic import for advanced features
- Bundle size optimization

**Virtual Scrolling**:
- Large entity lists
- Efficient rendering
- Memory management

**Caching Strategy**:
- Entity metadata caching
- Asset preview caching
- Local storage optimization

## Summary

This migration plan provides a clear, step-by-step approach to transforming the skill-editor into a multi-entity fey-console. The key principles are:

1. **Clear Navigation Flow**: Landing → File Manager → Home + Entity Editors
2. **Appropriate Editor Assignment**: Skills get advanced editors, others get generic forms
3. **Organized Component Structure**: Prepared for future custom editors
4. **Comprehensive Testing**: Maintain high quality standards
5. **Future-Ready Architecture**: Server integration and extensibility

The plan is designed to be executed in small, manageable steps with clear testing strategies, avoiding the complexity issues encountered in the previous implementation attempt.
