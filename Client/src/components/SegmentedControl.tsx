import React, { useId } from 'react';
import { motion } from 'framer-motion';

type SegmentOption<T extends string> = {value: T;label: string;};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  fullWidth?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  fullWidth = false
}: SegmentedControlProps<T>) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`glass-pill rounded-full p-1 ${fullWidth ? 'flex w-full' : 'inline-flex'}`}>
      
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative h-8 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
            fullWidth ? 'flex-1' : ''} ${
            active ? 'text-label' : 'text-label-secondary hover:text-label'}`}>
            
            {active &&
            <motion.span
              layoutId={`segment-${id}`}
              className="absolute inset-0 rounded-full bg-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.3)]"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }} />

            }
            <span className="relative">{option.label}</span>
          </button>);

      })}
    </div>);

}