import React, { useRef } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { ArrowRightIcon, CheckIcon, ChevronLeftIcon, ImagePlusIcon, StarIcon, SwitchCameraIcon, TypeIcon, XIcon } from 'lucide-react';
import { SegmentedControl } from '../components/SegmentedControl';
import { StoryTextEditor } from '../components/story/StoryTextEditor';
import { useStoryComposer } from '../components/story/useStoryComposer';
import { galleryPreview, storyGradients, textStyles } from '../data/storyTools';
import type { StoryMode } from '../types/story';

const modeOptions = [
{ value: 'camera', label: 'Camera' },
{ value: 'text', label: 'Text' }] as
const;

const overlayButton =
'flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-xl transition-[background-color,transform] duration-150 hover:bg-black/40 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

export function CreateStory() {
  const c = useStoryComposer();
  const frameRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textX = useMotionValue(0);
  const textY = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const gradient = c.background.kind === 'gradient' ? storyGradients.find((g) => g.id === c.background.id) : undefined;
  const style = textStyles.find((s) => s.id === c.textStyle) ?? textStyles[0];
  const showChrome = !c.isEditingText && c.phase !== 'sharing';

  const handleRetake = () => {
    textX.set(0);
    textY.set(0);
    c.retake();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) c.upload(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas">
      <div className="ambient" aria-hidden="true" />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <div
        ref={frameRef}
        className="relative h-[100dvh] w-full overflow-hidden bg-surface md:aspect-[9/16] md:h-[min(92vh,880px)] md:w-auto md:rounded-[34px] md:ring-1 md:ring-white/10 md:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        
        {/* Background */}
        <AnimatePresence initial={false}>
          <motion.div
            key={c.background.kind === 'photo' ? c.background.src : c.background.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
            style={gradient ? { backgroundImage: gradient.css } : undefined}>
            
            {c.background.kind === 'photo' && <img src={c.background.src} alt="Story preview" className="h-full w-full object-cover" />}
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />

        <AnimatePresence>
          {c.flash &&
          <motion.div
            className="absolute inset-0 z-40 bg-white"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }} />

          }
        </AnimatePresence>

        {/* Placed text */}
        {c.text && !c.isEditingText && (
          <div className="absolute inset-x-6 top-[38%] z-10 flex justify-center pointer-events-none">
            <motion.button
              type="button"
              drag
              dragConstraints={frameRef}
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => {
                isDraggingRef.current = true;
              }}
              onDragEnd={() => {
                setTimeout(() => {
                  isDraggingRef.current = false;
                }, 150);
              }}
              onClick={() => {
                if (!isDraggingRef.current) {
                  c.setIsEditingText(true);
                }
              }}
              aria-label="Edit text"
              className={`pointer-events-auto cursor-grab select-none whitespace-pre-wrap text-center text-[34px] leading-tight active:cursor-grabbing ${style.className}`}
              style={{
                x: textX,
                y: textY,
                color: c.textColor,
                textShadow: c.textColor === '#0B0B12' ? 'none' : '0 2px 18px rgba(0,0,0,0.35)',
              }}
            >
              {c.text}
            </motion.button>
          </div>
        )}

        {/* Top chrome */}
        {showChrome && (
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 pt-[max(env(safe-area-inset-top),16px)]">
            {c.phase === 'review' ? (
              <button type="button" onClick={handleRetake} aria-label="Retake" className={overlayButton}>
                <ChevronLeftIcon className="h-5 w-5" strokeWidth={1.8} />
              </button>
            ) : (
              <button type="button" onClick={c.close} aria-label="Close" className={overlayButton}>
                <XIcon className="h-5 w-5" strokeWidth={1.8} />
              </button>
            )}
            <p className="text-[15px] font-semibold text-white">New story</p>
            <span className="h-11 w-11" aria-hidden="true" />
          </div>
        )}

        {/* Tool rail */}
        {showChrome &&
        <div className="absolute right-4 top-24 z-20 flex flex-col gap-3">
            <button type="button" onClick={() => c.setIsEditingText(true)} aria-label="Add text" title="Text" className={overlayButton}>
              <TypeIcon className="h-5 w-5" strokeWidth={1.7} />
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Upload from library" title="Upload" className={overlayButton}>
              <ImagePlusIcon className="h-5 w-5" strokeWidth={1.7} />
            </button>
          </div>
        }

        {/* Bottom controls */}
        {showChrome &&
        <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-[max(env(safe-area-inset-bottom),22px)]">
            <AnimatePresence mode="wait" initial={false}>
              {c.phase === 'review' ?
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex gap-2">
              
                  <button
                type="button"
                onClick={() => c.share('close-friends')}
                className="flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-black/30 text-[15px] font-medium text-white backdrop-blur-xl transition-[background-color,transform] duration-150 hover:bg-black/45 active:scale-[0.97]">
                
                    <StarIcon className="h-4 w-4 fill-online text-online" strokeWidth={1.6} />
                    Close friends
                  </button>
                  <button
                type="button"
                onClick={() => c.share('story')}
                className="btn-accent flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-semibold transition-transform duration-150 active:scale-[0.97]">
                
                    Your story
                    <ArrowRightIcon className="h-4 w-4" strokeWidth={2} />
                  </button>
                </motion.div> :

            <motion.div
              key={`compose-${c.mode}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col items-center gap-5">
              
                  {c.mode === 'camera' ?
              <div className="flex w-full items-center justify-between px-4">
                      <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Choose from library"
                  className="h-11 w-11 overflow-hidden rounded-[12px] border-2 border-white/80 transition-transform duration-150 active:scale-[0.94]">
                  
                        <img src={galleryPreview} alt="" className="h-full w-full object-cover" />
                      </button>
                      <motion.button
                  type="button"
                  onClick={c.capture}
                  aria-label="Take photo"
                  whileTap={{ scale: 0.92 }}
                  transition={{ duration: 0.12 }}
                  className="flex h-[78px] w-[78px] items-center justify-center rounded-full border-[3px] border-white/90">
                  
                        <span className="h-[62px] w-[62px] rounded-full bg-white shadow-[inset_0_-4px_10px_rgba(0,0,0,0.12)]" />
                      </motion.button>
                      <button type="button" onClick={c.flipCamera} aria-label="Flip camera" className={overlayButton}>
                        <SwitchCameraIcon className="h-5 w-5" strokeWidth={1.7} />
                      </button>
                    </div> :

              <div className="flex w-full items-center justify-between gap-4">
                      <div className="flex gap-2.5" role="radiogroup" aria-label="Background">
                        {storyGradients.map((g) => {
                    const active = c.background.kind === 'gradient' && c.background.id === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={g.label}
                        onClick={() => c.setBackground({ kind: 'gradient', id: g.id })}
                        className={`h-9 w-9 rounded-full border-2 transition-transform duration-150 ease-out-expo ${active ? 'scale-110 border-white' : 'border-white/30'}`}
                        style={{ backgroundImage: g.css }} />);


                  })}
                      </div>
                      <button
                  type="button"
                  onClick={() => c.setPhase('review')}
                  disabled={!c.text.trim()}
                  aria-label="Next"
                  className="btn-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-[opacity,transform] duration-150 active:scale-[0.94] disabled:opacity-40">
                  
                        <ArrowRightIcon className="h-5 w-5" strokeWidth={2} />
                      </button>
                    </div>
              }
                  <div className="[&_.glass-pill]:border-white/15 [&_.glass-pill]:bg-black/30">
                    <SegmentedControl
                  options={modeOptions}
                  value={c.mode}
                  onChange={(m: StoryMode) => c.setMode(m)}
                  ariaLabel="Story mode" />
                
                  </div>
                </motion.div>
            }
            </AnimatePresence>
          </div>
        }

        <AnimatePresence>
          {c.isEditingText &&
          <StoryTextEditor
            value={c.text}
            onChange={c.setText}
            styleId={c.textStyle}
            onStyleChange={c.setTextStyle}
            color={c.textColor}
            onColorChange={c.setTextColor}
            onDone={() => c.setIsEditingText(false)} />

          }
        </AnimatePresence>

        <AnimatePresence>
          {c.phase === 'sharing' &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md"
            role="status">
            
              <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="glass-strong flex flex-col items-center rounded-[28px] px-8 py-7 text-center">
              
                <span className="btn-accent flex h-12 w-12 items-center justify-center rounded-full">
                  <CheckIcon className="h-6 w-6" strokeWidth={2.2} />
                </span>
                <p className="mt-4 text-[16px] font-semibold">Shared</p>
                <p className="mt-1 text-[14px] text-label-secondary">
                  {c.audience === 'close-friends' ? 'Visible to Close Friends' : 'Added to your story'}
                </p>
              </motion.div>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}