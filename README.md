# Fey Console

A modern React-based web console for creating, editing, and managing game entities within the Fey Game Development Ecosystem.

## Overview

Fey Console is a TypeScript/React application that provides intuitive interfaces for creating and editing game entity definitions. It supports 16 different entity types with specialized editors for Skills (advanced node-based interface) and generic form-based editors for all other entities.

## Features

- **Multi-Entity Support**: Handles 16 game entity types (weapons, characters, skills, equipment, audio, animations, etc.)
- **Specialized Skill Editor**: Advanced node-based editor with execution trees for complex skill definitions
- **Generic Entity Editor**: Clean form-based interface for all other entity types
- **File Management**: Local file system integration with File System Access API
- **JSON Preview**: Read-only JSON viewing with copy-to-clipboard functionality
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Comprehensive Testing**: 1200+ tests with full coverage reporting

## Quick Start

### Installation

```bash
cd fey-console
npm install
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Generate coverage report
npm run test:coverage
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Navigation Flow
```
Landing Page → File Manager → Entity Selection → Appropriate Editor
```

### Component Structure
- **Entity-Specific Editors**: Skills get advanced node-based editor, others get clean form interfaces
- **File Manager**: Handles local file operations and entity file management
- **State Management**: Zustand stores for predictable state updates
- **Component Organization**: Clear separation between specialized and generic editors

### Key Technologies
- **React 18** with TypeScript for type safety
- **Vite** for fast build and development
- **Ant Design** for UI components
- **ReactFlow** for node-based skill editing
- **Zustand** for state management
- **Monaco Editor** for JSON editing
- **Vitest** with V8 coverage for testing

## Entity System

### Supported Entity Types
The console supports 16 game entity types:
- **Combat**: Weapons, Characters, Skills, Equipment
- **Assets**: Audio, Animation, Model, Image
- **Systems**: Status effects, Quality definitions, Stats, Requirements
- **Utility**: Drop tables, Cursor definitions, Affixes

### File Naming Convention
All entity files must follow the pattern: `<name>.<type>.json`
- Examples: `sword.weapon.json`, `hero.character.json`, `fireball.skill.json`

## Development

### Quality Standards
- **Zero failing tests policy**: All tests must pass before commits
- **Comprehensive TypeScript checking** with strict configuration
- **ESLint + Prettier** for code quality and formatting
- **V8 coverage provider** for accurate test coverage reporting

### Testing Strategy
- Unit tests for all components and utilities
- Integration tests for multi-entity workflows
- Property-based testing for entity operations
- Snapshot testing for UI components
- Interactive test UI available via `npm run test:ui`

### Scripts
```bash
# Code quality
npm run lint           # Check code style
npm run lint:fix       # Fix code style issues
npm run format         # Format code with Prettier

# Testing
npm test               # Run all tests
npm run test:coverage  # Generate coverage report
npm run coverage:open  # Open coverage report in browser
```

## Integration

Fey Console is part of the larger Fey Game Development Ecosystem:

1. **Create/Edit**: Use Fey Console to create and edit entity definitions
2. **Process**: fey-data pipeline validates and generates C# code from JSON files
3. **Integrate**: Generated files update fey-game-mock Unity project assets

## Contributing

1. Follow the existing code conventions and component organization
2. Maintain comprehensive test coverage for new features
3. Use entity-specific editors appropriately (Skills → Advanced Editor, Others → Generic Editor)
4. Run `npm test` before committing to ensure all tests pass
5. Follow the established naming conventions for entity files

## License

See LICENSE file for details.
