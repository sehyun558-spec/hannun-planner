// 항목을 눌렀을 때 아래에서 올라오는 수정 창
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Item, Repeat } from '../types'
import { KindPicker } from './KindPicker'
import { StarIcon } from './Icons'
import { fromDateStr, formatKoreanTime, formatShortDate, WEEKDAYS } from '../utils/date'
import { useDragToClose } from '../hooks/useDragToClose'
import { PickerField } from './PickerField'

/** '매주 월요일마다', '매달 2일에', '11월 2일부터 매일' */
function repeatHint(repeat: Repeat, date: string): string {
  const d = fromDateStr(date)
  if (repeat === 'weekly') return `매주 ${WEEKDAYS[d.getDay()]}요일마다`
  if (repeat === 'monthly') return `매달 ${d.getDate()}일에`
  return `${formatShortDate(date)}부터 매일`
}

interface Props {
  item: Item
  /** 새로 만드는 중이면 true (제목 칸 자동 선택, 삭제 버튼 숨김) */
  isNew?: boolean
  onSave: (next: Item) => void
  onDelete?: () => void
  onClose: () => void
}

/** '11월 2일 (월)' (올해가 아니면 '2027년 1월 1일 (금)') */
function dateLabel(date: string): string {
  return `${formatShortDate(date)} (${WEEKDAYS[fromDateStr(date).getDay()]})`
}

const REPEATS: { value: Repeat; label: string }[] = [
  { value: 'none', label: '안 함' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
]

const field =
  'h-12 w-full min-w-0 rounded-xl border border-line bg-card px-4 text-base outline-none transition-colors duration-200 focus:border-muted'

export function EditSheet({ item, isNew, onSave, onDelete, onClose }: Props) {
  const [draft, setDraft] = useState<Item>(item)
  const set = (patch: Partial<Item>) => setDraft((d) => ({ ...d, ...patch }))

  // 손가락으로 아래로 끌어내리면 닫혀요
  const sheetRef = useRef<HTMLFormElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const { close } = useDragToClose(sheetRef, backdropRef, onClose)

  // 뒤로가기 키(ESC)로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const title = draft.title.trim()
    if (!title && !draft.content.trim()) return
    onSave({
      ...draft,
      title: title || draft.content.trim().split('\n')[0].slice(0, 40),
      time: draft.kind === 'memo' ? null : draft.time || null,
      repeat: draft.kind === 'memo' ? 'none' : draft.repeat,
    })
  }

  const label = 'mb-1.5 block text-[13px] text-muted'
  const seg = (active: boolean) =>
    `h-11 flex-1 rounded-xl text-[15px] transition-colors duration-200 ${
      active ? 'border border-line bg-card font-semibold text-ink' : 'border border-transparent text-muted'
    }`

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? '새로 만들기' : '수정하기'}
    >
      <button
        ref={backdropRef}
        type="button"
        aria-label="닫기"
        onClick={close}
        className="fadein absolute inset-0 bg-ink/25"
      />
      <form
        ref={sheetRef}
        onSubmit={submit}
        className="sheetup relative max-h-[92dvh] w-full max-w-md space-y-5 overflow-y-auto overscroll-contain rounded-t-2xl border-t border-line bg-paper px-5 will-change-transform"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        {/* 손잡이: 여기를 잡고 아래로 내리면 닫혀요 */}
        <div className="-mx-5 flex h-7 cursor-grab touch-none items-center justify-center" aria-hidden>
          <div className="h-1 w-9 rounded-full bg-muted/40" />
        </div>

        <div className="-mt-3 flex items-center justify-between">
          <h2 className="text-[22px] font-light">{isNew ? '새로 만들기' : '수정하기'}</h2>
          <button
            type="button"
            onClick={() => set({ starred: !draft.starred })}
            aria-pressed={draft.starred}
            className={`flex h-11 items-center gap-1.5 rounded-xl px-3 text-[15px] transition-colors duration-200 ${
              draft.starred ? 'font-semibold text-ink' : 'text-muted'
            }`}
          >
            <StarIcon className="h-5 w-5" filled={draft.starred} />
            중요
          </button>
        </div>

        <KindPicker value={draft.kind} onChange={(kind) => set({ kind })} />

        <label className="block">
          <span className={label}>제목</span>
          <input
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
            autoFocus={isNew}
            className={field}
          />
        </label>

        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <span className={label}>날짜</span>
            <PickerField
              type="date"
              label="날짜"
              value={draft.date}
              onChange={(v) => v && set({ date: v })}
              display={dateLabel(draft.date)}
            />
          </div>
          {draft.kind !== 'memo' && (
            <div className="w-[42%] shrink-0">
              <span className={`${label} flex justify-between`}>
                시간
                {draft.time && (
                  <button
                    type="button"
                    onClick={() => set({ time: null })}
                    className="-my-3 -mr-1 px-1 py-3 text-ink underline underline-offset-2"
                  >
                    지우기
                  </button>
                )}
              </span>
              <PickerField
                type="time"
                label="시간"
                value={draft.time ?? ''}
                onChange={(v) => set({ time: v || null })}
                display={draft.time ? formatKoreanTime(draft.time) : '시간 없음'}
              />
            </div>
          )}
        </div>

        {draft.kind !== 'memo' && (
          <div>
            <span className={label}>반복</span>
            <div className="flex gap-1" role="radiogroup" aria-label="반복">
              {REPEATS.map(({ value, label: text }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={draft.repeat === value}
                  onClick={() => set({ repeat: value })}
                  className={seg(draft.repeat === value)}
                >
                  {text}
                </button>
              ))}
            </div>
            {draft.repeat !== 'none' && (
              <p className="mt-2 px-1 text-[13px] text-muted">
                {repeatHint(draft.repeat, draft.date)} 나타나요. 삭제하면 모든 날짜에서 지워져요.
              </p>
            )}
          </div>
        )}

        <label className="block">
          <span className={label}>{draft.kind === 'memo' ? '내용' : '메모 (선택)'}</span>
          <textarea
            value={draft.content}
            onChange={(e) => set({ content: e.target.value })}
            rows={draft.kind === 'memo' ? 6 : 3}
            className="w-full rounded-xl border border-line bg-card px-4 py-3 text-base leading-relaxed outline-none transition-colors duration-200 focus:border-muted"
          />
        </label>

        <div className="flex gap-2 pt-1">
          {onDelete && !isNew ? (
            <button
              type="button"
              onClick={onDelete}
              className="h-12 rounded-xl border border-line px-5 text-[15px] text-ink active:bg-line"
            >
              삭제
            </button>
          ) : (
            <button
              type="button"
              onClick={close}
              className="h-12 rounded-xl border border-line px-5 text-[15px] text-muted active:bg-line"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            className="h-12 flex-1 rounded-xl bg-sage text-base font-semibold text-card active:opacity-80"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  )
}
