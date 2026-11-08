import React from 'react';
import { motion } from 'framer-motion';
import { CheckCheckIcon, CheckIcon } from 'lucide-react';
import type { Message } from '../../types/social';

type MessageBubbleProps = {
  message: Message;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  animateIn: boolean;
};

export function MessageBubble({ message, isFirstInGroup, isLastInGroup, animateIn }: MessageBubbleProps) {
  const mine = message.from === 'me';
  const tail = isLastInGroup ? mine ? 'rounded-br-[8px]' : 'rounded-bl-[8px]' : '';

  return (
    <motion.div
      initial={animateIn ? { opacity: 0, y: 10, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
      style={{ transformOrigin: mine ? 'bottom right' : 'bottom left' }}
      className={`flex ${mine ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}>
      
      <div className={`flex max-w-[80%] flex-col md:max-w-[62%] ${mine ? 'items-end' : 'items-start'}`}>
        <p
          className={`rounded-[22px] px-4 py-2.5 text-[15px] leading-[1.42] ${tail} ${
          mine ? 'bubble-sent text-white' : 'bubble-received text-label'}`
          }>
          
          {message.text}
        </p>
        {isLastInGroup &&
        <span className="mt-1.5 flex items-center gap-1 px-1.5 text-[11px] tabular-nums text-label-tertiary">
            {message.time}
            {mine && (
          message.status === 'read' ?
          <CheckCheckIcon className="h-3.5 w-3.5 text-accent-soft" strokeWidth={2} aria-label="Read" /> :

          <CheckIcon className="h-3.5 w-3.5" strokeWidth={2} aria-label="Delivered" />)
          }
          </span>
        }
      </div>
    </motion.div>);

}