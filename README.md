# Fey Console

A comprehensive multi-entity editor for the Fey game development ecosystem. Transform your game entity creation and management workflow with specialized editors for Skills and generic forms for all other entity types.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Entity Types](#entity-types)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)

## Overview

The Fey Console is part of the larger **Fey Game Development Ecosystem** that includes:

- **fey-data**: OCaml data processing pipeline for validation and C# generation
- **fey-console**: This React/TypeScript management interface
- **fey-game-mock**: Unity integration with generated C# scripts

The console provides a powerful interface for creating, editing, and managing all 16 entity types in the Fey game system, with specialized editors for complex entities like Skills and streamlined forms for others.

## Features

### 🎯 **Multi-Entity Support**
- Supports all 16 entity types: Skills, Weapons, Equipment, Characters, Models, Images, Audio, and more
- Specialized Advanced Skill Editor with execution trees and visual editing
- Generic Entity Editor for streamlined editing of other entity types

### 📁 **File Management**
- Local file system integration using FileSystem API
- Automatic entity scanning and detection
- Support for JSON import/export workflows
- Directory-based entity organization

### 🔧 **Advanced Skill Editing**
- Visual execution tree editor with ReactFlow
- Drag-and-drop node-based skill construction
- Real-time validation and error checking
- Complex skill mechanics support

### 📝 **Generic Entity Forms**
- Standardized forms for entity definition (owner, key, version, type)
- Metadata management (title, description)
- JSON preview and editing capabilities
- Type-safe entity creation and validation

### 🧪 **Comprehensive Testing**
- 1200+ comprehensive tests with Vitest
- >90% test coverage maintained
- Unit, integration, and end-to-end testing
- Continuous integration pipeline

### 🚀 **Developer Experience**
- Full TypeScript support with strict type checking
- Hot module replacement with Vite
- Modern React patterns with hooks and context
- Zustand state management for performance

## Architecture

### Navigation Flow

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

### Component Organization

```
src/components/
├── file-manager/              # File loading and management
│   ├── folder-selector.tsx    # Directory selection
│   └── file-list.tsx          # Loaded files display
├── entity-selector.tsx        # Home dashboard for entity type selection
├── entity-editors/
│   ├── skill-editor/          # Advanced skill editing
│   │   ├── skill-editor.tsx
│   │   ├── execution-tree-editor.tsx
│   │   ├── skill-form/
│   │   ├── node-common/
│   │   └── nodetypes/
│   └── generic/               # Generic entity editing
│       ├── generic-entity-editor.tsx
│       ├── entity-definition-form.tsx
│       ├── entity-metadata-form.tsx
│       └── json-viewer.tsx
├── json-import-export/        # JSON operations
├── common/                    # Shared components
└── navigation/                # Future navigation components
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 8+
- Modern browser with FileSystem API support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/fey-console.git
   cd fey-console
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

### Loading Entity Files

1. **Launch the console** - You'll see the File Manager interface
2. **Select directory** - Click "Load Files" and choose your entity directory
3. **Browse files** - Use "File List" tab to see loaded entities
4. **Start editing** - Once files are loaded, the Home tab becomes available

### Creating New Entities

1. **Select entity type** - Choose from 16 available entity types on the Home tab
2. **Choose editor** - Skills open the Advanced Skill Editor, others use Generic Editor
3. **Fill forms** - Complete entity definition and metadata forms
4. **Save JSON** - Export your entity as JSON for use in the game

### Advanced Skill Editing

1. **Select Skills** - Choose "Skills" from the entity type grid
2. **Create/Edit** - Use the Advanced Skill Editor with execution trees
3. **Visual editing** - Drag and drop nodes to build skill mechanics
4. **Test execution** - Validate skill logic with built-in testing

### Generic Entity Editing

1. **Select entity type** - Choose any non-skill entity type
2. **Entity Definition** - Set owner, key, version, and type
3. **Metadata** - Add title and description (if supported)
4. **JSON Operations** - Preview, import, or export JSON data

## Entity Types

### Skills (Advanced Editor)
- **Skill**: Full execution tree editor, visual editor, advanced forms

### Generic Editor (15 entities)
- **Combat**: Weapon, Equipment, Character
- **Assets**: Model, Image, Sound, AudioClip, SoundBank, Animation, AnimationSource
- **Systems**: Status, DropTable, Cursor, Stat, Quality

All generic entities provide:
- Entity definition form (owner, key, version, type)
- Entity metadata form (title, description)
- JSON preview (read-only)
- JSON import/export functionality

## Development

### Project Structure

```
fey-console/
├── src/
│   ├── components/           # React components
│   ├── models/              # TypeScript type definitions
│   ├── store/               # Zustand state management
│   ├── utils/               # Utility functions
│   └── app.tsx              # Main application component
├── test/                    # Test files
├── public/                  # Static assets
└── docs/                    # Documentation
```

### Key Technologies

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Strict type checking and IntelliSense
- **Vite**: Fast development server and build tool
- **Zustand**: Lightweight state management
- **Ant Design**: Professional UI component library
- **ReactFlow**: Visual node-based editor for skills
- **Vitest**: Fast unit testing framework

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## Testing

### Test Coverage

The project maintains >90% test coverage with comprehensive testing:

- **Unit Tests**: Component behavior, utility functions, store operations
- **Integration Tests**: Multi-entity workflows, file operations
- **End-to-End Tests**: Complete user workflows

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Organization

```
test/
├── components/
│   ├── entity-editors/
│   │   ├── skill-editor/      # Skill editor tests
│   │   └── generic/           # Generic editor tests
│   ├── entity-selector.test.tsx
│   └── file-manager/
├── store/
│   ├── entity.store.test.ts
│   └── skill.store.test.ts
├── models/
│   └── entity.types.test.ts
└── integration/
    └── multi-entity-workflows.test.tsx
```

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** with comprehensive tests
4. **Run quality checks**: `npm run build && npm test`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**

### Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Testing**: >90% coverage required for all new features
- **Linting**: ESLint configuration must pass
- **Formatting**: Prettier for consistent code style

### Architecture Guidelines

- **Component Organization**: Keep skill-specific and generic components separated
- **State Management**: Use Zustand for global state, local state for UI-only concerns
- **Testing**: Write tests before implementation (TDD approach)
- **Documentation**: Update README and comments for architectural changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or contributions:

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/fey-console/issues)
- 📖 Documentation: [Wiki](https://github.com/your-org/fey-console/wiki)

---

**Built with ❤️ for the Fey Game Development Ecosystem**