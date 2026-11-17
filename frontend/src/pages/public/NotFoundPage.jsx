import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { usePageMeta } from '@/hooks/usePageMeta.js';

export default function NotFoundPage({ title = 'We could not find that page', message = 'The page may have moved, or the address may be mistyped.' }) {
  usePageMeta({ title: 'Page not found', noindex: true });
  return (
    <section className="page-container flex min-h-[60svh] flex-col justify-center py-24">
      <p className="text-small font-medium text-muted">Error 404</p>
      <h1 className="mt-3 max-w-[18ch] font-display text-h1 font-bold text-ink">{title}</h1>
      <p className="mt-4 max-w-md text-lead text-ink">{message}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button to="/" leftIcon={ArrowLeft} size="lg">Back to home</Button>
        <Button to="/work" variant="outline" size="lg">Browse our work</Button>
      </div>
    </section>
  );
}
