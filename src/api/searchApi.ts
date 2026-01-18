import type { SearchResult } from "../features/search/searchSlice";

export type SearchApiOptions = {
    signal: AbortSignal;
    minDelayMs?: number;
    maxDelayMs?: number;
}

function sleep(ms: number, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, ms);

        const onAbort = () => {
            clearTimeout(t);
            reject(new DOMException('Aborted', 'AbortError'));
        };

        if (signal.aborted) return onAbort();

        signal.addEventListener('abort', onAbort, { once: true });
    })
}

export const searchApi = {
    async search(
        query: string,
        opts: SearchApiOptions
    ): Promise<SearchResult[]> {
        const { signal, minDelayMs = 450, maxDelayMs = 900 } = opts;

        const delay = Math.floor(minDelayMs + Math.random() * (maxDelayMs - minDelayMs));

        await sleep(delay, signal);

        if (query.toLowerCase().includes('fail')) {
            throw new Error('Simulated network error');
        }

        const normalized = query.trim()
        return Array.from({ length: 5 }, (_, i) => ({
            id: `${normalized}-${i + 1}`,
            title: `Result ${i + 1} for "${normalized}"`
        }))
    }
}