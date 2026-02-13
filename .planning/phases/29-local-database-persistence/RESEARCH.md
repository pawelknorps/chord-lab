# Research: Local Database for Session Persistence

## Objective

Investigate the existing codebase to determine the best approach for implementing local database for session persistence.

## Findings

1.  **Libraries**: The `package.json` does not contain any specific libraries for local storage management like `dexie`, `localforage`, or `idb`.

2.  **`indexedDB`**: A search for `indexedDB` in the codebase yielded no results, indicating it is not currently in use.

3.  **`localStorage`**: `localStorage` is used extensively throughout the application for various simple key-value storage needs, including:
    *   Storing user preferences like microphone device ID.
    *   Remembering the last played song or saved licks.
    *   Caching settings like latency.

4.  **Roadmap and Planning**:
    *   The `ROADMAP.md` mentions "IndexedDB/LocalStorage" for "Phase 26: Wave III - Long-term Progression (Mastery Tree)", suggesting that a more powerful solution might be needed for storing complex historical data like `PerformanceSegment` objects.
    *   Existing planning documents also show a preference for `localStorage` for simple flags and settings.

## Conclusion and Recommendation

The project has a well-established pattern of using `localStorage` for simple data persistence. For the task of "session persistence", `localStorage` is a viable and consistent choice, especially if the session data is not overly large or complex.

**Recommendation**:

For the initial implementation, leverage the existing pattern of using `localStorage`. This approach has the following advantages:

*   **Consistency**: It follows the established architectural pattern of the application.
*   **Simplicity**: It avoids introducing a new library or technology for a relatively simple task.

**Future Considerations**:

If the "session" data becomes more complex or grows in size, a more robust solution like `IndexedDB` should be considered. This would be in line with the future-facing comments in the `ROADMAP.md`. A library like `idb` could be a lightweight way to use `IndexedDB` with a simpler, promise-based API.

For the purpose of the current plan, we will proceed with a `localStorage`-based solution.
