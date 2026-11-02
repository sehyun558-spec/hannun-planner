// 달력 화면: 월간 달력 + 고른 날짜의 목록과 바로 추가
import { useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { useItems } from '../store/ItemsContext'
import { formatKoreanDate, fromDateStr, monthGrid, WEEKDAYS } from '../utils/date'
import { isDoneOn, occursOn } from '../utils/items'
import { QuickInput } from '../components/QuickInput'
import { DayList } from '../components/DayList'

type DotState = 'none' | 'open' | 'done'

export function CalendarPage({ today }: { today: string }) {
  const { items } = useItems()
  const [selected, setSelected] = useState(today)
  const [view, setView] = useState(() => {
    const d = fromDateStr(today)
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const days = useMemo(() => monthGrid(view.y, view.m), [view])

  // 날짜별 점: 남은 일이 있으면 파란 점, 모두 끝났으면 회색 점
  const dots = useMemo(() => {
    const map = new Map<string, DotState>()
    for (const day of days) {
      const list = items.filter((it) => occursOn(it, day))
      if (list.length === 0) continue
      const open = list.some((it) => it.kind === 'memo' || !isDoneOn(it, day))
      map.set(day, open ? 'open' : 'done')
    }
    return map
  }, [days, items])

  const moveMonth = (diff: number) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + diff, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  const goToday = () => {
    const d = fromDateStr(today)
    setView({ y: d.getFullYear(), m: d.getMonth() })
    setSelected(today)
  }

  const pick = (day: string) => {
    if (justSwiped.current) return
    setSelected(day)
    const d = fromDateStr(day)
    if (d.getMonth() !== view.m) setView({ y: d.getFullYear(), m: d.getMonth() })
  }

  // 달력을 옆으로 밀면 이전/다음 달
  const swipeStart = useRef<number | null>(null)
  const justSwiped = useRef(false)
  const onDown = (e: PointerEvent) => {
    swipeStart.current = e.clientX
    justSwiped.current = false
  }
  const onUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return
    const dx = e.clientX - swipeStart.current
    swipeStart.current = null
    if (Math.abs(dx) > 60) {
      justSwiped.current = true // 밀고 손을 뗀 자리의 날짜가 눌리지 않게
      moveMonth(dx < 0 ? 1 : -1)
    }
  }

  const navBtn =
    'flex h-11 min-w-11 items-center justify-center rounded-xl px-3 font-light text-ink transition-colors duration-200 active:bg-line'

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between pt-4">
        <h1 className="text-[28px] font-light tracking-tight">
          {view.y}년 {view.m + 1}월
        </h1>
        <div className="flex items-center">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달" className={`${navBtn} text-3xl`}>
            ‹
          </button>
          <button
            type="button"
            onClick={goToday}
            aria-label="오늘로 이동"
            className={`${navBtn} text-[15px] text-ink`}
          >
            오늘
          </button>
          <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달" className={`${navBtn} text-3xl`}>
            ›
          </button>
        </div>
      </header>

      <div onPointerDown={onDown} onPointerUp={onUp} style={{ touchAction: 'pan-y' }} className="select-none">
        <div className="grid grid-cols-7 pb-2 text-center text-xs text-muted">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1" role="grid" aria-label="월간 달력">
          {days.map((day) => {
            const d = fromDateStr(day)
            const inMonth = d.getMonth() === view.m
            const isSel = day === selected
            const isToday = day === today
            const dot = dots.get(day) ?? 'none'
            return (
              <button
                key={day}
                type="button"
                onClick={() => pick(day)}
                aria-label={`${formatKoreanDate(day)}${dot !== 'none' ? ', 항목 있음' : ''}`}
                aria-pressed={isSel}
                className="flex h-12 flex-col items-center justify-center gap-1"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-base transition-colors duration-200 ${
                    isSel
                      ? 'bg-ink font-semibold text-card'
                      : isToday
                        ? 'border border-ink font-semibold'
                        : inMonth
                          ? ''
                          : 'text-muted/50'
                  }`}
                >
                  {d.getDate()}
                </span>
                <span
                  className={`h-1 w-1 rounded-full ${
                    dot === 'open' ? 'bg-ink' : dot === 'done' ? 'bg-muted/50' : 'bg-transparent'
                  }`}
                  data-dot={dot}
                  aria-hidden
                />
              </button>
            )
          })}
        </div>
      </div>

      <section className="space-y-5 border-t border-line pt-6">
        <h2 className="text-lg font-light">
          {formatKoreanDate(selected)}
          {selected === today && <span className="text-muted"> · 오늘</span>}
        </h2>
        <QuickInput date={selected} />
        <DayList day={selected} emptyText="이날은 비어 있어요" emptySub="필요하면 위에 바로 적어 보세요" />
      </section>
    </div>
  )
}
