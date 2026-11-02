// 삭제하면 3초 동안 아래에 나타나는 "되돌리기" 안내
import { useEffect } from 'react'
import { useItems } from '../store/ItemsContext'

const UNDO_MS = 3000

export function UndoToast() {
  const { lastDeleted, undoDelete, dismissUndo } = useItems()

  useEffect(() => {
    if (!lastDeleted) return
    const t = setTimeout(dismissUndo, UNDO_MS)
    return () => clearTimeout(t)
  }, [lastDeleted, dismissUndo])

  if (!lastDeleted) return null

  return (
    <div
      className="fixed inset-x-0 z-30 flex justify-center px-4"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}
      role="status"
    >
      <div className="fadein flex w-full max-w-md items-center gap-3 rounded-2xl bg-ink py-1.5 pr-1.5 pl-5 text-card">
        <p className="min-w-0 flex-1 truncate text-[15px]">‘{lastDeleted.title}’ 삭제됨</p>
        <button
          type="button"
          onClick={undoDelete}
          className="h-11 shrink-0 rounded-xl px-4 text-[15px] font-semibold text-card underline underline-offset-4 active:bg-card/10"
        >
          되돌리기
        </button>
      </div>
    </div>
  )
}
