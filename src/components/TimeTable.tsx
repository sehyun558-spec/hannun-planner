// 오늘 화면 [일정] 보기: 시간표 블록
// - 왼쪽에 1시간 간격 시간 줄, 일정은 시작~끝 길이만큼 높이가 늘어나는 블록 (1시간 = 60px, 30분 = 반 칸)
// - 시간 줄 범위: 그날 가장 이른 일정 1시간 전 ~ 가장 늦은 일정 1시간 뒤 (자동)
// - 겹치는 일정은 옆으로 나란히, 지금 시각에 얇은 가로줄 + 처음 열 때 그 위치로 스크롤
// - 블록에서도 완료 체크·☆가 할 일 목록과 똑같은 데이터를 바꿔요 (서로 연동), 누르면 수정 창
// - 시간 없는 할 일·하루 종일 일정은 위쪽 "시간 없음" 칸에 작게 모아요
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Item } from '../types'
import { useItems } from '../store/ItemsContext'
import { isDoneOn, occursOn, sortItems } from '../utils/items'
import { effectiveEnd, itemDuration, shortTimeRange, toMin } from '../utils/time'
import { CheckCircle } from './CheckCircle'
import { StarIcon } from './Icons'

const PX_PER_MIN = 1 // 1시간 = 60px
const MIN_BLOCK = 30 // 아주 짧은 일정도 반 칸(30분) 크기로는 보여요 (누를 수 있게)
const SHORT_BLOCK = 45 // 이보다 짧은 블록은 제목만 한 줄
const GUTTER = 56 // 왼쪽 시간 글자 자리(px)

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

const nowMinutes = () => {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

interface Props {
  day: string
  /** 오늘이면 지금 시각 줄을 그려요 */
  isToday: boolean
  onEdit: (item: Item) => void
}

export function TimeTable({ day, isToday, onEdit }: Props) {
  const { items, toggleDone, toggleStar } = useItems()

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
  const base = startH * 60

  // 지금 시각 (1분마다 새로)
  const [now, setNow] = useState(nowMinutes)
  useEffect(() => {
    if (!isToday) return
    const t = setInterval(() => setNow(nowMinutes()), 30_000)
    return () => clearInterval(t)
  }, [isToday])
  const showNow = isToday && placed.length > 0 && now >= startH * 60 && now <= endH * 60

  // 처음 열 때: 지금 시각 줄(없으면 첫 일정)이 화면 위쪽 1/3쯤 오게 스크롤
  const gridRef = useRef<HTMLDivElement>(null)
  const scrolled = useRef(false)
  useLayoutEffect(() => {
    const grid = gridRef.current
    if (scrolled.current || !grid) return
    scrolled.current = true
    const target = (showNow ? now : placed[0]?.start ?? base) - base
    const y = grid.getBoundingClientRect().top + window.scrollY + target * PX_PER_MIN
    const inView = y > window.scrollY + window.innerHeight * 0.2 && y < window.scrollY + window.innerHeight * 0.8
    if (inView) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, y - window.innerHeight * 0.35), behavior: reduce ? 'auto' : 'smooth' })
  })

  if (dayItems.length === 0) {
    return (
      <div className="py-14 text-center">
        <p className="text-base text-ink/80">오늘은 정해진 일정이 없어요</p>
        <p className="mt-1 text-[13px] text-muted">위에서 시간을 정해 일정을 추가해 보세요</p>
      </div>
    )
  }

  const starBtn = (it: Item) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        toggleStar(it.id)
      }}
      aria-label={it.starred ? '중요 표시 해제' : '중요 표시'}
      aria-pressed={it.starred}
      className={`flex h-9 w-9 shrink-0 items-center justify-center transition-colors duration-200 ${
        it.starred ? 'text-ink' : 'text-muted/40'
      }`}
    >
      <StarIcon className="h-4 w-4" filled={it.starred} />
    </button>
  )
  const check = (it: Item) => (
    <CheckCircle
      size="sm"
      done={isDoneOn(it, day)}
      onClick={(e) => {
        e.stopPropagation()
        toggleDone(it.id, day)
      }}
    />
  )

  return (
    <div className="space-y-5">
      {/* 시간 없는 할 일 · 하루 종일 일정 */}
      {untimed.length > 0 && (
        <section aria-label="시간 없음">
          <p className="mb-1.5 px-1 text-[13px] text-muted">시간 없음</p>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-card px-1">
            {untimed.map((it) => {
              const done = isDoneOn(it, day)
              return (
                <li key={it.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`${it.title} 수정하기`}
                    onClick={() => onEdit(it)}
                    onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && onEdit(it)}
                    className="flex min-h-11 cursor-pointer items-center gap-0.5"
                  >
                    {check(it)}
                    <span className="min-w-0 flex-1 truncate text-[15px]">
                      <span className={`strike ${done ? 'is-done' : ''}`}>{it.title}</span>
                    </span>
                    {it.kind === 'event' && <span className="shrink-0 text-[12px] text-muted">하루 종일</span>}
                    {starBtn(it)}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {placed.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-muted">시간을 정한 일정이 없어요</p>
      ) : (
        <div
          ref={gridRef}
          className="relative"
          style={{ height: (endH - startH) * 60 * PX_PER_MIN }}
          aria-label="오늘 시간표"
        >
          {/* 1시간 간격 시간 줄 */}
          {Array.from({ length: endH - startH + 1 }, (_, i) => startH + i).map((h) => (
            <div
              key={h}
              className="pointer-events-none absolute right-0 left-0 flex h-0 items-center"
              style={{ top: (h * 60 - base) * PX_PER_MIN }}
              aria-hidden
            >
              <span
                className="shrink-0 pr-2 text-right text-[11px] leading-none whitespace-nowrap text-muted"
                style={{ width: GUTTER }}
              >
                {hourLabel(h)}
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>
          ))}

          {/* 일정 블록 */}
          <div className="absolute top-0 right-0 bottom-0" style={{ left: GUTTER + 4 }}>
            {placed.map(({ item: it, start, end, col, cols }) => {
              const done = isDoneOn(it, day)
              const height = (end - start) * PX_PER_MIN
              const short = end - start < SHORT_BLOCK
              const range = shortTimeRange(it.time!, effectiveEnd(it)!)
              return (
                <div
                  key={it.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${it.title} ${range} 수정하기`}
                  onClick={() => onEdit(it)}
                  onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && onEdit(it)}
                  className={`absolute flex cursor-pointer gap-0 overflow-hidden rounded-xl transition-opacity duration-200 ${
                    short ? 'items-center' : 'items-start'
                  } ${
                    it.kind === 'event'
                      ? 'border-l-[3px] border-sage bg-sage/15'
                      : 'border border-sage/40 bg-card'
                  } ${done ? 'opacity-50' : ''}`}
                  style={{
                    top: (start - base) * PX_PER_MIN + 1,
                    height: height - 2,
                    left: `calc(${(col / cols) * 100}% + ${col ? 2 : 0}px)`,
                    width: `calc(${100 / cols}% - ${col ? 2 : 0}px)`,
                  }}
                >
                  <span className={short ? '' : 'pt-0.5'}>{check(it)}</span>
                  <div className={`min-w-0 flex-1 ${short ? '' : 'pt-2'}`}>
                    <p className={`text-[14px] leading-snug ${short ? 'truncate' : 'line-clamp-2'}`}>
                      <span className={`strike ${done ? 'is-done' : ''}`}>{it.title}</span>
                    </p>
                    {!short && <p className="mt-0.5 truncate text-[12px] text-muted">{range}</p>}
                  </div>
                  {/* 셋 이상 나란히면 좁아서 ☆는 수정 창·할 일 목록에서 */}
                  {cols < 3 && <span className={short ? '' : 'pt-0.5'}>{starBtn(it)}</span>}
                </div>
              )
            })}
          </div>

          {/* 지금 시각 줄 */}
          {showNow && (
            <div
              className="pointer-events-none absolute right-0 z-10 flex h-0 items-center"
              style={{ top: (now - base) * PX_PER_MIN, left: GUTTER - 4 }}
              aria-label="지금 시각"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-sage" />
              <span className="h-[1.5px] flex-1 bg-sage" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
