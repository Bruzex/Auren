import React from 'react';
import { motion } from 'framer-motion';
import { textColors, textStyles } from '../../data/storyTools';
import type { TextStyleId } from '../../types/story';

type StoryTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  styleId: TextStyleId;
  onStyleChange: (id: TextStyleId) => void;
  color: string;
  onColorChange: (color: string) => void;
  onDone: () => void;
};

export function StoryTextEditor({ value, onChange, styleId, onStyleChange, color, onColorChange, onDone }: StoryTextEditorProps) {
  const style = textStyles.find((s) => s.id === styleId) ?? textStyles[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-30 flex flex-col bg-black/45 backdrop-blur-[3px]">
      
      <div className="flex justify-end p-4 pt-[max(env(safe-area-inset-top),16px)]">
        <button type="button" onClick={onDone} className="h-9 rounded-full bg-white px-4 text-[14px] font-semibold text-black transition-transform duration-150 active:scale-[0.96]">
          Done
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-8">
        <label htmlFor="story-text" className="sr-only">
          Story text
        </label>
        <textarea
          id="story-text"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start typing"
          rows={3}
          maxLength={120}
          className={`w-full resize-none bg-transparent text-center text-[34px] leading-tight outline-none placeholder:text-white/40 ${style.className}`}
          style={{ color, textShadow: color === '#0B0B12' ? 'none' : '0 2px 18px rgba(0,0,0,0.35)' }} />
        
      </div>

      <div className="flex flex-col items-center gap-4 px-4 pb-[max(env(safe-area-inset-bottom),24px)]">
        <div className="flex gap-2" role="radiogroup" aria-label="Text style">
          {textStyles.map((s) =>
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={s.id === styleId}
            onClick={() => onStyleChange(s.id)}
            className={`h-8 rounded-full px-4 text-[13px] transition-colors duration-150 ${s.className} ${
            s.id === styleId ? 'bg-white text-black' : 'bg-white/[0.12] text-white backdrop-blur-md hover:bg-white/20'}`
            }>
            
              {s.label}
            </button>
          )}
        </div>
        <div className="flex gap-3" role="radiogroup" aria-label="Text color">
          {textColors.map((c) =>
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={c === color}
            aria-label={`Color ${c}`}
            onClick={() => onColorChange(c)}
            className={`h-7 w-7 rounded-full border-2 transition-transform duration-150 ${c === color ? 'scale-110 border-white' : 'border-white/40'}`}
            style={{ backgroundColor: c }} />

          )}
        </div>
      </div>
    </motion.div>);

}