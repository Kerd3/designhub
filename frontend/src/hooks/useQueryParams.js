import { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router';

/**
 * URL-backed filter state.
 *
 * React Router's functional setSearchParams(prev => …) receives the params of
 * the last render, so two quick changes (clear the search, then pick a status)
 * can rebuild from stale params and undo the first change. This hook keeps the
 * latest pending params in a ref so consecutive updates always compose.
 */
export function useQueryParams() {
  const [params, setParams] = useSearchParams();
  const latest = useRef(params);
  const committed = useRef(params);
  // When the URL itself changes (navigation, back button), adopt it.
  if (committed.current !== params) {
    committed.current = params;
    latest.current = params;
  }

  const setParam = useCallback((key, value) => {
    const next = new URLSearchParams(latest.current);
    if (value && value !== 'All' && value !== 'all') next.set(key, value);
    else next.delete(key);
    latest.current = next;
    setParams(next, { replace: true, preventScrollReset: true });
  }, [setParams]);

  const clearParams = useCallback((keep = []) => {
    const next = new URLSearchParams();
    for (const key of keep) if (latest.current.get(key)) next.set(key, latest.current.get(key));
    latest.current = next;
    setParams(next, { replace: true, preventScrollReset: true });
  }, [setParams]);

  return { params, setParam, clearParams };
}
