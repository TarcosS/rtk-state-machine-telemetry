# RTK State Machine + Telemetry

This repository demonstrates a senior-level approach to async state management using React and Redux Toolkit.

The focus of this project is not UI complexity, but how async behavior, side effects, cancellation, and observability are explicitly modeled and orchestrated in a predictable way.

## What This Project Demonstrates

- Deterministic async state management using an explicit request state machine
- Clear separation of concerns between UI, side effects, and reducers
- Side effects fully isolated inside `createAsyncThunk`
- Request cancellation using `AbortController`
- Cache short-circuiting to avoid unnecessary network calls
- Race-condition prevention using `requestId` guarding
- Two-layer observability: domain telemetry and Redux action tracing

## Architectural Principles

### Single Source of Truth

All async lifecycle state is stored in Redux. UI components do not own loading or error state.

### Reducers Are Pure

Reducers never perform side effects. They only describe how state transitions happen.

### Thunks Orchestrate Side Effects

All async work happens inside `createAsyncThunk`. This includes API calls, cancellation, cache checks, duration measurement, and telemetry logging.

### Explicit Modeling Over Implicit Behavior

Async behavior is modeled as a state machine instead of scattered boolean flags.

## High-Level Data Flow

1. UI dispatches an intent
2. The thunk evaluates cache and performs an abortable API call
3. Lifecycle actions are emitted (`pending`, `fulfilled`, `rejected`)
4. Reducers update state deterministically
5. UI re-renders based on the new state

## Request State Machine

The async request lifecycle is modeled explicitly as a state machine.

![Request State Machine](public/IMG_7391.jpeg)

### State Transitions

| From | Event | To |
|------|-------|-----|
| `idle` | dispatch search | `loading` |
| `loading` | success | `success` |
| `loading` | error | `error` |
| `loading` | abort | `idle` |
| `error` | retry | `loading` |
| `idle` | cache hit | `success` (immediate) |

### Conceptual State Shape

```typescript
type SearchState = {
  query: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  dataByQuery: Record<string, SearchResult[]>;
  error?: string;
  activeRequestId?: string;
  lastDurationMs?: number;
  lastFromCache?: boolean;
  aborted?: boolean;
}
```

## Cancellation Strategy

1. Each dispatched thunk returns an abortable promise
2. The UI stores a reference to the most recent dispatched thunk
3. When a new search is triggered, the UI aborts the previous in-flight request before dispatching a new one
4. Aborted requests are not treated as errors—they do not surface error UI and do not pollute telemetry

This ensures that only the latest user intent is allowed to complete.

## Race-Condition Prevention

1. Redux Toolkit assigns a unique `requestId` to each thunk execution
2. The reducer stores the `requestId` of the most recent pending request
3. When a `fulfilled` or `rejected` action is received, the reducer compares its `requestId` with the active one
4. If they do not match, the action is ignored

This guarantees that stale responses can never overwrite newer state.

## Observability and Logging

This project intentionally separates observability into two layers.

### Domain Telemetry

Domain telemetry represents product-level events. These events are emitted inside the thunk and describe what actually happened from a business perspective.

| Event | Description |
|-------|-------------|
| `search.request_start` | A new search request was initiated |
| `search.request_success` | The request completed successfully |
| `search.request_error` | The request failed due to a real error |
| `search.request_aborted` | The request was intentionally cancelled |
| `search.cache_hit` | Cached data was returned without a network call |

Each event is logged as a structured JSON object:

```json
{
  "event": "search.request_success",
  "requestId": "abc123",
  "query": "react",
  "durationMs": 487,
  "count": 5,
  "ts": "2026-01-18T12:34:56.789Z"
}
```

These events are designed to be forwardable to production telemetry systems such as Sentry, Datadog, or OpenTelemetry.

### Redux Action Tracing

Redux action tracing represents internal state transitions. A custom middleware logs all Redux actions related to the search feature.

```json
{
  "ts": "2026-01-18T12:34:56.789Z",
  "event": "redux.action",
  "type": "search/runSearch/fulfilled",
  "durationMs": 1,
  "meta": {
    "requestId": "abc123",
    "arg": { "query": "react" },
    "requestStatus": "fulfilled"
  },
  "state": {
    "status": "success",
    "query": "react",
    "activeRequestId": "abc123",
    "lastDurationMs": 487,
    "lastFromCache": false,
    "hasError": false
  }
}
```

This layer is primarily intended for debugging and auditing rather than analytics.

## Running the Project

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open the browser and the DevTools console to observe telemetry logs.

## Demo Scenarios

| Scenario | How to Trigger | Expected Behavior |
|----------|----------------|-------------------|
| Success | Search for any term | Transition from `loading` to `success` |
| Cache hit | Search for the same term again | Immediate `success`, no API call |
| Error | Search for a term containing "fail" | Transition to `error`, retry available |
| Abort | Trigger multiple searches quickly | Previous requests are aborted |

## Project Structure

```
src/
├── api/
│   └── searchApi.ts          # Mock API with simulated delay
├── app/
│   ├── hooks.ts              # Typed Redux hooks
│   ├── loggerMiddleware.ts   # Redux action tracing
│   └── store.ts              # Store configuration
├── features/
│   └── search/
│       ├── searchSelectors.ts
│       ├── searchSlice.ts    # State machine reducers
│       └── searchThunks.ts   # Async orchestration + domain telemetry
└── ui/
    ├── SearchPage.tsx        # Main UI with cancellation logic
    └── SearchResults.tsx
```

## Why This Repository Exists

This repository is not a UI showcase.

It exists to demonstrate how an experienced front-end engineer thinks about async orchestration, state modeling, cancellation, observability, and correctness under concurrency.

The goal is **clarity**, **determinism**, and **debuggability**.
