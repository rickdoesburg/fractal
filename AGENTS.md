# Agent Instructions for Fractal

Fractal is a tool for building and documenting website component libraries and design systems. This is a monorepo managed by Lerna with independent versioning.

## Project Overview

- **Main documentation**: [README.md](README.md) and https://fractal.build/
- **Monorepo manager**: Lerna (independent versioning)
- **Package locations**: `packages/*` (core functionality) and `examples/*` (test/example projects)

### Core Packages

- **`@frctl/fractal`** - Main orchestrator, CLI, and public API
- **`@frctl/core`** - Foundation classes, base Adapter, entities, utilities
- **`@frctl/web`** - Web server (with BrowserSync) and static site builder
- **`@frctl/handlebars`**, **`@frctl/nunjucks`**, **`@frctl/react`**, **`@frctl/twig`** - Template engine adapters
- **`@frctl/mandelbrot`** - Default web UI theme (built with Webpack, jQuery, SCSS)

## Essential Commands

### Development Workflow

```bash
npm run bootstrap    # Bootstrap monorepo (run after clone or dependency changes)
npm run test        # Run all linters and tests
npm run test:unit   # Run Jest unit tests only
npm run validate    # Run ESLint and Stylelint
npm run format      # Auto-fix linting issues
```

### Fractal CLI (when testing)

```bash
fractal start --sync    # Start development server with BrowserSync
fractal build          # Build static HTML site
fractal new            # Scaffold new project
fractal info           # Display project info
```

## Code Conventions

### Linting & Formatting

- **ESLint**: `eslint:recommended` + Prettier integration, ES2018
- **Stylelint**: Standard config + SCSS support, 4-space indentation
- **Prettier**: Single quotes, semicolons, 120 print width, 4-space tabs (2 for JSON/YAML)
- **Pre-commit**: Husky + lint-staged auto-fixes staged files
- **Test files**: Named `*.spec.js`, use Jest + jest-extended

### File Naming

- Components live in folders: `{name}/{name}.{ext}` (e.g., `button/button.njk`)
- Variants: `{name}--{variant}.{ext}` (e.g., `button--primary.njk`)
- Config files: `{name}.config.{yml|json|js}`
- Documentation: `README.md` or `{name}.md` in component folder

## Key Patterns

### Component Structure

```
components/
  button/
    button.njk           # Template
    button.config.yml    # Context data & variants
    button--primary.njk  # Variant template (optional)
    button.scss         # Component styles (resource)
    README.md           # Documentation
```

### Configuration Files (`fractal.config.js`)

- Located in project root
- Sets component/docs paths, template engines, static assets, build output
- Example pattern:
    ```javascript
    const fractal = require('@frctl/fractal').create();
    fractal.components.set('path', path.join(__dirname, 'components'));
    fractal.components.engine(require('@frctl/nunjucks'));
    module.exports = fractal;
    ```

### Component Config (`.config.yml|json|js`)

- Define `context` (template data)
- Define `variants` (alternative versions)
- Set `collated: true` to render all variants together
- Example: see [examples/nunjucks/components/render/render.config.yml](examples/nunjucks/components/render/render.config.yml)

### Core API Pattern

```javascript
const fractal = require('@frctl/fractal').create();
fractal.components; // ComponentSource
fractal.docs; // DocSource
fractal.web; // Web server/builder
fractal.cli; // CLI interface
```

## Architecture Notes

### Entity/Source Pattern

- All sources (Components, Docs) extend `EntitySource` from `@frctl/core`
- Template engines are **adapters** extending base `Adapter` class
- Configuration is **heritable** and **mixable**
- Key methods: `entities()`, `engine()`, `find()`, `resolve()`, `render()`

### React Specifics

- React adapter transpiles JSX with Babel
- Supports `wrapperElements` for context providers
- Preview component: `_preview.jsx` provides HTML wrapper
- See [examples/react/fractal.config.js](examples/react/fractal.config.js) for setup

### CLI Architecture

- Uses Vorpal for interactive CLI
- Commands in `packages/fractal/src/cli/commands/`
- Liftoff for config file discovery
- Detects global vs local installation

## Common Pitfalls

- **Bootstrap required**: Run `npm run bootstrap` after cloning or adding dependencies
- **Lerna workspace**: Dependencies hoisted to root; use `--force-local` to link local packages
- **Config files**: `fractal.config.js` must export the Fractal instance
- **Variant splitter**: Default is `--` (e.g., `button--primary`)
- **Engine registration**: Must explicitly set engine via `engine()` method

## Testing Approach

- **Unit tests**: Jest in root, runs on all `*.spec.js` files
- **Example projects**: Each adapter has example in `examples/{adapter}/`
- **Shared utilities**: `examples/adapter-tests/` provides common test helpers
- **Package tests**: Individual packages can have their own test scripts via `lerna run test`

## Development Environment

- **Node**: Requires supported LTS version (see [Node.js releases](https://github.com/nodejs/Release))
- **Dependencies**: All installed at root via Lerna hoisting
- **Webpack**: Used for Mandelbrot theme only
- **Babel**: Used for React adapter and tests
