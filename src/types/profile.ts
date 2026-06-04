export interface Profile {
  profile_id: string
  name: string
  avatar_emoji: string
  created_at: number
  last_played: number
}

export const AVATAR_EMOJIS = ['🦊', '🐱', '🐶', '🐰', '🐻', '🐼', '🐥', '🐹'] as const
export type AvatarEmoji = (typeof AVATAR_EMOJIS)[number]
