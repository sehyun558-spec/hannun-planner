// 반복 항목을 지우려 할 때 아래에서 올라오는 작은 선택 창: [이 날만 삭제] [반복 전체 삭제] [취소]
import { useEffect, useRef } from 'react'
import { useItems } from '../store/ItemsContext'
import { useDragToClose } from '../hooks/useDragToClose'
import { useBackClose } from '../hooks/useBackClose'
import { useScrollLock } from '../hooks/useScrollLock'
import { formatShortDate, fromDateStr, WEEKDAYS } from '../utils/date'

export function RepeatDeleteSheet() {
  const { pendingDelete } = useItems()
  if (!pendingDelete) return null
  // key: 다른 항목을 고르면 새 창으로 열리게
  return <Sheet key={`${pendingDelete.item.id}|${pendingDelete.day}`} />
}

function Sheet() {
  const { pendingDelete, resolvePendingDelete } = useItems()
  const sheetRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const chosen = useRef<'one' | 'all' | 'cancel'>('cancel')
  const { close } = useDragToClose(sheetRef, backdropRef, () => resolvePendingDelete(chosen.current))
  useBackClose(close)
  useScrollLock()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  if (!pendingDelete) return null
  const { item, day } = pendingDelete
  const dayLabel = `${formatShortDate(day)} (${WEEKDAYS[fromDateStr(day).getDay()]})`
  const pick = (c: 'one' | 'all') => {
    chosen.current = c
    close()
  }

  const btn =
    'flex h-12 w-full items-center justify-between rounded-xl border border-line bg-card px-4 text-left text-base text-ink transition-colors duration-200 active:bg-line'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="반복 항목 삭제">
      <button ref={backdropRef} type="button" aria-label="닫기" onClick={close} className="fadein absolute inset-0 touch-none bg-ink/25" />
      <div
        ref={sheetRef}
        className="sheetup relative w-full max-w-md space-y-4 rounded-t-2xl border-t border-line bg-paper px-5 will-change-transform"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <div className="-mx-5 flex h-7 cursor-grab touch-none items-center justify-center" aria-hidden>
          <div className="h-1 w-9 rounded-full bg-muted/40" />
        </div>
        <div className="-mt-2 space-y-1">
          <h2 className="text-[20px] font-light">반복 항목이에요</h2>
          <p className="text-[15px] text-muted">‘{item.title}’을(를) 어떻게 지울까요?</p>
        </div>
        <div className="space-y-2">
          <button type="button" onClick={() => pick('one')} className={btn}>
            <span>이 날만 삭제</span>
            <span className="text-[13px] text-muted">{dayLabel}</span>
          </button>
          <button type="button" onClick={() => pick('all')} className={btn}>
            <span>반복 전체 삭제</span>
            <span className="text-[13px] text-muted">모든 날짜에서</span>
          </button>
        </div>
        <button
          type="button"
          onClick={close}
          className="h-12 w-full rounded-xl text-[15px] text-muted transition-colors duration-200 active:bg-line"
        >
          취소
        </button>
      </div>
    </div>
  )
}
