import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { AlertTriangle } from 'lucide-react';

/** Last-resort error boundary for route loading and rendering failures. */
export function RouteError() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const chunkFailed = error instanceof TypeError && /dynamically imported module|Failed to fetch/i.test(error.message);

  return (
    <main className="page-container flex min-h-dvh flex-col justify-center py-24">
      <AlertTriangle aria-hidden="true" className="size-8 text-danger" />
      <h1 className="mt-4 font-display text-h1 font-bold text-ink">
        {is404 ? 'Page not found' : chunkFailed ? 'This page could not load' : 'Something went wrong'}
      </h1>
      <p className="mt-3 max-w-lg text-lead text-ink">
        {chunkFailed
          ? 'Part of the app failed to download, usually because of a lost connection or a new release. Reloading normally fixes it.'
          : 'An unexpected error stopped this page from rendering. Your data is safe.'}
      </p>
      {import.meta.env.DEV && error?.message && (
        <pre className="mt-6 max-w-3xl overflow-x-auto rounded-md bg-surface-2 p-4 text-caption text-muted"><code>{error.message}</code></pre>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => window.location.reload()} className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-small font-medium text-primary-ink hover:bg-primary-hover">Reload page</button>
        <Link to="/" className="inline-flex h-11 items-center rounded-md px-4 text-small font-medium text-ink ring-1 ring-inset ring-border-strong hover:bg-surface-2">Go to home page</Link>
      </div>
    </main>
  );
}
