import type { Conversation, Message } from '../types/social';

export const conversations: Conversation[] = [
{ id: 'c1', userId: 'maya', lastMessage: 'Sending you the photos from last night', time: '9:41 PM', unread: 2 },
{ id: 'c2', userId: 'sofia', lastMessage: 'Did you see the venue?', time: '9:12 PM', unread: 0, typing: true },
{ id: 'c3', userId: 'leo', lastMessage: 'Haha, that’s exactly what I said', time: '8:30 PM', unread: 0, lastFromMe: true },
{ id: 'c4', userId: 'amara', lastMessage: 'Are we still on for Sunday?', time: 'Yesterday', unread: 1 },
{ id: 'c5', userId: 'kai', lastMessage: 'The new build looks incredible', time: 'Yesterday', unread: 0, muted: true },
{ id: 'c6', userId: 'theo', lastMessage: 'Voice message · 0:42', time: 'Thu', unread: 0 },
{ id: 'c7', userId: 'nadia', lastMessage: 'See you there.', time: 'Tue', unread: 0, lastFromMe: true },
{ id: 'c8', userId: 'jonah', lastMessage: 'Thanks again for the intro', time: 'Mon', unread: 0 }];


export const messagesByConversation: Record<string, Message[]> = {
  c1: [
  { id: 'c1-1', from: 'them', text: 'Last night was so good. That rooftop was unreal.', time: '9:20 PM' },
  { id: 'c1-2', from: 'me', text: 'Right? The light at sunset was perfect.', time: '9:24 PM', status: 'read' },
  { id: 'c1-3', from: 'me', text: 'Did you get any shots of the skyline?', time: '9:24 PM', status: 'read' },
  { id: 'c1-4', from: 'them', text: 'So many. Going through them now.', time: '9:38 PM' },
  { id: 'c1-5', from: 'them', text: 'Sending you the photos from last night', time: '9:41 PM' }],

  c2: [
  { id: 'c2-1', from: 'me', text: 'Booked the table for Friday — 8pm.', time: '8:55 PM', status: 'read' },
  { id: 'c2-2', from: 'them', text: 'Amazing. Is it the place by the river?', time: '9:02 PM' },
  { id: 'c2-3', from: 'me', text: 'The one with the garden in the back.', time: '9:05 PM', status: 'read' },
  { id: 'c2-4', from: 'them', text: 'Did you see the venue?', time: '9:12 PM' }],

  c3: [
  { id: 'c3-1', from: 'them', text: 'Okay hear me out: film cameras are back.', time: '8:12 PM' },
  { id: 'c3-2', from: 'them', text: 'I bought one. No regrets.', time: '8:12 PM' },
  { id: 'c3-3', from: 'me', text: 'You said that about the vinyl collection too.', time: '8:26 PM', status: 'read' },
  { id: 'c3-4', from: 'them', text: 'And I was right about that.', time: '8:28 PM' },
  { id: 'c3-5', from: 'me', text: 'Haha, that’s exactly what I said', time: '8:30 PM', status: 'read' }],

  c4: [
  { id: 'c4-1', from: 'me', text: 'Found a trail near Sintra we should try.', time: 'Yesterday', status: 'read' },
  { id: 'c4-2', from: 'them', text: 'Yes please. I need a day offline.', time: 'Yesterday' },
  { id: 'c4-3', from: 'them', text: 'Are we still on for Sunday?', time: 'Yesterday' }]

};

export const typingFollowUps: Record<string, string> = {
  c2: 'It’s even better in person. Sending pictures in a sec.'
};

export const cannedReplies = [
'Love that.',
'Ha — okay, deal.',
'Give me ten minutes.',
'Yes, exactly what I was thinking.'];