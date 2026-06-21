export interface SocialActivity {
  id: string;
  actorName: string;
  description: string;
  timestamp: string;
  avatarColor?: string;
}

export interface OnlinePeerStatus {
  id: string;
  name: string;
  isOnline: boolean;
  statusText: string;
  avatarColor?: string;
}

export type SocialTab = 'overview' | 'groups' | 'peers' | 'leaderboard';
