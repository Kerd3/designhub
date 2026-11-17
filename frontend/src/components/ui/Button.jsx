import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/format.js';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none rounded-md ' +
  'transition-[background-color,color,box-shadow,transform] duration-150 active:translate-y-px ' +
  'disabled:opacity-55 disabled:active:translate-y-0 aria-disabled:opacity-55';

export const buttonVariants = {
  primary: 'bg-primary text-primary-ink hover:bg-primary-hover',
  secondary: 'bg-secondary text-bg hover:bg-secondary-hover',
  outline: 'bg-surface text-ink ring-1 ring-inset ring-border-strong hover:bg-surface-2',
  ghost: 'bg-transparent text-ink hover:bg-surface-2',
  danger: 'bg-danger text-white hover:bg-danger-hover dark:text-bg',
  link: 'bg-transparent text-primary underline-offset-4 hover:underline px-0! h-auto!',
};

export const buttonSizes = {
  sm: 'h-9 px-3 text-small',
  md: 'h-11 px-4 text-small',
  lg: 'h-13 px-6 text-body',
};

/**
 * Button. Renders a <Link> when `to` is set, an <a> when `href` is set,
 * otherwise a <button>. `loading` disables it and announces progress.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  to,
  href,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const classes = cn(base, buttonVariants[variant], buttonSizes[size], fullWidth && 'w-full', className);
  const content = (
    <>
      {loading ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : LeftIcon && <LeftIcon aria-hidden="true" className="size-4 shrink-0" />}
      <span>{loading && loadingText ? loadingText : children}</span>
      {!loading && RightIcon && <RightIcon aria-hidden="true" className="size-4 shrink-0" />}
    </>
  );

  if (to) return <Link to={to} className={classes} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...rest}>{content}</a>;

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {content}
    </button>
  );
}
