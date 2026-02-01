# AI Document

A monorepo for an AI-powered document editor with Angular frontend and NestJS backend.

## Architecture

```
ai-document/
├── fe/main/          # Angular 21 frontend (@ai-document/frontend)
├── be/main/          # NestJS 11 backend (@ai-document/backend)
├── e2e/main/         # Playwright e2e tests (@ai-document/e2e)
└── package.json      # Bun workspace root
```

## Commands

All commands run from the workspace root using Bun's `--filter` flag.

### Development
```bash
bun run fe:dev        # Start Angular dev server (http://localhost:4200)
bun run be:dev        # Start NestJS dev server (http://localhost:3000)
bun run e2e:test      # Run Playwright e2e tests
```

### Running workspace scripts directly
```bash
bun run --filter @ai-document/frontend <script>
bun run --filter @ai-document/backend <script>
bun run --filter @ai-document/e2e <script>
```

### VS Code Tasks (Cmd+Shift+B)
- **Run Client** - Angular dev server
- **Run Server** - NestJS dev server
- **Run All** - Both in parallel (default task)

## Tech Stack

- **Runtime**: Bun 1.3.x
- **Frontend**: Angular 21 (standalone components)
- **Backend**: NestJS 11
- **E2E Testing**: Playwright
- **Package Manager**: Bun workspaces

## Conventions

### Angular (Domain-Driven Design)

The frontend follows Domain-Driven Design with feature-based organization:

```
fe/main/src/app/
├── app.component.ts          # Root shell component
├── app.routes.ts             # Root routing
└── <feature>/                # Feature folder (e.g., home, editor, settings)
    ├── components/           # Components specific to this feature
    │   └── *.component.ts
    ├── services/             # Services specific to this feature
    │   └── *.service.ts
    ├── store/                # NgRx SignalStore for this feature
    │   ├── <feature>.state.ts      # State interface and initial state
    │   ├── <feature>.selectors.ts  # Computed selector functions
    │   ├── <feature>.events.ts     # Event definitions (eventGroup)
    │   ├── <feature>.reducers.ts   # Reducer functions (on handlers)
    │   ├── <feature>.effects.ts    # Side effect functions (withEffects)
    │   └── <feature>.store.ts      # Main SignalStore definition
    ├── directives/           # Directives specific to this feature
    │   └── *.directive.ts
    ├── pipes/                # Pipes specific to this feature
    │   └── *.pipe.ts
    └── models/               # Interfaces/types for this feature
        └── *.model.ts
```

**DDD Rules:**
- Each feature folder represents an independent domain/bounded context
- Only create artifact folders (components/, services/, etc.) when they contain files
- Features should be self-contained and loosely coupled
- Files use type suffixes: `.component.ts`, `.service.ts`, `.directive.ts`, `.pipe.ts`
- Standalone components (no NgModules)
- Class names include type suffix (e.g., `HomeComponent`, `AuthService`)

**NgRx SignalStore Conventions (Event API):**
- Each feature domain has its own `store/` folder
- Store files follow the pattern: `<domain>.<artifact-type>.ts`
  - `<domain>.state.ts` - State interface (`<Domain>State`) and `initial<Domain>State`
  - `<domain>.selectors.ts` - Pure functions for computed values (used with `withComputed`)
  - `<domain>.events.ts` - Event definitions using `eventGroup()` with `type<T>()` from `@ngrx/signals`
  - `<domain>.reducers.ts` - Reducer array using `on()` handlers for state updates
  - `<domain>.effects.ts` - Side effects using `Events.on()` and RxJS operators
  - `<domain>.store.ts` - Main `signalStore()` combining all features
- Stores are provided at root level: `signalStore({ providedIn: 'root' }, ...)`
- Use `withDevtools('storeName')` from `@angular-architects/ngrx-toolkit` for Redux DevTools
- Use `withReducer(...reducers)` from `@ngrx/signals/events` for state updates
- Use `withEventHandlers(effectsFn)` from `@ngrx/signals/events` for side effects
- Use `injectDispatch(events)` from `@ngrx/signals/events` in components to dispatch events
- Use `mapResponse` from `@ngrx/operators` for handling Observable success/error in effects

**About `shtuff/` (use reluctantly):**
- A `shtuff/` folder exists for truly generic utilities that don't belong to any domain
- Before adding anything to `shtuff/`, ask: "Is this actually its own domain?"
- Example: Don't create `shtuff/auth/` — auth is a domain, create `auth/` instead
- `shtuff/` is a code smell — if it's growing, you're probably missing domains
- Acceptable shtuff: generic UI primitives, utility functions with no business logic
- When in doubt, make it a feature domain, not shtuff

### NestJS
- Standard NestJS module/controller/service structure
- Entry point: `be/main/src/main.ts`

## Development Container

The project includes a devcontainer configuration for VS Code:
- Node 22 + Bun
- Ports 3000 and 4200 forwarded
- Angular, ESLint, Prettier extensions pre-installed
