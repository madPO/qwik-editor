<!--
Sync Impact Report - Constitution Update
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version: 1.1.0 → 1.1.1
Change Type: PATCH - Tooling specification update
Ratification Date: 2026-02-04
Last Amended: 2026-02-04

Tooling Changes:
  ✓ Changed: ESLint → Oxlint (faster Rust-based linter)
  ✓ Changed: Prettier → Oxfmt (faster Rust-based formatter)

Rationale: Oxc toolchain provides 50-100x faster linting and formatting with
compatible rule sets, significantly improving developer experience and CI times.

Principle Changes:
  • No principle changes (all 8 principles unchanged)

Section Changes:
  ✓ Updated: Quality Standards - Code Quality section
  ✓ Updated: Development Workflow - Code Review Requirements section

Template Alignment Status:
  ✅ .specify/templates/plan-template.md - Compatible (tooling agnostic)
  ✅ .specify/templates/spec-template.md - Compatible (tooling agnostic)
  ✅ .specify/templates/tasks-template.md - Compatible (tooling agnostic)
  ✅ package.json - Requires updates (ESLint/Prettier deps → Oxlint/Oxfmt)

Follow-up Actions:
  • Update package.json dependencies (remove ESLint, Prettier)
  • Add oxlint and oxfmt to devDependencies
  • Update npm scripts (lint, fmt, fmt.check)
  • Create oxlintrc.json configuration
  • Apply low coupling principles to component interfaces during MVP
  • Monitor complexity as components grow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-->

# Qwik Editor Constitution

## Core Principles

### I. Component-First Architecture

Every feature MUST be built as a self-contained, reusable Qwik component. Components
MUST have:

- Single, clear responsibility
- Explicit props interface with TypeScript types
- Independent testability (when testing implemented post-MVP)
- No side effects on import (honors sideEffects: false)
- Clear documentation of purpose and usage

**Rationale**: Qwik's resumability and lazy execution model requires components to
be independently loadable. Component isolation enables tree-shaking, optimal bundle
splitting, and developer experience through clear boundaries.

### II. TypeScript Safety

All code MUST be written in TypeScript with strict mode enabled. Type safety is
NON-NEGOTIABLE:

- No `any` types except in explicitly justified cases (document in code comments)
- All component props MUST be typed interfaces or types
- Public APIs MUST export complete type definitions
- Generics preferred over type assertions
- Type guards for runtime validation

**Rationale**: Editor libraries handle complex data transformations between markdown,
AST, and WYSIWYG representations. Strong typing prevents runtime errors and provides
IDE intelligence critical for library consumers.

### III. WYSIWYG Integrity

The visual editor MUST maintain semantic accuracy at all times:

- Visual representation MUST match markdown output exactly
- No hidden formatting or metadata loss during editing
- Undo/redo MUST preserve full document state
- Content mutations MUST be atomic and consistent
- Cursor position preserved across transformations

**Rationale**: Users trust WYSIWYG editors to accurately represent their content.
Any divergence between visual display and underlying markdown creates confusion,
data loss, and loss of trust in the tool.

### IV. Markdown Standard Compliance

The editor MUST support CommonMark specification as the foundation:

- Parse and serialize valid CommonMark markdown
- Clearly document any extensions or deviations
- Handle edge cases per spec (nested lists, code blocks, etc.)
- Provide escape hatches for unsupported syntax
- Test against CommonMark test suite (post-MVP)

**Rationale**: Markdown is a ubiquitous format. Standard compliance ensures
interoperability with other tools, portability of content, and predictable behavior
matching user expectations from other markdown implementations.

### V. Accessibility First

All editor UI components MUST be accessible to all users:

- Keyboard navigation for all operations (no mouse-only features)
- ARIA labels and roles for screen readers
- Focus management that respects user flow
- Semantic HTML elements (button, nav, main, etc.)
- Sufficient color contrast (WCAG AA minimum)

**Rationale**: Editors are productivity tools. Excluding users with disabilities
is both ethically wrong and legally risky. Accessibility also improves usability
for power users who prefer keyboard workflows.

### VI. Server Rendering Support

Components MUST be compatible with Qwik's SSR capabilities:

- No direct DOM access during component initialization
- Use Qwik lifecycle hooks (useVisibleTask$, useTask$) appropriately
- Handle hydration gracefully without flicker
- Provide loading states for client-only features
- Ensure initial render is meaningful and functional

**Rationale**: Qwik's differentiator is instant-on applications through resumability.
Breaking SSR compatibility sacrifices core framework benefits and degrades user
experience with slower initial loads.

### VII. Data-Transformation-Action Principle

All data flows MUST follow the explicit pattern: Data → Transformation → Action:

- Data sources clearly identified (props, state, stores)
- Transformations pure and testable (input → output, no side effects)
- Actions isolated in event handlers or effects
- No hidden state mutations
- Data flow direction always explicit and traceable

**Rationale**: Editors involve complex state machines (content, selection, history).
Explicit data flow prevents bugs, makes debugging tractable, and enables features
like collaborative editing where all mutations must be observable.

### VIII. Low Coupling, High Cohesion

Modules and components MUST minimize dependencies and maximize internal coherence:

**Low Coupling Requirements:**

- Components depend on interfaces/types, not concrete implementations
- Avoid circular dependencies between modules
- Communication through well-defined contracts (props, events, stores)
- No direct access to internal state of other components

**High Cohesion Requirements:**

- Related functionality grouped together in same module
- Each module has a single, clear purpose
- Public API surface minimal and intentional
- Changes to one feature should not require changes across many modules

**Rationale**: Editor libraries grow complex quickly with features like toolbar,
content blocks, formatting, undo/redo, plugins. Low coupling prevents brittle
architecture where changes ripple uncontrollably. High cohesion ensures developers
can understand and modify features in isolation, accelerating development and
reducing bugs.

## Quality Standards

### Code Quality

- All code MUST pass TypeScript compiler checks with strict mode
- All code MUST pass Oxlint validation
- Code MUST be formatted with Oxfmt before commit
- No console.log in production code (use proper logging if needed)
- Complex algorithms MUST include inline documentation

### Performance Targets (MVP phase - baseline establishment)

During MVP development, we focus on functional correctness. Performance benchmarks
will be established and enforced in post-MVP phase. However, avoid obvious
anti-patterns:

- No full-document re-renders on every keystroke
- Debounce expensive operations (markdown parsing, preview updates)
- Use Qwik's fine-grained reactivity (signals, stores)
- Lazy load non-critical components

### Documentation Requirements (MVP phase)

- Every exported component MUST have JSDoc describing purpose and usage
- Complex props interfaces MUST include examples
- Public API functions MUST document parameters and return values
- README MUST contain basic installation and usage instructions

## Development Workflow

### MVP Phase Approach (Current)

Testing deferred to post-MVP. Focus on:

1. Functional implementation of core editor features
2. Component structure and API design
3. TypeScript safety and type completeness
4. User feedback and iteration speed

### Post-MVP Phase (Future)

When tests are introduced:

- Write tests for new features before implementation (TDD)
- Achieve minimum 80% coverage for core editor logic
- Integration tests for user workflows
- Visual regression tests for WYSIWYG rendering

### Code Review Requirements

All changes MUST:

- Pass TypeScript compilation
- Pass Oxlint checks
- Follow Oxfmt formatting
- Have clear commit messages describing what and why
- Be reviewed against this constitution for compliance

### Branch and Release Strategy

- `main` branch: production-ready code
- Feature branches: `feature/description-of-feature`
- Semantic versioning: MAJOR.MINOR.PATCH
  - MAJOR: Breaking API changes
  - MINOR: New features, backwards compatible
  - PATCH: Bug fixes, no API changes

## Governance

This constitution supersedes all other development practices and preferences.

### Amendment Procedure

Changes to this constitution require:

1. Written proposal with rationale and impact assessment
2. Review by project maintainers
3. Update of this document with incremented version number
4. Propagation of changes to dependent templates and documentation

### Compliance

- All pull requests MUST be verified against these principles
- Constitution violations require explicit justification or refactoring
- When in doubt, simplicity and user value take precedence over clever engineering

### Versioning Policy

- MAJOR: Backward incompatible governance changes, principle removal/redefinition
- MINOR: New principle or section added, materially expanded guidance
- PATCH: Clarifications, wording improvements, non-semantic fixes

**Version**: 1.1.1 | **Ratified**: 2026-02-04 | **Last Amended**: 2026-02-04
