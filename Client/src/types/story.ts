export type StoryMode = 'camera' | 'text';

export type StoryPhase = 'compose' | 'review' | 'sharing';

export type StoryBackground = {kind: 'photo';src: string;} | {kind: 'gradient';id: string;};

export type TextStyleId = 'classic' | 'editorial' | 'mono';

export type StoryGradient = {
  id: string;
  label: string;
  css: string;
};

export type StoryTextStyle = {
  id: TextStyleId;
  label: string;
  className: string;
};

export type Audience = 'story' | 'close-friends';