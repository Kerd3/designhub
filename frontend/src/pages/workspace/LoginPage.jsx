import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Info, KeyRound, LogIn } from 'lucide-react';
import { Button, Input, useToast } from '@/components/ui';
import { Wordmark } from '@/components/layout/Wordmark.jsx';
import { ProjectPreview } from '@/components/portfolio/ProjectPreview.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { DEMO_ACCOUNT } from '@/services/authService.js';
import { portfolio } from '@/data/portfolio.js';
import { usePageMeta } from '@/hooks/usePageMeta.js';

const loginSchema = z.object({
  email: z.string().trim().min(1, { error: 'Email address is required' }).pipe(z.email({ error: 'Enter a valid email address' })),
  password: z.string().min(1, { error: 'Password is required' }).min(8, { error: 'Passwords are at least 8 characters' }),
});

/** Only allow redirects back into the workspace (no open redirects). */
function safeNext(value) {
  return value && value.startsWith('/workspace') && !value.startsWith('//') ? value : '/workspace';
}

export default function LoginPage() {
  usePageMeta({ title: 'Workspace login', description: 'Demo access to the DesignHub Studio workspace.', noindex: true });
  const { isAuthenticated, login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const next = safeNext(params.get('next'));

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  if (isAuthenticated) return <Navigate to={next} replace />;

  const onSubmit = async (values) => {
    setAuthError(null);
    try {
      const session = await login(values);
      toast.success(`Welcome, ${session.name.split(' ')[0]}`, 'You are in the demo workspace.');
      navigate(next, { replace: true });
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const fillDemo = () => {
    setValue('email', DEMO_ACCOUNT.email, { shouldValidate: true });
    setValue('password', DEMO_ACCOUNT.password, { shouldValidate: true });
    setAuthError(null);
  };

  return (
    <div className="grid min-h-dvh bg-bg lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <main id="main" className="flex flex-col px-4 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Wordmark />
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-sm text-small font-medium text-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" className="size-4" /> Back to website
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-h1 font-bold text-ink">Workspace login</h1>
          <p className="mt-3 text-body text-muted">Manage projects, clients, tasks and inquiries in the studio workspace.</p>

          <div className="mt-8 rounded-lg bg-info-soft p-4">
            <div className="flex gap-3">
              <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-info" />
              <div className="text-small text-ink">
                <p className="font-semibold">Demo access, not real authentication</p>
                <p className="mt-1">This portfolio demo checks the account below in your browser. It protects nothing and stores no password.</p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  <dt className="text-muted">Email</dt><dd className="font-medium break-all">{DEMO_ACCOUNT.email}</dd>
                  <dt className="text-muted">Password</dt><dd className="font-medium">{DEMO_ACCOUNT.password}</dd>
                </dl>
                <Button size="sm" variant="outline" leftIcon={KeyRound} onClick={fillDemo} className="mt-3">Use demo credentials</Button>
              </div>
            </div>
          </div>

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
            {authError && (
              <p role="alert" className="flex gap-2.5 rounded-md bg-danger-soft px-4 py-3 text-small text-ink">
                <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" /> {authError}
              </p>
            )}
            <Input label="Email address" type="email" autoComplete="username" inputMode="email" required error={errors.email?.message} {...register('email')} />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              error={errors.password?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="grid size-9 place-items-center rounded-sm text-muted hover:bg-surface-2 hover:text-ink"
                >
                  {showPassword ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
                </button>
              }
              {...register('password')}
            />
            <Button type="submit" size="lg" loading={isSubmitting} loadingText="Signing in…" leftIcon={LogIn} fullWidth>Sign in</Button>
          </form>
        </div>
        <p className="text-caption text-muted">DesignHub Studio is fictional. Workspace records are sample data.</p>
      </main>

      <aside aria-hidden="true" className="relative hidden overflow-hidden bg-inverse lg:block">
        <div className="absolute inset-x-12 top-16">
          <p className="max-w-md font-display text-h1 font-bold text-inverse-ink">Every project, client and task in one calm place.</p>
        </div>
        <div className="absolute -right-24 bottom-[-6%] w-[118%]"><ProjectPreview project={portfolio[3]} /></div>
        <div className="absolute bottom-[8%] left-12 w-[28%]"><ProjectPreview project={portfolio[0]} device="mobile" /></div>
      </aside>
    </div>
  );
}
