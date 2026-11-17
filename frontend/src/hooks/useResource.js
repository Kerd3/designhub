import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loads data from a service function and tracks loading / error / success.
 * `fetcher` receives { signal } so in-flight requests are cancelled on unmount.
 */
export function useResource(fetcher, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback((signal) => {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    return fetcherRef
      .current({ signal })
      .then((data) => {
        if (!signal?.aborted) setState({ status: 'success', data, error: null });
      })
      .catch((error) => {
        if (error.name === 'AbortError' || signal?.aborted) return;
        setState({ status: 'error', data: null, error });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return {
    ...state,
    isLoading: state.status === 'loading',
    isError: state.status === 'error',
    reload: () => load(),
    setData,
  };
}

/**
 * A collection plus create/update/remove helpers that keep the local list in
 * sync after the server confirms each change (no optimistic lies).
 */
export function useCollection(service) {
  const resource = useResource((opts) => service.list(opts), [service]);
  const { setData } = resource;

  const create = useCallback(async (input) => {
    const created = await service.create(input);
    setData((items) => [created, ...(items ?? [])]);
    return created;
  }, [service, setData]);

  const update = useCallback(async (id, patch) => {
    const updated = await service.update(id, patch);
    setData((items) => (items ?? []).map((item) => (item.id === id ? updated : item)));
    return updated;
  }, [service, setData]);

  const remove = useCallback(async (id) => {
    await service.remove(id);
    setData((items) => (items ?? []).filter((item) => item.id !== id));
  }, [service, setData]);

  return { ...resource, items: resource.data ?? [], create, update, remove };
}
