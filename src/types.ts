// 앱에서 다루는 "항목" 하나가 어떤 모양인지 정의하는 파일이에요.

/** 항목 종류: 할 일 / 일정 / 메모 */
export type ItemKind = 'todo' | 'event' | 'memo'

/** 반복: 안 함 / 매일 / 매주 / 매월 */
export type Repeat = 'none' | 'daily' | 'weekly' | 'monthly'

export interface Item {
  id: string
  kind: ItemKind
  title: string
  /** 메모 내용이나 추가 설명 */
  content: string
  /** 날짜 'YYYY-MM-DD' (메모는 만든 날짜) */
  date: string
  /** 시간 'HH:MM' (없으면 null) */
  time: string | null
  /** 완료 여부 (반복 안 하는 항목용) */
  done: boolean
  /** 반복 항목에서 완료한 날짜들 */
  doneDates: string[]
  /** 중요(별) 표시 → 맨 위 고정 */
  starred: boolean
  repeat: Repeat
  /** 반복 항목에서 "이 날만 삭제"로 건너뛴 날짜들 */
  skipDates: string[]
  /** 반복이 끝나는 날 'YYYY-MM-DD' (없으면 계속 반복) */
  endDate: string | null
  createdAt: number
  updatedAt: number
}

export const KIND_LABEL: Record<ItemKind, string> = {
  todo: '할 일',
  event: '일정',
  memo: '메모',
}
