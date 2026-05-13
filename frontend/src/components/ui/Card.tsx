import type { HTMLAttributes, ReactNode } from 'react';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  children?: ReactNode;
}

const paddings: Record<Padding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  padding = 'md',
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={`bg-white border border-slate-200 rounded-lg ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
