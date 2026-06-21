export type RankTitleKey =
  | 'Scholar Supreme'
  | 'Knowledge Knight'
  | 'Brain Cadet'
  | 'Rising Mind'
  | 'Study Spark'
  | 'Getting started';

export type BonusTitleKey =
  | 'Century Scholar'
  | 'Streak Lord'
  | 'Night Owl'
  | 'Early Bird';

export type TitleKey = RankTitleKey | BonusTitleKey;

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarInitials: string;
  avatarColor: string;
  currentTitle: TitleKey | string;
  isBonusTitle: boolean;
  minutesThisWeek: number;
  hoursDisplay: string;
  rank: number;
  rankChangeVsLastWeek: number;
  isCurrentUser: boolean;
}

export interface FriendUser {
  userId: string;
  friendshipId: string;
  displayName: string;
  avatarInitials: string;
  avatarColor: string;
  currentTitle: string;
  isBonusTitle: boolean;
  minutesThisWeek: number;
}

export interface PendingRequest {
  id: string;
  fromUserId: string;
  fromDisplayName: string;
  fromAvatarInitials: string;
  fromAvatarColor: string;
  createdAt: string;
}

export interface UserSearchResult {
  userId: string;
  displayName: string;
  avatarInitials: string;
  avatarColor: string;
  currentTitle: string;
}
