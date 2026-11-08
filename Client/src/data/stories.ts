import { media } from './media';
import type { Story } from '../types/social';

export const stories: Story[] = [
{ id: 's1', userId: 'maya', image: media.storyOcean, caption: 'Blue hour, finally.', postedAgo: '24m', viewed: false },
{ id: 's2', userId: 'sofia', image: media.storyCity, caption: 'After the rain.', postedAgo: '1h', viewed: false },
{ id: 's3', userId: 'amara', image: media.storyCafe, caption: 'Slow Saturday.', postedAgo: '2h', viewed: false },
{ id: 's4', userId: 'kai', image: media.storyCity, postedAgo: '3h', viewed: false },
{ id: 's5', userId: 'leo', image: media.storyCafe, caption: 'Best cortado in town.', postedAgo: '5h', viewed: true },
{ id: 's6', userId: 'theo', image: media.storyOcean, postedAgo: '8h', viewed: true },
{ id: 's7', userId: 'iris', image: media.storyCity, caption: 'Night shift.', postedAgo: '11h', viewed: true }];