// 어떤 날짜의 일정·할 일·메모를 한 목록으로 보여줘요. (오늘 화면, 달력 화면에서 같이 써요)
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Item } from '../types'
import { useItems } from '../store/ItemsContext'
import { isDoneOn, occursOn, sortItems } from '../utils/items'
import { ItemRow } from './ItemRow'
import { EditSheet } from './EditSheet'

/** 체크한 뒤 아래로 내려가기 전까지 기다리는 시간 (체크·줄 긋기 애니메이션이 끝날 때까지) */
const SETTLE_MS = 650

interface Props {
  day: string
  /** 비어 있을 때 보여줄 다정한 문구 (두 줄까지) */
  emptyText: string
  emptySub?: string
  /** 목록에서 빼고 보여줄 항목 (오늘의 한 가지) */
  excludeId?: string
}

export function DayList({ day, emptyText, emptySub, excludeId }: Props) {
  const { items, updateItem, requestDelete, toggleDone, toggleStar } = useItems()
  const [editing, setEditing] = useState<Item | null>(null)

  // 방금 체크한 항목은 줄 긋는 모습을 보여 주는 동안(0.65초) 제자리에 둬요. id → 체크하기 전 상태
  const [settling, setSettling] = useState<Map<string, boolean>>(() => new Map())
  const timers = useRef(new Map<string, number>())
  useEffect(() => {
    const t = timers.current
    return () => t.forEach((id) => clearTimeout(id))
  }, [])

  const toggle = (item: Item) => {
    const before = settling.has(item.id) ? settling.get(item.id)! : isDoneOn(item, day)
    setSettling((m) => new Map(m).set(item.id, before))
    clearTimeout(timers.current.get(item.id))
    timers.current.set(
      item.id,
      window.setTimeout(() => {
        timers.current.delete(item.id)
        setSettling((m) => {
          const next = new Map(m)
          next.delete(item.id)
          return next
        })
      }, SETTLE_MS),
    )
    toggleDone(item.id, day)
  }

  // 정렬: 아직 안 끝낸 것(별표 → 시간순) 위, 끝낸 것은 아래로 (끝낸 것끼리도 같은 순서)
  const list = useMemo(() => {
    const sorted = sortItems(items.filter((it) => it.id !== excludeId && occursOn(it, day)))
    const doneNow = (it: Item) =>
      it.kind !== 'memo' && (settling.has(it.id) ? settling.get(it.id)! : isDoneOn(it, day))
    return [...sorted.filter((it) => !doneNow(it)), ...sorted.filter(doneNow)]
  }, [items, day, excludeId, settling])

  // 순서가 바뀐 줄은 새 자리로 부드럽게 미끄러져 가요 (예전 자리에서 새 자리까지 0.3초)
  const ulRef = useRef<HTMLUListElement>(null)
  const prevTops = useRef(new Map<string, number>())
  useLayoutEffect(() => {
    const ul = ulRef.current
    if (!ul) {
      prevTops.current = new Map()
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const base = ul.getBoundingClientRect().top
    const next = new Map<string, number>()
    for (const li of Array.from(ul.children) as HTMLElement[]) {
      const id = li.dataset.id
      if (!id) continue
      const top = li.getBoundingClientRect().top - base
      next.set(id, top)
      const old = prevTops.current.get(id)
      if (!reduce && old !== undefined && Math.abs(old - top) > 1 && li.animate) {
        li.animate([{ transform: `translateY(${old - top}px)` }, { transform: 'none' }], {
          duration: 300,
          easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
        })
      }
    }
    prevTops.current = next
  }, [list])

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
        <ul ref={ulRef} className="divide-y divide-line">
          {list.map((item) => (
            <li key={item.id} data-id={item.id}>
              <ItemRow
                item={item}
                day={day}
                onToggle={() => toggle(item)}
                onStar={() => toggleStar(item.id)}
                onEdit={() => setEditing(item)}
                onDelete={() => requestDelete(item, day)}
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
            requestDelete(editing, day)
            setEditing(null)
          }}
        />
      )}
    </>
  )
}
