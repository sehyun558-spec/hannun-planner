// 어떤 날짜의 일정·할 일·메모를 한 목록으로 보여줘요. (오늘 화면, 달력 화면에서 같이 써요)
import { useMemo, useState } from 'react'
import type { Item } from '../types'
import { useItems } from '../store/ItemsContext'
import { occursOn, sortItems } from '../utils/items'
import { ItemRow } from './ItemRow'
import { EditSheet } from './EditSheet'

interface Props {
  day: string
  /** 비어 있을 때 보여줄 다정한 문구 (두 줄까지) */
  emptyText: string
  emptySub?: string
  /** 목록에서 빼고 보여줄 항목 (오늘의 한 가지) */
  excludeId?: string
}

export function DayList({ day, emptyText, emptySub, excludeId }: Props) {
  const { items, updateItem, removeItem, toggleDone, toggleStar } = useItems()
  const [editing, setEditing] = useState<Item | null>(null)

  const list = useMemo(
    () => sortItems(items.filter((it) => it.id !== excludeId && occursOn(it, day))),
    [items, day, excludeId],
  )

  return (
    <>
      {list.length === 0 ? (
        emptyText ? (
          <div className="py-14 text-center">
            <p className="text-base text-ink/80">{emptyText}</p>
            {emptySub && <p className="mt-1 text-[13px] text-muted">{emptySub}</p>}
          </div>
        ) : null
      ) : (
        <ul className="divide-y divide-line">
          {list.map((item) => (
            <li key={item.id}>
              <ItemRow
                item={item}
                day={day}
                onToggle={() => toggleDone(item.id, day)}
                onStar={() => toggleStar(item.id)}
                onEdit={() => setEditing(item)}
                onDelete={() => removeItem(item.id)}
              />
            </li>
          ))}
        </ul>
      )}

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
    </>
  )
}
