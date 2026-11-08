import type { User } from '../types/social';

const userCache = new Map<string, User>();

export function cacheUser(user: User): void {
  if (user?.id) {
    userCache.set(user.id, user);
  }
}

export function cacheUsers(usersList: User[]): void {
  usersList.forEach((u) => {
    if (u?.id) userCache.set(u.id, u);
  });
}

export function getUser(id: string): User {
  if (userCache.has(id)) {
    return userCache.get(id)!;
  }
  return {
    id,
    name: id,
    username: id.toLowerCase(),
  };
}

export function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
