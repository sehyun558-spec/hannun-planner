// 일정 길이 고르기: [30분] [1시간] [2시간] [직접]
// - 빠른 입력(일정)과 수정 창에서 시작 시간 아래에 보여요. 기본은 1시간
// - [직접]을 누르면 끝나는 시간을 직접 고르는 칸이 나와요
import { useState } from 'react'
import { PickerField } from './PickerField'
import { addMinutes, durationBetween, formatDuration } from '../utils/time'
import { formatKoreanTime } from '../utils/date'

const PRESETS = [30, 60, 120]

interface Props {
  /** 시작 시간 'HH:MM' */
  start: string
  /** 지금 끝나는 시간 'HH:MM' (예전 항목은 시작 + 1시간으로 계산해서 넘겨줘요) */
  end: string
  onChange: (end: string) => void
}

export function DurationPicker({ start, end, onChange }: Props) {
  const minutes = durationBetween(start, end)
  // 미리 정한 길이(30분·1시간·2시간)가 아니면 처음부터 [직접]
  const [custom, setCustom] = useState(() => !PRESETS.includes(minutes))

  const chip = (active: boolean) =>
    `h-10 flex-1 rounded-xl text-[15px] transition-colors duration-200 ${
      active ? 'border border-line bg-card font-semibold text-ink' : 'border border-transparent text-muted'
    }`

  return (
    <div className="space-y-2">
      <div className="flex gap-1" role="radiogroup" aria-label="일정 길이">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={!custom && minutes === m}
            onClick={() => {
              setCustom(false)
              onChange(addMinutes(start, m))
            }}
            className={chip(!custom && minutes === m)}
          >
            {formatDuration(m)}
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={custom}
          onClick={() => setCustom(true)}
          className={chip(custom)}
        >
          직접
        </button>
      </div>
      {custom && (
        <div className="flex items-center gap-2">
          <span className="shrink-0 px-1 text-[13px] text-muted">끝나는 시간</span>
          <PickerField
            type="time"
            label="끝나는 시간"
            value={end}
            onChange={(v) => v && onChange(v)}
            display={`${formatKoreanTime(end)} · ${formatDuration(minutes)}`}
            className="min-w-0 flex-1"
          />
        </div>
      )}
    </div>
  )
}
