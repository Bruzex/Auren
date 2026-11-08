import React from 'react';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: 'sm' | 'md';
};

export const iconButtonStyles = (size: 'sm' | 'md' = 'md') =>
`glass-pill inline-flex shrink-0 items-center justify-center rounded-full text-label-secondary transition-[transform,background-color,color] duration-150 ease-out-expo hover:bg-white/[0.1] hover:text-label active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
size === 'sm' ? 'h-9 w-9' : 'h-10 w-10'}`;


export function IconButton({ label, size = 'md', className = '', type = 'button', children, ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} title={label} className={`${iconButtonStyles(size)} ${className}`} {...rest}>
      {children}
    </button>);

}