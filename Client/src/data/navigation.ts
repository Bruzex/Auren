import {
  BellIcon,
  CircleUserRoundIcon,
  HouseIcon,
  MessageCircleIcon,
  SearchIcon,
  VenetianMaskIcon,
  type LucideIcon } from
'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: 'unread' | 'requests';
  mobile: boolean;
};

export const navItems: NavItem[] = [
{ to: '/', label: 'Home', icon: HouseIcon, end: true, mobile: true },
{ to: '/search', label: 'Search', icon: SearchIcon, mobile: true },
{ to: '/chats', label: 'Chats', icon: MessageCircleIcon, badge: 'unread', mobile: true },
{ to: '/notifications', label: 'Activity', icon: BellIcon, badge: 'requests', mobile: false },
{ to: '/rooms', label: 'Rooms', icon: VenetianMaskIcon, mobile: true },
{ to: '/profile', label: 'Profile', icon: CircleUserRoundIcon, mobile: true }];