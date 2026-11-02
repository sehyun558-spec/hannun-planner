// 옆으로 밀어서 삭제 + 눌러서 열기 기능을 담당하는 공용 블록이에요.
// 할 일 줄(ItemRow)과 메모 카드(MemoCard)가 같이 써요.
import { useRef, useState } from 'react'
import type { MouseEvent, PointerEvent, ReactNode } from 'react'

const SWIPE_START = 12 // 이만큼 옆으로 움직이면 "밀기"로 판단
const DELETE_RATIO = 0.35 // 줄 너비의 35% 넘게 밀면 삭제

/** 안쪽 버튼용: 밀기 동작 중에는 눌림을 무시하고, 바깥(열기)으로 퍼지지 않게 해줘요 */
export type TapGuard = (fn: () => void) => (e: MouseEvent) => void

interface Props {
  label: string
  onTap: () => void
  onDelete: () => void
  className?: string
  children: (guard: TapGuard) => ReactNode
}

export function SwipeRow({ label, onTap, onDelete, className = '', children }: Props) {
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

  const guard: TapGuard = (fn) => (e) => {
    e.stopPropagation()
    if (!swiped.current) fn()
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
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={() => {
          if (!swiped.current) onTap()
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return
          if (e.key === 'Enter') onTap()
          if (e.key === 'Delete') onDelete()
        }}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? 'none' : 'transform 180ms ease-out',
          touchAction: 'pan-y',
          opacity: leaving ? 0.4 : 1,
        }}
        className={`relative cursor-pointer select-none bg-white dark:bg-gray-950 ${className}`}
      >
        {children(guard)}
      </div>
    </div>
  )
}
