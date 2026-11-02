// 어떤 날짜의 일정·할 일·메모를 한 목록으로 보여줘요. (오늘 화면, 달력 화면에서 같이 써요)
import { useMemo, useState } from 'react'
import type { Item } from '../types'
import { useItems } from '../store/ItemsContext'
import { occursOn, sortItems } from '../utils/items'
import { ItemRow } from './ItemRow'
import { EditSheet } from './EditSheet'

export function DayList({ day, emptyText }: { day: string; emptyText: string }) {
  const { items, updateItem, removeItem, toggleDone, toggleStar } = useItems()
  const [editing, setEditing] = useState<Item | null>(null)

  const list = useMemo(() => sortItems(items.filter((it) => occursOn(it, day))), [items, day])

  return (
    <>
      {list.length === 0 ? (
        <p className="py-12 text-center text-lg text-gray-400 dark:text-gray-500">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
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
