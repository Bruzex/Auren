export type User = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  online?: boolean;
  lastSeen?: string;
  mutuals?: number;
  isMutual?: boolean;
};

export type Story = {
  id: string;
  userId: string;
  image: string;
  caption?: string;
  postedAgo: string;
  viewed: boolean;
};

export type Conversation = {
  id: string;
  userId: string;
  user?: User;
  lastMessage: string;
  time: string;
  unread: number;
  lastFromMe?: boolean;
  typing?: boolean;
  muted?: boolean;
};

export type Message = {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  status?: 'delivered' | 'read';
};

export type FollowStatus = 'follow' | 'requested' | 'following';

export type FollowRequest = {
  id: string;
  userId: string;
  time: string;
};

export type ActivityKind = 'story_view' | 'story_like' | 'reply' | 'follow' | 'accepted' | 'mention';

export type Activity = {
  id: string;
  group: 'Today' | 'This week';
  kind: ActivityKind;
  userIds: string[];
  othersCount?: number;
  text: string;
  time: string;
  thumb?: string;
};

export type RecentSearch = {
  id: string;
  userId: string;
};

export type Highlight = {
  id: string;
  title: string;
  cover: string;
};

export type ArchivedStory = {
  id: string;
  image: string;
  views: number;
  label: string;
  active: boolean;
  focus?: string;
};