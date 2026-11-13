// 시간 계산 도우미: 시작~끝 시간, 길이, "오후 1:00 – 2:00" 같은 글자 만들기
// - 끝나는 시간(endTime)이 없는 예전 항목은 "시작 + 1시간"으로 계산만 해요 (저장된 데이터는 그대로)
// - 끝 시간이 시작보다 이르면(예: 23:00 – 00:30) 자정을 넘어 다음 날에 끝나는 것으로 봐요
import type { Item } from '../types'

/** 길이를 따로 정하지 않았을 때의 기본 길이 (분) */
export const DEFAULT_DURATION = 60

const pad = (n: number) => String(n).padStart(2, '0')

/** 'HH:MM' → 0시부터 몇 분 */
export function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** 분 → 'HH:MM' (24시간을 넘으면 다음 날 시각으로) */
export function fromMin(min: number): string {
  const m = ((min % 1440) + 1440) % 1440
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
}

/** 'HH:MM' 에 분을 더한 시각 */
export function addMinutes(t: string, minutes: number): string {
  return fromMin(toMin(t) + minutes)
}

/** 시작~끝 길이(분). 끝이 시작과 같거나 이르면 자정을 넘긴 것으로 봐요 */
export function durationBetween(start: string, end: string): number {
  const d = toMin(end) - toMin(start)
  return d > 0 ? d : d + 1440
}

/** 화면에 쓸 끝나는 시간: 저장된 끝 시간, 없으면 시작 + 1시간 (시간 없는 항목은 null) */
export function effectiveEnd(item: Pick<Item, 'time' | 'endTime'>): string | null {
  if (!item.time) return null
  return item.endTime ?? addMinutes(item.time, DEFAULT_DURATION)
}

/** 항목 길이(분) */
export function itemDuration(item: Pick<Item, 'time' | 'endTime'>): number {
  const end = effectiveEnd(item)
  return item.time && end ? durationBetween(item.time, end) : 0
}

/** '13:00' → '오후 1:00' 의 앞부분/뒷부분 */
function parts(t: string): { ampm: string; hm: string } {
  const [h, m] = t.split(':').map(Number)
  return { ampm: h < 12 ? '오전' : '오후', hm: `${h % 12 === 0 ? 12 : h % 12}:${pad(m)}` }
}

/** '오후 1:00 – 2:00' (오전/오후가 바뀌면 '오전 11:30 – 오후 12:30') */
export function formatTimeRange(start: string, end: string): string {
  const a = parts(start)
  const b = parts(end)
  return a.ampm === b.ampm && durationBetween(start, end) < 720
    ? `${a.ampm} ${a.hm} – ${b.hm}`
    : `${a.ampm} ${a.hm} – ${b.ampm} ${b.hm}`
}

/** 항목의 시간 글자 (시간 없으면 빈 글자) */
export function itemTimeText(item: Pick<Item, 'time' | 'endTime'>): string {
  const end = effectiveEnd(item)
  return item.time && end ? formatTimeRange(item.time, end) : ''
}

/** 시간표 블록용 짧은 글자: '1:00 – 2:00' (오전/오후 없이) */
export function shortTimeRange(start: string, end: string): string {
  return `${parts(start).hm} – ${parts(end).hm}`
}

/** '30분', '1시간', '1시간 30분' */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m}분`
  return m ? `${h}시간 ${m}분` : `${h}시간`
}

/** 저장된 글자가 'HH:MM' 모양인지 */
export function isTimeStr(v: unknown): v is string {
  return typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)
}
