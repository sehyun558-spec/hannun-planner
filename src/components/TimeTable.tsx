// 오늘 화면 [일정] 보기: 시간표 블록 (v1.10.1 미니멀)
// - 일정이 있는 시간대는 1시간 = 60px, 일정이 없는 시간대는 아주 얇게 접어요 (빈 공간이 길게 생기지 않게)
// - 블록: 아주 연한 테마 색 바탕 + 둥근 모서리만. 안에는 제목과 "1:00 – 2:00" (30분 이하는 "독서 · 1:00" 한 줄)
// - 블록을 누르면 작은 창에서 완료 / ☆ / 수정 / 삭제 (할 일 목록과 같은 데이터라 서로 연동)
// - 완료한 일정은 흐리게 + 제목에 줄 긋기, 지금 시각에 얇은 줄 + 처음 열 때 그 위치로 스크롤
// - 시간 없는 할 일·하루 종일 일정은 위쪽에 작은 회색 "시간 없음" 아래 한 줄씩
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Item } from '../types'
import { useItems } from '../store/ItemsContext'
import { isDoneOn, occursOn, sortItems } from '../utils/items'
import { effectiveEnd, itemDuration, shortTimeRange, toMin } from '../utils/time'

const HOUR = 60 // 일정이 있는 시간대 1시간 높이(px)
const GAP = 14 // 일정이 없는 시간대를 접은 높이(px, 몇 시간이 비어도 이만큼)
const MIN_BLOCK = 30 // 아주 짧은 일정도 반 칸(30분) 크기로는 보여요 (누를 수 있게)
const ONE_LINE = 30 // 이 길이(분) 이하는 "제목 · 1:00" 한 줄
const GUTTER = 52 // 왼쪽 시간 글자 자리(px)

interface Placed {
  item: Item
  start: number // 분
  end: number // 화면에 그릴 끝(분, 최소 30분, 자정에서 잘라요)
  col: number
  cols: number
}

/** 겹치는 일정끼리 묶어서 옆으로 나란히 놓을 칸(col)을 정해요 */
function layout(items: Item[]): Placed[] {
  const list = items
    .map((item) => {
      const start = toMin(item.time!)
      const end = Math.min(1440, start + Math.max(itemDuration(item), MIN_BLOCK))
      return { item, start, end, col: 0, cols: 1 }
    })
    .sort((a, b) => a.start - b.start || b.end - a.end)

  const out: Placed[] = []
  let group: Placed[] = []
  let colEnds: number[] = []
  let groupEnd = -1
  const flush = () => {
    for (const p of group) p.cols = colEnds.length
    out.push(...group)
    group = []
    colEnds = []
  }
  for (const p of list) {
    if (p.start >= groupEnd && group.length) flush()
    let col = colEnds.findIndex((e) => e <= p.start)
    if (col < 0) {
      col = colEnds.length
      colEnds.push(p.end)
    } else colEnds[col] = p.end
    p.col = col
    group.push(p)
    groupEnd = Math.max(groupEnd, p.end)
  }
  flush()
  return out
}

function hourLabel(h: number): string {
  if (h === 0 || h === 24) return '자정'
  if (h === 12) return '정오'
  return `${h < 12 ? '오전' : '오후'} ${h % 12}시`
}

/** '13:30' → '1:30' */
function shortTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`
}

/**
 * 시간 → 화면 높이 자: 일정이 있는 시간대는 60px, 빈 시간대는 몇 시간이 이어지든 합쳐서 14px
 * top[h] = h시 정각의 y 위치
 */
function makeScale(placed: Placed[], startH: number, endH: number) {
  const busy = new Set<number>()
  for (const p of placed) for (let h = Math.floor(p.start / 60); h * 60 < p.end; h++) busy.add(h)
  const height: Record<number, number> = {}
  for (let h = startH; h < endH; ) {
    if (busy.has(h)) {
      height[h] = HOUR
      h++
      continue
    }
    let k = h
    while (k < endH && !busy.has(k)) k++
    for (let x = h; x < k; x++) height[x] = GAP / (k - h) // 빈 시간대 묶음을 얇게 나눠 가져요
    h = k
  }
  const top: Record<number, number> = {}
  let y = 0
  for (let h = startH; h <= endH; h++) {
    top[h] = y
    if (h < endH) y += height[h]
  }
  const yOf = (min: number) => {
    const h = Math.min(endH - 1, Math.max(startH, Math.floor(min / 60)))
    return top[h] + ((min - h * 60) / 60) * height[h]
  }
  return { busy, top, total: y, yOf }
}

const nowMinutes = () => {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

interface Props {
  day: string
  /** 오늘이면 지금 시각 줄을 그려요 */
  isToday: boolean
  /** 블록·줄을 눌렀을 때 (완료/☆/수정/삭제 고르는 작은 창) */
  onOpen: (item: Item) => void
}

export function TimeTable({ day, isToday, onOpen }: Props) {
  const { items } = useItems()

  const dayItems = useMemo(
    () => items.filter((it) => it.kind !== 'memo' && occursOn(it, day)),
    [items, day],
  )
  const timed = useMemo(() => dayItems.filter((it) => it.time), [dayItems])
  const untimed = useMemo(() => sortItems(dayItems.filter((it) => !it.time)), [dayItems])
  const placed = useMemo(() => layout(timed), [timed])

  // 시간 줄 범위 (정시 단위): 가장 이른 시작 1시간 전 ~ 가장 늦은 끝 1시간 뒤
  const startH = placed.length ? Math.max(0, Math.floor(Math.min(...placed.map((p) => p.start)) / 60) - 1) : 0
  const endH = placed.length ? Math.min(24, Math.ceil(Math.max(...placed.map((p) => p.end)) / 60) + 1) : 0
  const scale = useMemo(() => makeScale(placed, startH, endH), [placed, startH, endH])

  // 지금 시각 (30초마다 새로)
  const [now, setNow] = useState(nowMinutes)
  useEffect(() => {
    if (!isToday) return
    const t = setInterval(() => setNow(nowMinutes()), 30_000)
    return () => clearInterval(t)
  }, [isToday])
  const showNow = isToday && placed.length > 0 && now >= startH * 60 && now <= endH * 60

  // 처음 열 때: 지금 시각 줄(없으면 첫 일정)이 화면 위쪽 1/3쯤 오게 스크롤 (이미 보이면 그대로)
  const gridRef = useRef<HTMLDivElement>(null)
  const scrolled = useRef(false)
  useLayoutEffect(() => {
    const grid = gridRef.current
    if (scrolled.current || !grid) return
    scrolled.current = true
    const target = scale.yOf(showNow ? now : (placed[0]?.start ?? startH * 60))
    const y = grid.getBoundingClientRect().top + window.scrollY + target
    const inView = y > window.scrollY + window.innerHeight * 0.2 && y < window.scrollY + window.innerHeight * 0.8
    if (inView) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, y - window.innerHeight * 0.35), behavior: reduce ? 'auto' : 'smooth' })
  })

  if (dayItems.length === 0) {
    return (
      <div className="py-14 text-center">
        <p className="text-[15px] text-ink/80">오늘은 정해진 일정이 없어요</p>
        <p className="mt-1 text-[12px] text-muted">입력칸 오른쪽 시계로 시간을 정해 추가해 보세요</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 시간 없는 할 일 · 하루 종일 일정: 카드 없이 한 줄씩 */}
      {untimed.length > 0 && (
        <section aria-label="시간 없음">
          <p className="mb-1 text-[12px] text-muted">시간 없음</p>
          <ul>
            {untimed.map((it) => {
              const done = isDoneOn(it, day)
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(it)}
                    aria-label={`${it.title}${done ? ' (완료)' : ''}`}
                    className={`block min-h-11 w-full truncate py-2.5 text-left text-[15px] transition-opacity duration-200 ${
                      done ? 'opacity-50' : ''
                    }`}
                  >
                    <span className={`strike ${done ? 'is-done' : ''}`}>{it.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {placed.length > 0 && (
        <div ref={gridRef} className="relative" style={{ height: scale.total }} aria-label="오늘 시간표">
          {/* 시간 글씨·가로줄: 일정이 있는 시간대가 시작하는 정각에만 (빈 시간대는 접혀서 글씨가 겹치지 않게) */}
          {Array.from({ length: endH - startH }, (_, i) => startH + i)
            .filter((h) => scale.busy.has(h))
            .map((h) => (
              <div
                key={h}
                className="pointer-events-none absolute right-0 left-0 flex h-0 items-center"
                style={{ top: scale.top[h] }}
                aria-hidden
              >
                <span
                  className="shrink-0 pr-2 text-right text-[12px] leading-none whitespace-nowrap text-muted/60"
                  style={{ width: GUTTER }}
                >
                  {hourLabel(h)}
                </span>
                <span className="h-px flex-1 bg-line/70" />
              </div>
            ))}

          {/* 일정 블록 */}
          <div className="absolute top-0 right-0 bottom-0" style={{ left: GUTTER + 4 }}>
            {placed.map(({ item: it, start, end, col, cols }) => {
              const done = isDoneOn(it, day)
              const top = scale.yOf(start)
              const height = scale.yOf(end) - top
              const oneLine = itemDuration(it) <= ONE_LINE
              const range = shortTimeRange(it.time!, effectiveEnd(it)!)
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => onOpen(it)}
                  aria-label={`${it.title} ${range}${done ? ' (완료)' : ''}`}
                  className={`absolute flex flex-col overflow-hidden rounded-lg bg-[color-mix(in_srgb,var(--sage)_15%,var(--paper))] px-3 text-left transition-opacity duration-200 active:bg-[color-mix(in_srgb,var(--sage)_25%,var(--paper))] ${
                    oneLine ? 'justify-center' : 'justify-start py-1.5'
                  } ${done ? 'opacity-50' : ''}`}
                  style={{
                    top: top + 1,
                    height: height - 2,
                    left: `calc(${(col / cols) * 100}% + ${col ? 3 : 0}px)`,
                    width: `calc(${100 / cols}% - ${col ? 3 : 0}px)`,
                  }}
                >
                  {oneLine ? (
                    <span className="truncate text-[15px] leading-tight text-ink">
                      <span className={`strike ${done ? 'is-done' : ''}`}>{it.title}</span>
                      <span className="text-[12px] text-muted"> · {shortTime(it.time!)}</span>
                    </span>
                  ) : (
                    <>
                      <span className="truncate text-[15px] leading-tight text-ink">
                        <span className={`strike ${done ? 'is-done' : ''}`}>{it.title}</span>
                      </span>
                      <span className="mt-0.5 truncate text-[12px] leading-tight text-muted">{range}</span>
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {/* 지금 시각 줄 */}
          {showNow && (
            <div
              className="pointer-events-none absolute right-0 z-10 flex h-0 items-center"
              style={{ top: scale.yOf(now), left: GUTTER - 2 }}
              aria-label="지금 시각"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
              <span className="h-px flex-1 bg-sage" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
