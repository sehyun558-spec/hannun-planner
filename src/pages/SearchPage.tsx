// 통합 검색: 일정·할 일·메모를 한 번에 찾아요. (오늘 화면 오른쪽 위 🔍)
import { useEffect, useMemo, useState } from 'react'
import type { Item } from '../types'
import { useItems } from '../store/ItemsContext'
import { matchesQuery } from '../utils/items'
import { SearchBox } from '../components/SearchBox'
import { ItemRow } from '../components/ItemRow'
import { EditSheet } from '../components/EditSheet'
import { BackIcon } from '../components/Icons'

export function SearchPage({ onClose }: { onClose: () => void }) {
  const { items, updateItem, removeItem, toggleDone, toggleStar } = useItems()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Item | null>(null)

  // 최근 날짜 먼저, 같은 날이면 시간순
  const results = useMemo(() => {
    if (!query.trim()) return []
    return items
      .filter((it) => matchesQuery(it, query))
      .sort((a, b) => b.date.localeCompare(a.date) || (a.time ?? '').localeCompare(b.time ?? ''))
  }, [items, query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !editing && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, editing])

  return (
    <div
      className="fixed inset-0 z-30 overflow-y-auto bg-white dark:bg-gray-950"
      role="dialog"
      aria-modal="true"
      aria-label="통합 검색"
    >
      <div
        className="mx-auto max-w-md space-y-3 px-4"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)',
        }}
      >
        <div className="flex items-center gap-1 pt-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="검색 닫기"
            className="-ml-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl active:bg-gray-100 dark:active:bg-gray-800"
          >
            <BackIcon className="h-7 w-7" />
          </button>
          <SearchBox value={query} onChange={setQuery} placeholder="일정·할 일·메모 검색" autoFocus />
        </div>

        {!query.trim() ? (
          <p className="py-12 text-center text-lg text-gray-400 dark:text-gray-500">
            제목이나 내용으로 찾아요 🔍
          </p>
        ) : results.length === 0 ? (
          <p className="py-12 text-center text-lg text-gray-400 dark:text-gray-500">
            ‘{query}’에 맞는 항목이 없어요
          </p>
        ) : (
          <>
            <p className="px-1 text-base text-gray-500 dark:text-gray-400">{results.length}개 찾았어요</p>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {results.map((item) => (
                <li key={item.id}>
                  <ItemRow
                    item={item}
                    day={item.date}
                    showDate
                    onToggle={() => toggleDone(item.id, item.date)}
                    onStar={() => toggleStar(item.id)}
                    onEdit={() => setEditing(item)}
                    onDelete={() => removeItem(item.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {editing && (
        <EditSheet
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(next) => {
            updateItem(next.id, next)
            setEditing(null)
          }}
          onDelete={() => {
            removeItem(editing.id)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
