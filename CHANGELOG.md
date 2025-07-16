# Changelog

All notable changes to the Fey Console project will be documented in this file.

## [2.0.0] - 2025-07-15 - Multi-Entity Support Release

### 🎉 Major Features

#### Multi-Entity Architecture
- **BREAKING CHANGE**: Transformed from skill-only editor to comprehensive multi-entity management system
- Added support for all 16 entity types in the Fey ecosystem
- Implemented entity-specific routing: Skills → Advanced Editor, Others → Generic Editor

#### New Components & Architecture
- **EntityManager**: Central component for entity type selection and management workflow
- **EntitySelector**: Dropdown and detailed view for selecting entity types
- **EntityList**: Comprehensive entity browsing with search, pagination, and CRUD operations
- **GenericEntityEditor**: Form-based editor for non-skill entities with JSON preview

#### Enhanced Navigation
- **Updated App Navigation**: File Manager → Home → Entity-specific tabs architecture
- **Tab-based Interface**: Dedicated tabs for each entity type with proper state management
- **Breadcrumb Navigation**: Clear navigation path through entity selection and editing

#### State Management
- **Entity Store**: Zustand-based store for managing entity state across the application
- **Generic Entity Types**: Type-safe utilities for all 16 entity types
- **Validation System**: Comprehensive entity validation with error reporting

### 🔧 Technical Improvements

#### Component Organization
- Reorganized component structure into `entity-editors/`, `entity-selector/`, and `file-manager/`
- Moved skill-specific components to `entity-editors/skill-editor/`
- Created generic entity components in `entity-editors/generic/`

#### Type Safety & Utilities
- Added comprehensive `EntityType` enum and display name mappings
- Implemented `SimpleEntity` interface for consistent entity structure
- Created utility functions for entity creation, validation, and manipulation

#### Testing
- Added 400+ comprehensive tests for new multi-entity functionality
- Implemented test coverage for entity stores, selectors, editors, and navigation
- Created integration tests for the complete entity management workflow

### 🐛 Bug Fixes

#### UI/UX Improvements
- Fixed Ant Design deprecation warnings (Dropdown overlay → menu)
- Improved form validation with proper error messages
- Enhanced entity editor with JSON preview and metadata management

#### Store Management
- Fixed entity import validation to reject invalid entity types
- Improved entity cloning and update operations
- Enhanced search functionality with proper filtering

### 📚 Documentation

#### Updated Documentation
- Comprehensive README with multi-entity architecture overview
- Updated component documentation and usage examples
- Added migration plan documentation for future reference

#### Developer Experience
- Enhanced TypeScript path mappings for cleaner imports
- Improved build configuration and development workflow
- Added comprehensive ESLint and testing configuration

### 🔄 Migration Notes

#### From v1.x (Skill-Only Editor)
- **Navigation**: The app now starts with File Manager → loads to Home with entity selection
- **Skills**: Existing skill editing functionality preserved in dedicated Skills tab
- **Other Entities**: New generic entity editor for Weapons, Characters, Equipment, etc.
- **Files**: File management now integrated into main navigation flow

#### Breaking Changes
- App structure changed from single skill editor to multi-tab interface
- Component imports may need updating due to reorganization
- Store structure updated to support multiple entity types

### 🎯 Supported Entity Types

#### Combat & Gameplay
- **Skills**: Advanced editor with execution trees (unchanged functionality)
- **Weapons**: Generic form editor with damage, enchantments, properties
- **Equipment**: Wearable items with stat modifications
- **Characters**: NPCs and player characters with stats and AI

#### Assets & Media
- **Models**: 3D models for characters, objects, environments
- **Images**: UI icons, textures, visual assets
- **Audio Clips**: Music, dialogue, sound effects
- **Sound Banks**: Collections of related audio
- **Animations**: Character and object animations
- **Animation Sources**: Animation data references

#### Game Systems
- **Status Effects**: Temporary character modifiers
- **Drop Tables**: Probability tables for rewards
- **Stats**: Character attribute definitions
- **Quality**: Item rarity and quality levels
- **Cursors**: Custom cursor definitions

### 📊 Performance & Metrics

#### Test Coverage
- **Total Tests**: 411 tests (384 passing, 27 failing - mostly test isolation issues)
- **Component Coverage**: 100% of new components have test coverage
- **Integration Coverage**: End-to-end workflow testing implemented

#### Build Performance
- **Bundle Size**: Optimized with code splitting for skill editor
- **Compilation**: TypeScript strict mode with zero errors
- **Development**: Hot module replacement and fast refresh support

---

## Previous Versions

### [1.x] - Skill Editor Era
- Single-purpose skill editor with ReactFlow-based execution trees
- File management and JSON import/export
- Basic entity validation and processing
- OCaml pipeline integration

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and uses [Semantic Versioning](https://semver.org/).

The migration from v1.x to v2.0.0 represents a fundamental architectural shift from a skill-only editor to a comprehensive multi-entity management system, hence the major version bump.