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
    'flex h-12 min-w-12 items-center justify-center rounded-2xl px-3 font-semibold active:bg-gray-100 dark:active:bg-gray-800'

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-3xl font-bold">
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
            className={`${navBtn} text-base text-blue-600 dark:text-blue-400`}
          >
            오늘
          </button>
          <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달" className={`${navBtn} text-3xl`}>
            ›
          </button>
        </div>
      </header>

      <div onPointerDown={onDown} onPointerUp={onUp} style={{ touchAction: 'pan-y' }} className="select-none">
        <div className="grid grid-cols-7 pb-1 text-center text-sm font-semibold text-gray-400 dark:text-gray-500">
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
                className="flex h-12 flex-col items-center justify-center gap-0.5"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                    isSel
                      ? 'bg-blue-600 font-bold text-white'
                      : isToday
                        ? 'font-bold text-blue-600 ring-2 ring-blue-600 dark:text-blue-400 dark:ring-blue-400'
                        : inMonth
                          ? ''
                          : 'text-gray-300 dark:text-gray-700'
                  }`}
                >
                  {d.getDate()}
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    dot === 'open'
                      ? 'bg-blue-600 dark:bg-blue-400'
                      : dot === 'done'
                        ? 'bg-gray-300 dark:bg-gray-600'
                        : 'bg-transparent'
                  }`}
                  aria-hidden
                />
              </button>
            )
          })}
        </div>
      </div>

      <section className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <h2 className="text-xl font-bold">
          {formatKoreanDate(selected)}
          {selected === today && <span className="text-blue-600 dark:text-blue-400"> · 오늘</span>}
        </h2>
        <QuickInput date={selected} />
        <DayList day={selected} emptyText="이날은 비어 있어요" />
      </section>
    </div>
  )
}
