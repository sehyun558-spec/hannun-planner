// 빠른 입력칸의 🕐 를 누르면 올라오는 작은 창: 시작 시간 + 길이 [30분][1시간][2시간][직접]
import { useState } from 'react'
import { MiniSheet } from './MiniSheet'
import { PickerField } from './PickerField'
import { DurationPicker } from './DurationPicker'
import { formatKoreanTime, nextHourStr } from '../utils/date'
import { addMinutes, durationBetween } from '../utils/time'

interface Props {
  /** 지금 골라 둔 시작 시간 (없으면 다음 정각부터 보여줘요) */
  time: string | null
  /** 길이(분) */
  duration: number
  /** [확인] = 시간 정하기, [시간 없음] = time null */
  onPick: (time: string | null, duration: number) => void
  onClose: () => void
}

export function TimeSheet({ time, duration, onPick, onClose }: Props) {
  const [start, setStart] = useState(() => time ?? nextHourStr())
  const [minutes, setMinutes] = useState(duration)
  return (
    <MiniSheet label="시간 고르기" onClose={onClose}>
      {(close) => (
        <div className="space-y-4">
          <p className="text-[15px] text-ink">시간</p>
          <PickerField
            type="time"
            label="시작 시간"
            value={start}
            onChange={(v) => v && setStart(v)}
            display={formatKoreanTime(start)}
          />
          <DurationPicker
            start={start}
            end={addMinutes(start, minutes)}
            onChange={(end) => setMinutes(durationBetween(start, end))}
          />
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onPick(null, minutes)
                close()
              }}
              className="h-12 rounded-xl px-5 text-[15px] text-muted active:bg-line"
            >
              시간 없음
            </button>
            <button
              type="button"
              onClick={() => {
                onPick(start, minutes)
                close()
              }}
              className="h-12 flex-1 rounded-xl bg-sage text-[15px] font-semibold text-card active:opacity-80"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </MiniSheet>
  )
}
