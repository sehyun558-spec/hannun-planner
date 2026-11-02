// 날짜 계산을 도와주는 함수들이에요. 모든 날짜는 'YYYY-MM-DD' 글자로 다뤄요.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const pad = (n: number) => String(n).padStart(2, '0')

/** Date → 'YYYY-MM-DD' (내 폰의 시간대 기준) */
export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 'YYYY-MM-DD' → Date (그날 0시) */
export function fromDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayStr(): string {
  return toDateStr(new Date())
}

/** '11월 2일 월요일' */
export function formatKoreanDate(s: string): string {
  const d = fromDateStr(s)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`
}

/** '14:30' → '오후 2:30' */
export function formatKoreanTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h < 12 ? '오전' : '오후'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${ampm} ${h12}:${pad(m)}`
}

/** 지금 기준 다음 정각 'HH:00' (일정 기본 시간) */
export function nextHourStr(): string {
  const h = (new Date().getHours() + 1) % 24
  return `${pad(h)}:00`
}

export { WEEKDAYS }

/** 달력에 그릴 42칸(6주)의 날짜들. 앞뒤 달 날짜도 채워서 모양을 맞춰요. */
export function monthGrid(year: number, month: number): string[] {
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay()) // 그 주 일요일부터
  return Array.from({ length: 42 }, (_, i) =>
    toDateStr(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)),
  )
}

/** '11월 2일' (올해가 아니면 '2025년 11월 2일') */
export function formatShortDate(s: string): string {
  const d = fromDateStr(s)
  const md = `${d.getMonth() + 1}월 ${d.getDate()}일`
  return d.getFullYear() === new Date().getFullYear() ? md : `${d.getFullYear()}년 ${md}`
}
