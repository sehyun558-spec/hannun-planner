// 캐릭터 계산 (하루싹·봄이 공통): 오늘 완료 비율 → 성장 단계, 달력 날짜 표시
import type { Item } from '../types'
import { isDoneOn, occursOn } from './items'

/** 완료 비율 → 성장 단계 (0~3) */
export function harussakStage(done: number, total: number): number {
  if (total === 0 || done === 0) return 0
  if (done >= total) return 3
  return done / total < 0.5 ? 1 : 2
}

// 캐릭터마다 다른 것(그림 주소, 한마디)은 src/data/characters.ts 에 있어요.

/**
 * 달력 날짜 표시: 'flower'(그날 할 일을 전부 끝냄) / 'sprout'(일부만) / 'none'(표시 없음)
 * - 세는 것: 할 일 + 일정 (반복 포함, 메모만 빼요)
 * - 오늘 이후 날짜, 할 일이 없던 날, 하나도 못 끝낸 날은 표시 없음 (혼내지 않게)
 */
export function dayMark(
  items: Item[],
  day: string,
  today: string,
): 'flower' | 'sprout' | 'none' {
  if (day > today) return 'none'
  // 오늘 화면의 "○개 중 ○개" 와 똑같이 세요 (매일 반복 할 일도 포함 — 빼면 그 체크를 취소해도 꽃이 남았어요)
  const list = items.filter((it) => it.kind !== 'memo' && occursOn(it, day))
  if (list.length === 0) return 'none'
  const done = list.filter((it) => isDoneOn(it, day)).length
  if (done === list.length) return 'flower'
  return done > 0 ? 'sprout' : 'none'
}
