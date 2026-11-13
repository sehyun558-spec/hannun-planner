// 빠른 입력창: 종류를 고르고, 글자를 쓰고, 엔터 → 끝!
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { ItemKind } from '../types'
import { useItems } from '../store/ItemsContext'
import { formatKoreanTime, nextHourStr } from '../utils/date'
import { KindPicker } from './KindPicker'
import { PlusIcon } from './Icons'
import { PickerField } from './PickerField'
import { DurationPicker } from './DurationPicker'
import { addMinutes, DEFAULT_DURATION, durationBetween } from '../utils/time'

const PLACEHOLDER: Record<ItemKind, string> = {
  todo: '할 일 입력 후 엔터',
  event: '일정 입력',
  memo: '메모 입력 후 엔터',
}

const field =
  'h-12 rounded-xl border border-line bg-card text-base text-ink outline-none transition-colors duration-200 focus:border-muted'

interface Props {
  date: string
  autoFocus?: boolean
  /** 종류를 바깥(오늘 화면)에서 같이 알고 싶을 때: 지금 고른 종류 + 바뀔 때 알려 주기 */
  kind?: ItemKind
  onKindChange?: (k: ItemKind) => void
}

export function QuickInput({ date, autoFocus, kind: outerKind, onKindChange }: Props) {
  const { addItem } = useItems()
  const [innerKind, setInnerKind] = useState<ItemKind>('todo')
  const kind = outerKind ?? innerKind
  const setKind = (k: ItemKind) => {
    setInnerKind(k)
    onKindChange?.(k)
  }
  const [text, setText] = useState('')
  const [time, setTime] = useState(nextHourStr)
  const [duration, setDuration] = useState(DEFAULT_DURATION) // 일정 길이(분), 기본 1시간
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const title = text.trim()
    if (!title) return
    addItem({
      kind,
      title,
      content: '',
      date,
      time: kind === 'event' && time ? time : null,
      endTime: kind === 'event' && time ? addMinutes(time, duration) : null,
      starred: false,
      repeat: 'none',
    })
    setText('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        {kind === 'event' && (
          <PickerField
            type="time"
            label="일정 시간"
            value={time}
            onChange={setTime}
            display={time ? formatKoreanTime(time) : '시간'}
            className="w-32 shrink-0"
          />
        )}
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER[kind]}
          aria-label={PLACEHOLDER[kind]}
          autoFocus={autoFocus}
          enterKeyHint="enter"
          className={`${field} min-w-0 flex-1 px-4`}
        />
        <button
          type="submit"
          aria-label="추가"
          disabled={!text.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage text-card transition-opacity duration-200 active:opacity-80 disabled:opacity-30"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
      {/* 일정 길이: 시작 시간 아래 [30분] [1시간] [2시간] [직접] */}
      {kind === 'event' && time && (
        <DurationPicker
          start={time}
          end={addMinutes(time, duration)}
          onChange={(end) => setDuration(durationBetween(time, end))}
        />
      )}
      <KindPicker
        value={kind}
        onChange={(k) => {
          // 일정을 고를 때마다 "지금 기준 다음 정각"으로 (앱을 오래 켜 둬도 지난 시간이 안 나오게)
          if (k === 'event' && kind !== 'event') {
            setTime(nextHourStr())
            setDuration(DEFAULT_DURATION)
          }
          setKind(k)
          // 오늘 화면에서 [일정]은 시간표 보기도 바뀌어서, 키보드가 시간표를 가리지 않게 입력칸을 바로 선택하지 않아요
          if (!(onKindChange && k === 'event')) inputRef.current?.focus()
        }}
      />
    </form>
  )
}
