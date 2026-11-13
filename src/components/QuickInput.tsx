// 빠른 입력창: 종류를 고르고, 글자를 쓰고, 엔터 → 끝!
// - 입력칸 안 오른쪽 🕐 를 누르면 작은 창에서 시작 시간·길이를 골라요 (할 일·일정만)
// - 시간을 고르면 입력칸 아래에 "오전 4:00 – 5:00" 작은 회색 한 줄. 추가하면 다시 비워져요
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { ItemKind } from '../types'
import { useItems } from '../store/ItemsContext'
import { KindPicker } from './KindPicker'
import { ClockIcon, PlusIcon } from './Icons'
import { TimeSheet } from './TimeSheet'
import { addMinutes, DEFAULT_DURATION, formatTimeRange } from '../utils/time'

const PLACEHOLDER: Record<ItemKind, string> = {
  todo: '할 일 입력 후 엔터',
  event: '일정 입력 후 엔터',
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
  const [time, setTime] = useState<string | null>(null) // 🕐 로 고른 시작 시간 (없으면 시간 없음)
  const [duration, setDuration] = useState(DEFAULT_DURATION) // 길이(분), 기본 1시간
  const [picking, setPicking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const canTime = kind !== 'memo' // 메모는 시간이 없어요
  const pickedTime = canTime ? time : null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const title = text.trim()
    if (!title) return
    addItem({
      kind,
      title,
      content: '',
      date,
      time: pickedTime,
      endTime: pickedTime ? addMinutes(pickedTime, duration) : null,
      starred: false,
      repeat: 'none',
    })
    setText('')
    // 추가하면 시간 선택은 처음으로
    setTime(null)
    setDuration(DEFAULT_DURATION)
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={PLACEHOLDER[kind]}
              aria-label={PLACEHOLDER[kind]}
              autoFocus={autoFocus}
              enterKeyHint="enter"
              className={`${field} w-full px-4 ${canTime ? 'pr-12' : ''}`}
            />
            {canTime && (
              <button
                type="button"
                onClick={() => setPicking(true)}
                aria-label={pickedTime ? `시간 바꾸기 (${formatTimeRange(pickedTime, addMinutes(pickedTime, duration))})` : '시간 정하기'}
                className={`absolute top-0 right-0 flex h-12 w-12 items-center justify-center transition-colors duration-200 ${
                  pickedTime ? 'text-sage' : 'text-muted'
                }`}
              >
                <ClockIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            aria-label="추가"
            disabled={!text.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage text-card transition-opacity duration-200 active:opacity-80 disabled:opacity-30"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>
        {/* 고른 시간: 작은 회색 한 줄 (누르면 다시 고르기) */}
        {pickedTime && (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="fadein mt-1 px-4 py-1 text-[12px] text-muted"
          >
            {formatTimeRange(pickedTime, addMinutes(pickedTime, duration))}
          </button>
        )}
      </div>
      <KindPicker
        value={kind}
        onChange={(k) => {
          setKind(k)
          // 오늘 화면에서 [일정]은 시간표 보기도 바뀌어서, 키보드가 시간표를 가리지 않게 입력칸을 바로 선택하지 않아요
          if (!(onKindChange && k === 'event')) inputRef.current?.focus()
        }}
      />

      {picking && (
        <TimeSheet
          time={pickedTime}
          duration={duration}
          onPick={(t, d) => {
            setTime(t)
            setDuration(d)
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </form>
  )
}
