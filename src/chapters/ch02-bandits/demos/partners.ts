// Shared partner definitions used by both DatingGame and AgentPlaysDemo
export interface Partner {
  name: string
  emoji: string
  vibe: string
  trueScore: number
}

export const PARTNERS: Partner[] = [
  { name: 'Alex', emoji: '\u{1F9D1}\u200D\u{1F3A8}', vibe: 'Artsy & thoughtful', trueScore: 4.5 },
  { name: 'Jordan', emoji: '\u{1F9D7}', vibe: 'Outdoorsy & adventurous', trueScore: 6.5 },
  { name: 'Casey', emoji: '\u{1F373}', vibe: 'Foodie & warm', trueScore: 8.0 },
]

export const TOTAL_NIGHTS = 5
