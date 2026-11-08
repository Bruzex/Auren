import { media } from './media';
import type { StoryGradient, StoryTextStyle } from '../types/story';

export const cameraFeeds = {
  rear: media.storyCity,
  front: media.storyCafe
};

export const galleryPreview = media.storyOcean;

export const storyGradients: StoryGradient[] = [
{ id: 'aurora', label: 'Aurora', css: 'linear-gradient(160deg, #1B2A6B 0%, #4B3AA8 52%, #A88BFF 100%)' },
{ id: 'dusk', label: 'Dusk', css: 'linear-gradient(170deg, #0F1A3A 0%, #3A2F7A 55%, #D89BC4 100%)' },
{ id: 'tide', label: 'Tide', css: 'linear-gradient(165deg, #0B1530 0%, #1F3F8F 55%, #6FA0FF 100%)' },
{ id: 'mist', label: 'Mist', css: 'linear-gradient(160deg, #262E45 0%, #5D6EA6 60%, #BFC9EE 100%)' },
{ id: 'midnight', label: 'Midnight', css: 'linear-gradient(180deg, #08090F 0%, #1A2045 100%)' }];


export const textColors = ['#FFFFFF', '#C7D4FF', '#DCCFFF', '#FFE2BD', '#0B0B12'];

export const textStyles: StoryTextStyle[] = [
{ id: 'classic', label: 'Classic', className: 'font-sans font-semibold tracking-[-0.02em]' },
{ id: 'editorial', label: 'Editorial', className: 'font-display italic tracking-normal' },
{ id: 'mono', label: 'Mono', className: 'font-mono font-medium tracking-tight' }];