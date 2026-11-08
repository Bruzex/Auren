import { media } from './media';
import type { ArchivedStory, Highlight } from '../types/social';

export const profileStats = [
{ label: 'Stories', value: '86' },
{ label: 'Followers', value: '1,284' },
{ label: 'Following', value: '312' }];


export const highlights: Highlight[] = [];


export const storyArchive: ArchivedStory[] = [
{ id: 'p1', image: media.storyOcean, views: 214, label: '18h left', active: true },
{ id: 'p2', image: media.storyCafe, views: 168, label: '21h left', active: true },
{ id: 'p3', image: media.storyCity, views: 301, label: 'Nov 4', active: false },
{ id: 'p4', image: media.storyOcean, views: 187, label: 'Nov 2', active: false, focus: 'center top' },
{ id: 'p5', image: media.storyCafe, views: 142, label: 'Oct 29', active: false, focus: 'center bottom' },
{ id: 'p6', image: media.storyCity, views: 256, label: 'Oct 26', active: false, focus: 'center top' },
{ id: 'p7', image: media.storyCafe, views: 119, label: 'Oct 21', active: false },
{ id: 'p8', image: media.storyOcean, views: 233, label: 'Oct 18', active: false, focus: 'center bottom' },
{ id: 'p9', image: media.storyCity, views: 98, label: 'Oct 12', active: false, focus: 'center bottom' }];