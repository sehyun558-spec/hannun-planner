// 지금 고른 캐릭터를 앱 어디서나 꺼내 쓰게 해줘요. (App 이 설정값으로 채워 줘요)
import { createContext, useContext } from 'react'
import { findCharacter } from '../data/characters'
import type { Character } from '../data/characters'

export const CharacterContext = createContext<Character>(findCharacter(null))

export function useCharacter(): Character {
  return useContext(CharacterContext)
}
