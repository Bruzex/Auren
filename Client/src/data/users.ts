import { media } from './media';
import type { User } from '../types/social';

export const currentUser: User = {
  id: 'me',
  name: 'Julian Reyes',
  username: 'julian',
  avatar: media.me,
  bio: 'Designer in Lisbon. Quiet mornings, loud playlists, long walks by the water.',
  online: true
};

export const users: User[] = [
currentUser,
{ id: 'maya', name: 'Maya Chen', username: 'mayachen', avatar: media.maya, online: true, mutuals: 12 },
{ id: 'leo', name: 'Leo Hart', username: 'leohart', avatar: media.leo, online: false, lastSeen: '12m ago', mutuals: 8 },
{ id: 'sofia', name: 'Sofia Marín', username: 'sofi.marin', avatar: media.sofia, online: true, mutuals: 21 },
{ id: 'kai', name: 'Kai Nakamura', username: 'kai.n', avatar: media.kai, online: false, lastSeen: '1h ago', mutuals: 5 },
{ id: 'amara', name: 'Amara Okafor', username: 'amara.o', avatar: media.amara, online: true, mutuals: 9 },
{ id: 'theo', name: 'Theo Lindqvist', username: 'theo.l', avatar: media.theo, online: false, lastSeen: '3h ago', mutuals: 3 },
{ id: 'iris', name: 'Iris Vale', username: 'irisvale', online: false, lastSeen: 'yesterday', mutuals: 4 },
{ id: 'ezra', name: 'Ezra Cole', username: 'ezra.cole', online: false, mutuals: 2 },
{ id: 'nadia', name: 'Nadia Rahman', username: 'nadia.r', online: true, mutuals: 7 },
{ id: 'jonah', name: 'Jonah Weiss', username: 'jonahw', online: false, lastSeen: '2d ago', mutuals: 1 },
{ id: 'lena', name: 'Lena Moreau', username: 'lena.moreau', online: false, mutuals: 6 }];