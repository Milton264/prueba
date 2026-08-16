import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Campos rectangulares con foco marcado por un borde navy solido,
 * no por un halo difuso.
 */
const fieldBase =
  'w-full rounded-sm border bg-white px-3.5 text-sm text-navy-900 placeholder:text-navy-400 shadow-sm shadow-transparent transition-[border-color,box-shadow,background-color] duration-200 ease-out focus:ring-2 focus:ring-navy-900/10 disabled:cursor-not-allowed disabled:bg-mist disabled:text-navy-400';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        fieldBase,
        'h-11',
        (type === 'number' || type === 'date' || type === 'datetime-local' || type === 'tel') && 'tabular-nums',
        error ? 'border-red-600 focus:border-red-700' : 'border-navy-200 focus:border-navy-900',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        fieldBase,
        'py-2.5 leading-relaxed',
        error ? 'border-red-600 focus:border-red-700' : 'border-navy-200 focus:border-navy-900',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        fieldBase,
        'h-11 appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2317406F\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'square\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.85rem_center] bg-no-repeat pr-10',
        error ? 'border-red-600 focus:border-red-700' : 'border-navy-200 focus:border-navy-900',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

interface FieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, required, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={htmlFor} className="pes-label">
          {label}
          {required && <span className="ml-1 text-gold-700">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="pes-hint">{hint}</p>}
      {error && <p className="font-sans text-[11px] text-red-700">{error}</p>}
    </div>
  );
}

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className={cn(
          'flex cursor-pointer items-start gap-3 border p-4 transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:shadow-sm',
          error ? 'border-red-600 bg-red-50/50' : 'border-navy-200 bg-white hover:border-navy-900',
          className,
        )}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded-none border-navy-300 text-navy-900 accent-navy-900"
          {...props}
        />
        <span className="text-sm leading-relaxed text-navy-700">{label}</span>
      </label>
      {error && <p className="font-sans text-[11px] text-red-700">{error}</p>}
    </div>
  ),
);
Checkbox.displayName = 'Checkbox';
