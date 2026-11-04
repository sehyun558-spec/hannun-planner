// 달력 화면: 월간 달력 + 고른 날짜의 목록과 바로 추가
import { useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { useItems } from '../store/ItemsContext'
import { formatKoreanDate, fromDateStr, monthGrid, WEEKDAYS } from '../utils/date'
import { dayMark, harussakImg } from '../utils/harussak'
import { holidayName } from '../data/holidays'
import { QuickInput } from '../components/QuickInput'
import { DayList } from '../components/DayList'

export function CalendarPage({ today }: { today: string }) {
  const { items } = useItems()
  const [selected, setSelected] = useState(today)
  const [view, setView] = useState(() => {
    const d = fromDateStr(today)
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const days = useMemo(() => monthGrid(view.y, view.m), [view])

  // 날짜별 작은 하루싹: 전부 끝낸 날은 꽃, 일부만 한 날은 새싹 (오늘 이후·기록 없는 날은 표시 없음)
  const marks = useMemo(() => new Map(days.map((day) => [day, dayMark(items, day, today)])), [days, items, today])

  // 이번 달(보고 있는 달) 핀 꽃 개수
  const flowers = useMemo(
    () =>
      days.filter((day) => fromDateStr(day).getMonth() === view.m && marks.get(day) === 'flower').length,
    [days, marks, view.m],
  )
  const isThisMonth = (() => {
    const t = fromDateStr(today)
    return t.getFullYear() === view.y && t.getMonth() === view.m
  })()

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
      <header className="pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-light tracking-tight">
            {view.y}년 {view.m + 1}월
          </h1>
          <div className="flex items-center">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달" className={`${navBtn} text-3xl`}>
              ‹
            </button>
            <button type="button" onClick={goToday} aria-label="오늘로 이동" className={`${navBtn} text-[15px] text-ink`}>
              오늘
            </button>
            <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달" className={`${navBtn} text-3xl`}>
              ›
            </button>
          </div>
        </div>
        {/* 이번 달 핀 꽃 (손글씨) */}
        <p className="font-hand mt-0.5 text-[17px] text-muted">
          {isThisMonth ? '이번 달' : `${view.m + 1}월에`} 핀 꽃 {flowers}송이
        </p>
      </header>

      <div onPointerDown={onDown} onPointerUp={onUp} style={{ touchAction: 'pan-y' }} className="select-none">
        <div className="grid grid-cols-7 pb-2 text-center text-xs text-muted">
          {WEEKDAYS.map((w, i) => (
            <span key={w} className={i === 0 ? 'text-holiday' : i === 6 ? 'text-saturday' : ''}>
              {w}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1" role="grid" aria-label="월간 달력">
          {days.map((day) => {
            const d = fromDateStr(day)
            const inMonth = d.getMonth() === view.m
            const isSel = day === selected
            const isToday = day === today
            const mark = marks.get(day) ?? 'none'
            // 빨간날: 일요일·공휴일(대체공휴일 포함) / 토요일은 파란색
            const holiday = holidayName(day)
            const red = d.getDay() === 0 || !!holiday
            const blue = !red && d.getDay() === 6
            const dayColor = red
              ? inMonth
                ? 'text-holiday'
                : 'text-holiday/50'
              : blue
                ? inMonth
                  ? 'text-saturday'
                  : 'text-saturday/50'
                : inMonth
                  ? ''
                  : 'text-muted/50'
            return (
              <button
                key={day}
                type="button"
                onClick={() => pick(day)}
                aria-label={`${formatKoreanDate(day)}${holiday ? `, ${holiday}` : ''}${mark === 'flower' ? ', 할 일을 다 끝낸 날' : mark === 'sprout' ? ', 할 일을 조금 한 날' : ''}`}
                aria-pressed={isSel}
                className="flex h-14 flex-col items-center justify-start pt-0.5"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-base transition-colors duration-200 ${
                    isSel ? 'bg-ink font-semibold text-card' : `${dayColor} ${isToday ? 'border border-ink font-semibold' : ''}`
                  }`}
                >
                  {d.getDate()}
                </span>
                {/* 날짜 아래 작은 하루싹 (20px) */}
                <span className="flex h-5 w-5 items-center justify-center" data-mark={mark} aria-hidden>
                  {mark !== 'none' && (
                    <img
                      src={harussakImg(mark === 'flower' ? '4' : '1')}
                      alt=""
                      width={20}
                      height={20}
                      draggable={false}
                      className="pointer-events-none h-5 w-5 scale-[1.45] select-none"
                      style={{ transformOrigin: '50% 70%' }}
                    />
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <section className="space-y-5 border-t border-line pt-6">
        <h2 className="text-lg font-light">
          {formatKoreanDate(selected)}
          {holidayName(selected) && <span className="text-holiday"> · {holidayName(selected)}</span>}
          {selected === today && <span className="text-muted"> · 오늘</span>}
        </h2>
        <QuickInput date={selected} />
        <DayList day={selected} emptyText="이날은 비어 있어요" emptySub="필요하면 위에 바로 적어 보세요" />
      </section>
    </div>
  )
}
