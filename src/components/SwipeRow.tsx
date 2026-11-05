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
  /** 지울 때 줄이 접히며 사라질지 (반복 항목처럼 "이 날만/전체"를 물어보는 경우엔 false) */
  collapse?: boolean
  /** 배경색까지 포함한 모양 (예: 'bg-paper ...') */
  className?: string
  children: (guard: TapGuard) => ReactNode
}

export function SwipeRow({ label, onTap, onDelete, collapse = true, className = '', children }: Props) {
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
      setTimeout(() => {
        const el = rowRef.current
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (collapse && el && !reduce) {
          // 줄 높이를 0으로 접어서, 아래 줄들이 툭 튀지 않고 부드럽게 따라 올라오게 해요
          el.style.height = `${el.offsetHeight}px`
          void el.offsetHeight // 지금 높이를 먼저 확정
          el.style.transition = 'height 200ms ease-out'
          el.style.height = '0px'
          setTimeout(onDelete, 200)
          return
        }
        onDelete()
        // 반복 항목에서 "취소"를 고르면 항목이 남아 있으니, 줄을 제자리로 돌려놔요
        setLeaving(false)
        setDx(0)
      }, 220)
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
      {/* 밀었을 때 뒤에 보이는 진한 삭제 바탕 */}
      <div
        className={`absolute inset-0 flex items-center px-6 text-[15px] font-semibold text-card ${
          dx > 0 ? 'justify-start' : 'justify-end'
        } ${dx === 0 ? 'bg-transparent' : 'bg-ink'}`}
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
          // 배경색은 시간대가 바뀔 때 1초에 걸쳐 함께 바뀌어요
          transition: dragging ? 'none' : 'transform 220ms ease-out, background-color var(--daypart-fade) ease',
          touchAction: 'pan-y',
          opacity: leaving ? 0.4 : 1,
        }}
        className={`relative cursor-pointer select-none ${className}`}
      >
        {children(guard)}
      </div>
    </div>
  )
}
