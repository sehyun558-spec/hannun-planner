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
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-gray-900 py-2 pr-2 pl-5 text-white shadow-lg dark:bg-gray-100 dark:text-gray-900">
        <p className="min-w-0 flex-1 truncate text-base">
          ‘{lastDeleted.title}’ 삭제됨
        </p>
        <button
          type="button"
          onClick={undoDelete}
          className="h-11 shrink-0 rounded-xl px-4 text-base font-bold text-blue-300 active:bg-white/10 dark:text-blue-600 dark:active:bg-black/10"
        >
          되돌리기
        </button>
      </div>
    </div>
  )
}
