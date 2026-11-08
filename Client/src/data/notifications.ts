import { media } from './media';
import type { Activity, FollowRequest } from '../types/social';

export const followRequests: FollowRequest[] = [
{ id: 'fr1', userId: 'iris', time: '2h' },
{ id: 'fr2', userId: 'ezra', time: '5h' },
{ id: 'fr3', userId: 'lena', time: '1d' }];


export const activities: Activity[] = [
{ id: 'a1', group: 'Today', kind: 'story_view', userIds: ['maya', 'leo'], othersCount: 14, text: 'viewed your story', time: '12m', thumb: media.storyCity },
{ id: 'a2', group: 'Today', kind: 'story_like', userIds: ['sofia'], text: 'liked your story', time: '1h', thumb: media.storyOcean },
{ id: 'a3', group: 'Today', kind: 'reply', userIds: ['amara'], text: 'replied to your story: “This light is unreal.”', time: '3h', thumb: media.storyCity },
{ id: 'a4', group: 'This week', kind: 'accepted', userIds: ['theo'], text: 'accepted your follow request', time: '2d' },
{ id: 'a5', group: 'This week', kind: 'mention', userIds: ['kai'], text: 'mentioned you in their story', time: '3d', thumb: media.storyCafe },
{ id: 'a6', group: 'This week', kind: 'follow', userIds: ['jonah'], text: 'started following you', time: '5d' }];