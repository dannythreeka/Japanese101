export interface Profile {
  profile_id: string;
  name: string;
  avatar_id: string;
  created_at: string;
  last_played: string;
}

export interface AvatarOption {
  id: string;
  emoji: string;
  bg: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'fox', emoji: '🦊', bg: 'bg-orange-100' },
  { id: 'cat', emoji: '🐱', bg: 'bg-pink-100' },
  { id: 'rabbit', emoji: '🐰', bg: 'bg-purple-100' },
  { id: 'penguin', emoji: '🐧', bg: 'bg-blue-100' },
  { id: 'duck', emoji: '🐥', bg: 'bg-yellow-100' },
  { id: 'bear', emoji: '🐻', bg: 'bg-amber-100' },
  { id: 'dragon', emoji: '🐲', bg: 'bg-emerald-100' },
  { id: 'owl', emoji: '🦉', bg: 'bg-indigo-100' },
];

export function getAvatarEmoji(avatarId: string): string {
  return AVATAR_OPTIONS.find((a) => a.id === avatarId)?.emoji ?? '🦊';
}
