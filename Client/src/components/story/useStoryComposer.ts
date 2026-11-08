import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cameraFeeds, storyGradients, textColors } from '../../data/storyTools';
import { storyService } from '../../services/stories';
import type { Audience, StoryBackground, StoryMode, StoryPhase, TextStyleId } from '../../types/story';

export function useStoryComposer() {
  const navigate = useNavigate();
  const [mode, setModeState] = useState<StoryMode>('camera');
  const [phase, setPhase] = useState<StoryPhase>('compose');
  const [feed, setFeed] = useState<'rear' | 'front'>('rear');
  const [background, setBackground] = useState<StoryBackground>({ kind: 'photo', src: cameraFeeds.rear });
  const [text, setText] = useState('');
  const [isEditingText, setIsEditingText] = useState(false);
  const [textStyle, setTextStyle] = useState<TextStyleId>('classic');
  const [textColor, setTextColor] = useState(textColors[0]);
  const [flash, setFlash] = useState(false);
  const [audience, setAudience] = useState<Audience | null>(null);
  const uploadedFileRef = useRef<File | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const setMode = (next: StoryMode) => {
    setModeState(next);
    if (next === 'text') {
      setBackground({ kind: 'gradient', id: storyGradients[0].id });
      setIsEditingText(true);
    } else {
      setBackground({ kind: 'photo', src: cameraFeeds[feed] });
      setIsEditingText(false);
    }
  };

  const flipCamera = () => {
    const next = feed === 'rear' ? 'front' : 'rear';
    setFeed(next);
    setBackground({ kind: 'photo', src: cameraFeeds[next] });
  };

  const capture = () => {
    setFlash(true);
    timers.current.push(
      window.setTimeout(() => {
        setFlash(false);
        setPhase('review');
      }, 160)
    );
  };

  const upload = (file: File) => {
    uploadedFileRef.current = file;
    setModeState('camera');
    setBackground({ kind: 'photo', src: URL.createObjectURL(file) });
    setPhase('review');
  };

  const retake = () => {
    uploadedFileRef.current = null;
    setPhase('compose');
    setText('');
    if (mode === 'camera') setBackground({ kind: 'photo', src: cameraFeeds[feed] });
    setIsEditingText(mode === 'text');
  };

  const share = async (target: Audience) => {
    setIsEditingText(false);
    setAudience(target);
    setPhase('sharing');

    try {
      if (mode === 'camera') {
        if (uploadedFileRef.current) {
          await storyService.createStory({
            file: uploadedFileRef.current,
            caption: text,
            mode: 'camera',
            audience: target,
          });
        } else {
          // Camera photo simulation: send image URL
          const photoSrc = background.kind === 'photo' ? background.src : '';
          await storyService.createStory({
            mediaUrl: photoSrc,
            caption: text,
            mode: 'camera',
            audience: target,
          });
        }
      } else {
        // Text mode
        const gradientCss =
          storyGradients.find((g) => g.id === (background as any).id)?.css || '';
        await storyService.createStory({
          caption: text,
          mode: 'text',
          backgroundGradient: gradientCss,
          textStyle,
          textColor,
          audience: target,
        });
      }
    } catch (err) {
      console.warn('Failed to publish story to backend:', err);
    }

    timers.current.push(window.setTimeout(() => navigate('/'), 1200));
  };

  return {
    mode,
    phase,
    background,
    text,
    isEditingText,
    textStyle,
    textColor,
    flash,
    audience,
    setMode,
    setPhase,
    setText,
    setIsEditingText,
    setTextStyle,
    setTextColor,
    setBackground,
    flipCamera,
    capture,
    upload,
    retake,
    share,
    close: () => navigate('/'),
  };
}
