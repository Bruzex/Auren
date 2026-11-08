import type { FollowStatus, RecentSearch } from '../types/social';

export const recentSearches: RecentSearch[] = [
{ id: 'r1', userId: 'sofia' },
{ id: 'r2', userId: 'kai' },
{ id: 'r3', userId: 'theo' }];


export const suggestedUserIds = ['nadia', 'iris', 'lena', 'jonah'];

export const initialFollowStatus: Record<string, FollowStatus> = {
  maya: 'following',
  leo: 'following',
  sofia: 'following',
  kai: 'following',
  amara: 'following',
  theo: 'following',
  iris: 'follow',
  ezra: 'requested',
  nadia: 'follow',
  jonah: 'follow',
  lena: 'follow'
};