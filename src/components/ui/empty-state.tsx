import { ButtonLink } from './button';

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: unknown;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="border-t border-navy-100 px-6 py-16 text-center">
      <p className="pes-eyebrow">Sin registros</p>
      <h3 className="mt-3 text-lg font-semibold text-navy-900">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy-500">{description}</p>}
      {actionLabel && actionHref && (
        <ButtonLink href={actionHref} size="sm" className="mt-6">
          {actionLabel}
        </ButtonLink>
      )}
    </div>
  );
}
