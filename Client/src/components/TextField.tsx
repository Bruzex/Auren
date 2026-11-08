import React, { useId } from 'react';

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  multiline?: boolean;
  maxLength?: number;
};

export function TextField({ label, value, onChange, prefix, multiline = false, maxLength }: TextFieldProps) {
  const id = useId();
  const inputClass =
  'w-full bg-transparent text-[15px] text-label outline-none placeholder:text-label-tertiary';

  return (
    <div className="glass-pill rounded-[18px] px-4 pb-2.5 pt-2 transition-[box-shadow,border-color] duration-200 focus-within:border-accent/40 focus-within:shadow-[0_0_0_4px_rgba(90,130,255,0.16)]">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[12px] font-medium text-label-tertiary">
          {label}
        </label>
        {maxLength &&
        <span className="text-[11px] tabular-nums text-label-tertiary">
            {value.length}/{maxLength}
          </span>
        }
      </div>
      <div className="mt-0.5 flex items-start">
        {prefix && <span className="pr-0.5 text-[15px] text-label-tertiary">{prefix}</span>}
        {multiline ?
        <textarea
          id={id}
          value={value}
          maxLength={maxLength}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-none leading-relaxed`} /> :


        <input id={id} value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} className={inputClass} />
        }
      </div>
    </div>);

}