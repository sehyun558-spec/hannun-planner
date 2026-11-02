// localStorage(브라우저 안의 개인 금고)에 저장하고 불러오는 파일이에요.
// 데이터는 이 기기 밖으로 절대 나가지 않아요.
import type { Item } from '../types'
import { todayStr } from '../utils/date'

const KEY = 'hannun-planner:v1'

interface SavedData {
  version: 1
  items: Item[]
}

/** 예전 데이터에 빠진 칸이 있어도 안전하게 채워 넣어요. */
export function normalizeItem(raw: Partial<Item>): Item | null {
  if (!raw || typeof raw.id !== 'string' || typeof raw.title !== 'string') return null
  const now = Date.now()
  return {
    id: raw.id,
    kind: raw.kind === 'event' || raw.kind === 'memo' ? raw.kind : 'todo',
    title: raw.title,
    content: typeof raw.content === 'string' ? raw.content : '',
    date: typeof raw.date === 'string' ? raw.date : todayStr(),
    time: typeof raw.time === 'string' && raw.time ? raw.time : null,
    done: !!raw.done,
    doneDates: Array.isArray(raw.doneDates) ? raw.doneDates : [],
    starred: !!raw.starred,
    repeat:
      raw.repeat === 'daily' || raw.repeat === 'weekly' || raw.repeat === 'monthly'
        ? raw.repeat
        : 'none',
    skipDates: Array.isArray(raw.skipDates) ? raw.skipDates.filter((d) => typeof d === 'string') : [],
    endDate: typeof raw.endDate === 'string' && raw.endDate ? raw.endDate : null,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : now,
  }
}

export function loadItems(): Item[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as SavedData
    return (data.items ?? []).map(normalizeItem).filter((i): i is Item => i !== null)
  } catch {
    // 저장된 내용이 망가졌다면 지우지 않고 따로 보관해 둬요 (혹시 모를 복구용).
    try {
      if (raw) localStorage.setItem(`${KEY}:broken-${Date.now()}`, raw)
    } catch {
      /* 저장 공간이 없으면 어쩔 수 없어요 */
    }
    return []
  }
}

export function saveItems(items: Item[]): boolean {
  try {
    const data: SavedData = { version: 1, items }
    localStorage.setItem(KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}
