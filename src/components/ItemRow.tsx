// 목록의 한 줄: ○ 눌러 완료, ☆ 눌러 중요, 옆으로 밀어서 삭제, 눌러서 수정
import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Item } from '../types'
import { isDoneOn } from '../utils/items'
import { formatKoreanTime } from '../utils/date'
import { CheckIcon, MemoIcon, StarIcon } from './Icons'

interface Props {
  item: Item
  /** 어느 날짜 목록에 보이는지 (반복 항목의 완료 판단용) */
  day: string
  onToggle: () => void
  onStar: () => void
  onEdit: () => void
  onDelete: () => void
}

const SWIPE_START = 12 // 이만큼 옆으로 움직이면 "밀기"로 판단
const DELETE_RATIO = 0.35 // 줄 너비의 35% 넘게 밀면 삭제

export function ItemRow({ item, day, onToggle, onStar, onEdit, onDelete }: Props) {
  const done = item.kind !== 'memo' && isDoneOn(item, day)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const start = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  const rowRef = useRef<HTMLDivElement>(null)

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    start.current = { x: e.clientX, y: e.clientY }
    swiped.current = false
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return
    const mx = e.clientX - start.current.x
    const my = e.clientY - start.current.y
    if (!dragging) {
      if (Math.abs(mx) > SWIPE_START && Math.abs(mx) > Math.abs(my)) {
        setDragging(true)
        swiped.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
      } else if (Math.abs(my) > SWIPE_START) {
        start.current = null // 위아래 스크롤이면 밀기 취소
      }
      return
    }
    setDx(mx)
  }

  const endDrag = () => {
    start.current = null
    if (!dragging) return
    setDragging(false)
    const width = rowRef.current?.offsetWidth ?? 300
    if (Math.abs(dx) > width * DELETE_RATIO) {
      setLeaving(true)
      setDx(dx > 0 ? width : -width)
      setTimeout(onDelete, 180)
    } else {
      setDx(0)
    }
  }

  return (
    <div ref={rowRef} className="relative overflow-hidden rounded-2xl">
      {/* 밀었을 때 뒤에 보이는 빨간 삭제 바탕 */}
      <div
        className={`absolute inset-0 flex items-center px-6 text-lg font-bold text-white ${
          dx > 0 ? 'justify-start' : 'justify-end'
        } ${dx === 0 ? 'bg-transparent' : 'bg-red-500'}`}
        aria-hidden
      >
        삭제
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={`${item.title} 수정하기`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={() => {
          if (!swiped.current) onEdit()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEdit()
          if (e.key === 'Delete') onDelete()
        }}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? 'none' : 'transform 180ms ease-out',
          touchAction: 'pan-y',
          opacity: leaving ? 0.4 : 1,
        }}
        className="relative flex min-h-16 cursor-pointer select-none items-center gap-1 bg-white py-2 pr-1 pl-1 dark:bg-gray-950"
      >
        {/* 완료 동그라미 (메모는 메모 표시) */}
        {item.kind === 'memo' ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center text-gray-400 dark:text-gray-500">
            <MemoIcon className="h-6 w-6" />
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (!swiped.current) onToggle()
            }}
            aria-label={done ? '완료 취소' : '완료하기'}
            aria-pressed={done}
            className="flex h-12 w-12 shrink-0 items-center justify-center"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                done
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {done && <CheckIcon className="h-4 w-4" />}
            </span>
          </button>
        )}

        <div className="min-w-0 flex-1 py-1">
          <p
            className={`break-words text-lg leading-snug ${
              done ? 'text-gray-400 line-through dark:text-gray-500' : ''
            }`}
          >
            {item.title}
          </p>
          {(item.time || item.kind !== 'todo' || item.repeat !== 'none' || item.content) && (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400">
              {item.time && (
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatKoreanTime(item.time)}
                </span>
              )}
              {item.kind === 'event' && !item.time && <span>하루 종일</span>}
              {item.kind === 'event' && <span>일정</span>}
              {item.kind === 'memo' && <span>메모</span>}
              {item.repeat !== 'none' && (
                <span>
                  🔁 {item.repeat === 'daily' ? '매일' : item.repeat === 'weekly' ? '매주' : '매월'}
                </span>
              )}
              {item.content && <span className="truncate">{item.content.split('\n')[0]}</span>}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (!swiped.current) onStar()
          }}
          aria-label={item.starred ? '중요 표시 해제' : '중요 표시'}
          aria-pressed={item.starred}
          className={`flex h-12 w-12 shrink-0 items-center justify-center ${
            item.starred ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          <StarIcon className="h-6 w-6" filled={item.starred} />
        </button>
      </div>
    </div>
  )
}
