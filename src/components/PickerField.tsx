// 날짜·시간 칸: 글자는 우리가 직접 가운데에 그리고,
// 그 위에 보이지 않는 진짜 날짜·시간 칸을 겹쳐서 누르면 폰 기본 선택 화면이 떠요.
// (아이폰은 날짜·시간 칸 모양을 마음대로 그려서, 글자가 위로 붙거나 칸이 넘치는 문제가 있었어요)
import { useRef } from 'react'

interface Props {
  type: 'date' | 'time'
  value: string
  onChange: (v: string) => void
  /** 칸에 보여줄 글자 (예: '11월 2일 (월)', '오후 10:00') */
  display: string
  label: string
  className?: string
}

export function PickerField({ type, value, onChange, display, label, className = '' }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div
      className={`relative h-12 min-w-0 rounded-xl border border-line bg-card transition-colors duration-200 focus-within:border-muted ${className}`}
    >
      <span
        className={`pointer-events-none flex h-full items-center truncate px-4 text-base ${value ? 'text-ink' : 'text-muted'}`}
        aria-hidden
      >
        {display}
      </span>
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => {
          // 컴퓨터 브라우저에서도 칸 아무 데나 누르면 선택 화면이 뜨게
          try {
            ref.current?.showPicker?.()
          } catch {
            /* 이미 열려 있거나 지원하지 않으면 무시 */
          }
        }}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer text-base opacity-0"
      />
    </div>
  )
}
