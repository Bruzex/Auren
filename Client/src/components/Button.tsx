import React from 'react';

type ButtonVariant = 'primary' | 'glass' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium select-none transition-[transform,background-color,color,box-shadow,opacity] duration-150 ease-out-expo active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-40';

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3.5 text-[13px]',
  md: 'h-10 px-5 text-[14px]',
  lg: 'h-12 px-6 text-[15px]'
};

const variants: Record<ButtonVariant, string> = {
  primary: 'btn-accent',
  glass: 'glass-pill text-label hover:bg-white/[0.1]',
  ghost: 'text-label-secondary hover:bg-white/[0.05] hover:text-label',
  danger: 'glass-pill text-danger hover:bg-danger/10'
};

export function buttonStyles(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return `${base} ${sizes[size]} ${variants[variant]}`;
}

export function Button({ variant = 'primary', size = 'md', className = '', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={`${buttonStyles(variant, size)} ${className}`} {...rest} />;
}