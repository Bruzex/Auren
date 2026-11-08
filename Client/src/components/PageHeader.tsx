import React from 'react';

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, eyebrow, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[14px] text-label-tertiary">{eyebrow}</p>}
        <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.028em] md:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-label-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>);

}