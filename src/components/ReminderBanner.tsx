// 알림 시간이 되면 화면 위쪽에 나타나는 파란 안내
import { useEffect } from 'react'
import type { Item } from '../types'
import { formatKoreanTime } from '../utils/date'

export function ReminderBanner({ items, onClose }: { items: Item[]; onClose: () => void }) {
  // 15초 뒤 자동으로 닫혀요
  useEffect(() => {
    if (items.length === 0) return
    const t = setTimeout(onClose, 15_000)
    return () => clearTimeout(t)
  }, [items, onClose])

  if (items.length === 0) return null

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
      role="alert"
    >
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-blue-600 py-2 pr-2 pl-4 text-white shadow-lg">
        <span className="text-2xl" aria-hidden>
          ⏰
        </span>
        <div className="min-w-0 flex-1">
          {items.map((it) => (
            <p key={it.id} className="truncate text-lg font-semibold">
              <span className="font-normal opacity-90">{it.time && formatKoreanTime(it.time)}</span> {it.title}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-11 shrink-0 rounded-xl bg-white/20 px-4 text-base font-bold active:bg-white/30"
        >
          확인
        </button>
      </div>
    </div>
  )
}
