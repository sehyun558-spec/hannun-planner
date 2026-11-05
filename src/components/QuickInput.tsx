// 빠른 입력창: 종류를 고르고, 글자를 쓰고, 엔터 → 끝!
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { ItemKind } from '../types'
import { useItems } from '../store/ItemsContext'
import { formatKoreanTime, nextHourStr } from '../utils/date'
import { KindPicker } from './KindPicker'
import { PlusIcon } from './Icons'
import { PickerField } from './PickerField'

const PLACEHOLDER: Record<ItemKind, string> = {
  todo: '할 일 입력 후 엔터',
  event: '일정 입력',
  memo: '메모 입력 후 엔터',
}

const field =
  'h-12 rounded-xl border border-line bg-card text-base text-ink outline-none transition-colors duration-200 focus:border-muted'

export function QuickInput({ date, autoFocus }: { date: string; autoFocus?: boolean }) {
  const { addItem } = useItems()
  const [kind, setKind] = useState<ItemKind>('todo')
  const [text, setText] = useState('')
  const [time, setTime] = useState(nextHourStr)
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
      <KindPicker
        value={kind}
        onChange={(k) => {
          // 일정을 고를 때마다 "지금 기준 다음 정각"으로 (앱을 오래 켜 둬도 지난 시간이 안 나오게)
          if (k === 'event' && kind !== 'event') setTime(nextHourStr())
          setKind(k)
          inputRef.current?.focus()
        }}
      />
    </form>
  )
}
