import { SocialActivity, OnlinePeerStatus } from '../types/social';

export const AVATAR_COLORS = ['#6C5CE7', '#00B894', '#E17055', '#FDCB6E', '#0984E3', '#A29BFE'];

export function avatarColorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Placeholder feed — swap for API data when available. */
export const MOCK_ACTIVITIES: SocialActivity[] = [
  {
    id: 'a1',
    actorName: 'Priya R.',
    description: 'Completed 2hr session in Physics 101',
    timestamp: '5m',
    avatarColor: '#00B894',
  },
  {
    id: 'a2',
    actorName: 'Karan M.',
    description: 'Hit a 7-day study streak 🎉',
    timestamp: '1h',
    avatarColor: '#6C5CE7',
  },
  {
    id: 'a3',
    actorName: 'GATE 2025 Group',
    description: 'Sneha added new notes: Signals & Systems',
    timestamp: '3h',
    avatarColor: '#E17055',
  },
  {
    id: 'a4',
    actorName: 'Arjun S.',
    description: 'Finished a mock test — 82% score',
    timestamp: '5h',
    avatarColor: '#0984E3',
  },
];

/** Placeholder presence — merge with peersStore by name when wiring real API. */
export const MOCK_ONLINE_PEERS: OnlinePeerStatus[] = [
  {
    id: 'o1',
    name: 'Priya R.',
    isOnline: true,
    statusText: 'Studying Physics 101',
    avatarColor: '#00B894',
  },
  {
    id: 'o2',
    name: 'Sham',
    isOnline: true,
    statusText: 'Pomodoro — 18 min left',
    avatarColor: '#6C5CE7',
  },
  {
    id: 'o3',
    name: 'Gurpreet',
    isOnline: false,
    statusText: 'Last seen 2h ago',
    avatarColor: '#A29BFE',
  },
  {
    id: 'o4',
    name: 'Arjun',
    isOnline: false,
    statusText: 'Last seen yesterday',
    avatarColor: '#0984E3',
  },
];
