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
  const { items, addItem, updateItem, requestDelete, toggleStar } = useItems()
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
        skipDates: [],
        endDate: null,
        createdAt: 0,
        updatedAt: 0,
      },
    })

  return (
    <div className="space-y-6">
      <header className="pt-4">
        <h1 className="text-[28px] font-light tracking-tight">메모</h1>
      </header>

      {allMemos.length > 0 && <SearchBox value={query} onChange={setQuery} placeholder="메모 검색" />}

      {memos.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-base text-ink/80">
            {query ? `‘${query}’에 맞는 메모가 없어요` : '아직 적어둔 메모가 없어요'}
          </p>
          {!query && <p className="mt-1 text-[13px] text-muted">오른쪽 아래 + 를 눌러 가볍게 적어 보세요</p>}
        </div>
      ) : (
        <ul className="space-y-3 pb-24">
          {memos.map((m) => (
            <li key={m.id}>
              <MemoCard
                item={m}
                onOpen={() => setEditing({ item: m, isNew: false })}
                onStar={() => toggleStar(m.id)}
                onDelete={() => requestDelete(m, m.date)}
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
        className="fixed z-10 flex h-14 w-14 items-center justify-center rounded-xl bg-sage text-card transition-opacity duration-200 active:opacity-80"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)',
          right: 'max(1.25rem, calc((100vw - 28rem) / 2 + 1.25rem))',
        }}
      >
        <PlusIcon className="h-7 w-7" />
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
            requestDelete(editing.item, editing.item.date)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
