import type { ReactNode } from "react";

export function OwnerPageHeader({ code, title, description, actions }: { code: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="flex flex-col gap-space-md md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      <span className="inline-flex whitespace-nowrap rounded-full bg-primary-fixed px-2 py-0.5 font-label-sm text-label-sm uppercase tracking-wider text-on-primary-fixed-variant">{code}</span>
      <h1 className="mt-space-xs font-headline-lg text-headline-lg tracking-tight text-charcoal">{title}</h1>
      {description ? <p className="mt-space-xs max-w-2xl font-body-md text-body-md text-text-secondary">{description}</p> : null}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
  </header>;
}
