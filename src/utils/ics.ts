// 휴대폰 캘린더에 추가: 캘린더 앱들이 공통으로 알아듣는 .ics 파일을 만들어요.
// 파일은 이 기기 안에서만 만들어지고, 어떤 서버로도 보내지지 않아요.
import type { Item } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

/** 'YYYY-MM-DD' + 'HH:MM' → '20261102T190000' (폰의 시간대를 그대로 따르는 시각) */
function localStamp(date: string, time: string): string {
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`
}

/** 1시간 뒤 날짜·시각 (자정을 넘어가면 다음 날로) */
function plusOneHour(date: string, time: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  const t = new Date(y, m - 1, d, h + 1, mi)
  return `${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}T${pad(t.getHours())}${pad(t.getMinutes())}00`
}

function utcNow(): string {
  const t = new Date()
  return `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}${pad(t.getUTCSeconds())}Z`
}

/** 쉼표, 세미콜론, 줄바꿈 같은 특수 글자를 캘린더 규칙에 맞게 바꿔요 */
function esc(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** 한 줄이 75바이트를 넘으면 나눠 써야 해요 (한글은 한 글자가 3바이트) */
function fold(line: string): string {
  const enc = new TextEncoder()
  const out: string[] = []
  let cur = ''
  let bytes = 0
  for (const ch of line) {
    const b = enc.encode(ch).length
    const limit = out.length === 0 ? 75 : 74 // 이어지는 줄은 앞에 공백 한 칸이 붙어요
    if (bytes + b > limit) {
      out.push(cur)
      cur = ''
      bytes = 0
    }
    cur += ch
    bytes += b
  }
  out.push(cur)
  return out.join('\r\n ')
}

const RRULE_FREQ = { daily: 'DAILY', weekly: 'WEEKLY', monthly: 'MONTHLY' } as const

/** 시간이 있는 항목 → .ics 글 (일정 길이 1시간, 10분 전 알림, 반복·끝나는 날·건너뛴 날 포함) */
export function buildIcs(item: Item): string {
  if (!item.time) throw new Error('시간이 있는 항목만 캘린더에 추가할 수 있어요')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hannun Planner//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${item.id}@hannun-planner`,
    `DTSTAMP:${utcNow()}`,
    `DTSTART:${localStamp(item.date, item.time)}`,
    `DTEND:${plusOneHour(item.date, item.time)}`,
    `SUMMARY:${esc(item.title)}`,
  ]
  if (item.content.trim()) lines.push(`DESCRIPTION:${esc(item.content.trim())}`)
  if (item.repeat !== 'none') {
    let rule = `RRULE:FREQ=${RRULE_FREQ[item.repeat]}`
    if (item.endDate) rule += `;UNTIL=${item.endDate.replace(/-/g, '')}T235959`
    lines.push(rule)
    const skips = item.skipDates.filter((d) => d >= item.date).sort()
    if (skips.length) lines.push(`EXDATE:${skips.map((d) => localStamp(d, item.time!)).join(',')}`)
  }
  lines.push(
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(item.title)}`,
    'TRIGGER:-PT10M', // 10분 전 알림
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  )
  return lines.map(fold).join('\r\n') + '\r\n'
}

/**
 * 캘린더 파일을 열어요.
 * - 아이폰 Safari: "캘린더에 추가" 화면이 바로 떠요.
 * - 안드로이드·컴퓨터: 파일이 내려받아지고, 그 파일을 누르면 캘린더 앱이 열려요.
 */
export function openInCalendar(item: Item): void {
  const ics = buildIcs(item)
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true

  if (isIOS && !standalone) {
    // 아이폰 Safari 는 이렇게 열어야 캘린더 추가 화면을 바로 보여줘요
    window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
    return
  }
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hannun-${item.date}-${item.time!.replace(':', '')}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
