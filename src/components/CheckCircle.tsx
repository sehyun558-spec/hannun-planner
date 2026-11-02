// 완료 동그라미: 누르면 세이지 그린으로 채워지고, 체크 표시가 펜으로 긋듯 그려져요.
import type { MouseEvent } from 'react'
import { haptic } from '../utils/haptic'

interface Props {
  done: boolean
  onClick: (e: MouseEvent) => void
  /** 'lg' 는 "오늘의 한 가지"용 큰 동그라미 */
  size?: 'md' | 'lg'
}

export function CheckCircle({ done, onClick, size = 'md' }: Props) {
  const box = size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
  return (
    <button
      type="button"
      onClick={(e) => {
        if (!done) haptic()
        onClick(e)
      }}
      aria-label={done ? '완료 취소' : '완료하기'}
      aria-pressed={done}
      className={`flex shrink-0 items-center justify-center ${size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'}`}
    >
      <span
        className={`flex ${box} items-center justify-center rounded-full border-[1.5px] transition-colors duration-200 ${
          done ? 'is-done border-sage bg-sage' : 'border-muted bg-card'
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-[70%] w-[70%]" aria-hidden>
          <path
            className="check-path"
            d="M6 12.5l4 4L18 8"
            fill="none"
            stroke="var(--card)"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  )
}
