// 항목 관련 계산: 어떤 날에 보이는지, 완료됐는지, 어떤 순서로 보일지.
import type { Item } from '../types'
import { fromDateStr } from './date'

/** 이 항목이 그 날짜(day)에 나타나는지 (반복 포함) */
export function occursOn(item: Item, day: string): boolean {
  if (item.date === day) return item.repeat === 'none' || !item.skipDates.includes(day)
  if (item.repeat === 'none' || day < item.date) return false
  if (item.endDate && day > item.endDate) return false // 끝나는 날 이후에는 안 나와요
  if (item.skipDates.includes(day)) return false // "이 날만 삭제"한 날
  const start = fromDateStr(item.date)
  const target = fromDateStr(day)
  switch (item.repeat) {
    case 'daily':
      return true
    case 'weekly':
      return start.getDay() === target.getDay()
    case 'monthly': {
      // 31일처럼 없는 날이 있는 달은 그달 마지막 날에 보여줘요.
      const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
      return Math.min(start.getDate(), lastDay) === target.getDate()
    }
  }
}

/** 그 날짜 기준으로 완료됐는지 */
export function isDoneOn(item: Item, day: string): boolean {
  return item.repeat === 'none' ? item.done : item.doneDates.includes(day)
}

/** 정렬: 별표 먼저 → 시간 있는 것(시간순) → 시간 없는 것(만든 순서) */
export function sortItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1
    if (a.time && b.time) return a.time.localeCompare(b.time) || a.createdAt - b.createdAt
    if (a.time) return -1
    if (b.time) return 1
    return a.createdAt - b.createdAt
  })
}

/** 고유 번호 만들기 (어떤 폰 브라우저에서도 동작하도록 단순하게) */
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** 검색용 글자 정리: 대소문자·띄어쓰기 무시 ("팀회의"로 "팀 회의"도 찾기) */
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')

/** 제목이나 내용에 검색어가 들어 있는지 */
export function matchesQuery(item: Item, query: string): boolean {
  const q = norm(query)
  if (!q) return true
  return norm(item.title).includes(q) || norm(item.content).includes(q)
}
