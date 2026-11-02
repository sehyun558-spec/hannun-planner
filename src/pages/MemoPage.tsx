// 메모 화면: 검색 + 메모 카드 목록 + 오른쪽 아래 [+] 버튼
import { useMemo, useState } from 'react'
import type { Item } from '../types'
import { useItems } from '../store/ItemsContext'
import { matchesQuery } from '../utils/items'
import { SearchBox } from '../components/SearchBox'
import { MemoCard } from '../components/MemoCard'
import { EditSheet } from '../components/EditSheet'
import { PlusIcon } from '../components/Icons'

export function MemoPage({ today }: { today: string }) {
  const { items, addItem, updateItem, removeItem, toggleStar } = useItems()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<{ item: Item; isNew: boolean } | null>(null)

  const allMemos = useMemo(() => items.filter((it) => it.kind === 'memo'), [items])

  // 별표 먼저, 그다음 최근에 고친 순서
  const memos = useMemo(
    () =>
      allMemos
        .filter((it) => matchesQuery(it, query))
        .sort((a, b) => (a.starred === b.starred ? b.updatedAt - a.updatedAt : a.starred ? -1 : 1)),
    [allMemos, query],
  )

  const startNew = () =>
    setEditing({
      isNew: true,
      item: {
        id: '',
        kind: 'memo',
        title: '',
        content: '',
        date: today,
        time: null,
        done: false,
        doneDates: [],
        starred: false,
        repeat: 'none',
        createdAt: 0,
        updatedAt: 0,
      },
    })

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <h1 className="text-3xl font-bold">메모</h1>
      </header>

      {allMemos.length > 0 && <SearchBox value={query} onChange={setQuery} placeholder="메모 검색" />}

      {memos.length === 0 ? (
        <p className="py-12 text-center text-lg whitespace-pre-line text-gray-400 dark:text-gray-500">
          {query ? `‘${query}’에 맞는 메모가 없어요` : '메모가 없어요.\n오른쪽 아래 + 버튼으로 써 보세요 ✍️'}
        </p>
      ) : (
        <ul className="space-y-2 pb-20">
          {memos.map((m) => (
            <li key={m.id}>
              <MemoCard
                item={m}
                onOpen={() => setEditing({ item: m, isNew: false })}
                onStar={() => toggleStar(m.id)}
                onDelete={() => removeItem(m.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* 새 메모 버튼: 엄지가 닿기 쉬운 오른쪽 아래 */}
      <button
        type="button"
        onClick={startNew}
        aria-label="새 메모"
        className="fixed right-4 z-10 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg active:bg-blue-700"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)' }}
      >
        <PlusIcon className="h-8 w-8" />
      </button>

      {editing && (
        <EditSheet
          item={editing.item}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={(next) => {
            if (editing.isNew) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, createdAt, updatedAt, ...data } = next
              addItem(data)
            } else {
              updateItem(next.id, next)
            }
            setEditing(null)
          }}
          onDelete={() => {
            removeItem(editing.item.id)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
