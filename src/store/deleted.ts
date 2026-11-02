// "지운 기록": 무엇을(id) 언제(시각) 지웠는지 이 기기에 적어 둬요.
// 백업을 불러올 때, 지운 시각보다 예전 내용이면 다시 넣지 않으려고 써요.
const KEY = 'hannun-planner:deleted'

/** id → 지운 시각(ms) */
export type DeletedLog = Record<string, number>

export function loadDeleted(): DeletedLog {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as unknown
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    const out: DeletedLog = {}
    for (const [id, t] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof t === 'number') out[id] = t
    }
    return out
  } catch {
    return {}
  }
}

export function saveDeleted(log: DeletedLog) {
  try {
    localStorage.setItem(KEY, JSON.stringify(log))
  } catch {
    /* 저장 공간이 없으면 이번 실행 동안만 기억해요 */
  }
}
