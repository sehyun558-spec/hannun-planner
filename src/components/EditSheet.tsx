// 항목을 눌렀을 때 아래에서 올라오는 수정 창
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Item } from '../types'
import { KindPicker } from './KindPicker'
import { StarIcon } from './Icons'

interface Props {
  item: Item
  /** 새로 만드는 중이면 true (제목 칸 자동 선택, 삭제 버튼 숨김) */
  isNew?: boolean
  onSave: (next: Item) => void
  onDelete?: () => void
  onClose: () => void
}

const field =
  'h-14 w-full rounded-2xl border-2 border-gray-200 bg-white px-4 text-lg outline-none focus:border-blue-600 dark:border-gray-700 dark:bg-gray-900'

export function EditSheet({ item, isNew, onSave, onDelete, onClose }: Props) {
  const [draft, setDraft] = useState<Item>(item)
  const set = (patch: Partial<Item>) => setDraft((d) => ({ ...d, ...patch }))

  // 뒤로가기 키(ESC)로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const title = draft.title.trim()
    if (!title && !draft.content.trim()) return
    onSave({
      ...draft,
      title: title || draft.content.trim().split('\n')[0].slice(0, 40),
      time: draft.kind === 'memo' ? null : draft.time || null,
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={isNew ? '새로 만들기' : '수정하기'}>
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <form
        onSubmit={submit}
        className="relative max-h-[92dvh] w-full max-w-md space-y-4 overflow-y-auto rounded-t-3xl bg-white px-4 pt-3 dark:bg-gray-900"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-700" aria-hidden />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{isNew ? '새로 만들기' : '수정하기'}</h2>
          <button
            type="button"
            onClick={() => set({ starred: !draft.starred })}
            aria-pressed={draft.starred}
            className={`flex h-11 items-center gap-1 rounded-full px-3 text-base font-semibold ${
              draft.starred
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <StarIcon className="h-5 w-5" filled={draft.starred} />
            중요
          </button>
        </div>

        <KindPicker value={draft.kind} onChange={(kind) => set({ kind })} />

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-500 dark:text-gray-400">제목</span>
          <input
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
            autoFocus={isNew}
            className={field}
          />
        </label>

        <div className="flex gap-2">
          <label className="block flex-1">
            <span className="mb-1 block text-sm font-semibold text-gray-500 dark:text-gray-400">날짜</span>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => e.target.value && set({ date: e.target.value })}
              className={field}
            />
          </label>
          {draft.kind !== 'memo' && (
            <label className="block w-40">
              <span className="mb-1 flex justify-between text-sm font-semibold text-gray-500 dark:text-gray-400">
                시간
                {draft.time && (
                  <button type="button" onClick={() => set({ time: null })} className="text-blue-600 dark:text-blue-400">
                    지우기
                  </button>
                )}
              </span>
              <input
                type="time"
                value={draft.time ?? ''}
                onChange={(e) => set({ time: e.target.value || null })}
                className={field}
              />
            </label>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-500 dark:text-gray-400">
            {draft.kind === 'memo' ? '내용' : '메모 (선택)'}
          </span>
          <textarea
            value={draft.content}
            onChange={(e) => set({ content: e.target.value })}
            rows={draft.kind === 'memo' ? 6 : 3}
            className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-lg outline-none focus:border-blue-600 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <div className="flex gap-2 pt-1">
          {onDelete && !isNew ? (
            <button
              type="button"
              onClick={onDelete}
              className="h-14 rounded-2xl px-5 text-lg font-semibold text-red-500 active:bg-red-50 dark:active:bg-red-950"
            >
              삭제
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="h-14 rounded-2xl px-5 text-lg font-semibold text-gray-500 active:bg-gray-100 dark:active:bg-gray-800"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            className="h-14 flex-1 rounded-2xl bg-blue-600 text-lg font-bold text-white active:bg-blue-700"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  )
}
