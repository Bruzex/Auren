import { format } from 'date-fns';

export function formatClock(date: Date): string {
  return format(date, 'h:mm a');
}

export function formatToday(date: Date): string {
  return format(date, 'EEEE, MMMM d');
}

export function greeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}