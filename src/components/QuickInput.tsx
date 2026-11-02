// 빠른 입력창: 종류를 고르고, 글자를 쓰고, 엔터 → 끝!
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { ItemKind } from '../types'
import { useItems } from '../store/ItemsContext'
import { nextHourStr } from '../utils/date'
import { KindPicker } from './KindPicker'
import { PlusIcon } from './Icons'

const PLACEHOLDER: Record<ItemKind, string> = {
  todo: '할 일 입력 후 엔터',
  event: '일정 입력',
  memo: '메모 입력 후 엔터',
}

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
    <form onSubmit={submit} className="space-y-2">
      <KindPicker
        value={kind}
        onChange={(k) => {
          setKind(k)
          inputRef.current?.focus()
        }}
      />
      <div className="flex gap-2">
        {kind === 'event' && (
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="일정 시간"
            className="h-14 w-32 shrink-0 rounded-2xl border-2 border-gray-200 bg-white px-2 text-base outline-none focus:border-blue-600 dark:border-gray-700 dark:bg-gray-900"
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
          className="h-14 min-w-0 flex-1 rounded-2xl border-2 border-gray-200 bg-white px-4 text-lg outline-none placeholder:text-gray-400 focus:border-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-500"
        />
        <button
          type="submit"
          aria-label="추가"
          disabled={!text.trim()}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white active:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600"
        >
          <PlusIcon className="h-7 w-7" />
        </button>
      </div>
    </form>
  )
}
