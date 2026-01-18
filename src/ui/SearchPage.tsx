import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectError, selectLastMeta, selectQuery, selectResultsForCurrentQuery, selectStatus } from "../features/search/searchSelectors";
import { runSearch } from "../features/search/searchThunks";
import SearchResults from "./SearchResults";
import { setQuery } from "../features/search/searchSlice";

const SearchPage = () => {
    const dispatch = useAppDispatch();

    const query = useAppSelector(selectQuery);
    const status = useAppSelector(selectStatus);
    const error = useAppSelector(selectError);
    const meta = useAppSelector(selectLastMeta);
    const results = useAppSelector(selectResultsForCurrentQuery);

    const normalized = query.trim();
    const canSearch = useMemo(
        () => normalized.length > 0 && status !== 'loading',
        [normalized, status]
    )

    const onSearch = () => {
        if (!normalized) return;
        dispatch(runSearch({
            query: normalized
        }));
    }

    const onRetry = () => onSearch();

    return (
        <div
      style={{
        maxWidth: 760,
        margin: "48px auto",
        padding: 16,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>RTK State Machine + Telemetry</h1>
        <p style={{ margin: "8px 0 0", color: "#444", lineHeight: 1.45 }}>
          This demo models async UI behavior as a small state machine and logs the full
          request lifecycle as structured JSON. Type <code>fail</code> to simulate an error.
          Repeat a query to hit cache.
        </p>
      </header>

      <section
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          value={query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSearch) onSearch();
          }}
          placeholder="Search…"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ccc",
            borderRadius: 10,
            outline: "none",
          }}
        />

        <button
          onClick={onSearch}
          disabled={!canSearch}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: canSearch ? "white" : "#f3f3f3",
            cursor: canSearch ? "pointer" : "not-allowed",
          }}
        >
          Search
        </button>
      </section>

      <section style={{ marginTop: 12, fontSize: 14, color: "#222" }}>
        <strong>Status:</strong> {status}
        {meta.durationMs != null && (
          <>
            {" "}
            • <strong>Duration:</strong> {meta.durationMs}ms
          </>
        )}
        {meta.fromCache && (
          <>
            {" "}
            • <strong>Cache:</strong> hit
          </>
        )}
      </section>

      {status === "loading" && (
        <p style={{ marginTop: 12, color: "#333" }}>Loading…</p>
      )}

      {status === "error" && (
        <div style={{ marginTop: 12 }}>
          <p style={{ margin: "0 0 10px", color: "#111" }}>
            Error: <code>{error}</code>
          </p>
          <button
            onClick={onRetry}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {status === "success" && <SearchResults items={results} />}

      <footer style={{ marginTop: 18, fontSize: 13, color: "#666" }}>
        Open DevTools Console to see telemetry logs as JSON lines.
      </footer>
    </div>
    )
}

export default SearchPage;