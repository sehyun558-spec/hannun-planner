// 앱 전체가 함께 쓰는 "항목 보관함"이에요.
// 어느 화면에서 추가·수정·삭제해도 모든 화면에 바로 반영되고, 자동으로 저장돼요.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Item } from '../types'
import { loadItems, saveItems } from './storage'
import { loadDeleted, saveDeleted } from './deleted'
import type { DeletedLog } from './deleted'
import { newId } from '../utils/items'

export type NewItem = Omit<
  Item,
  'id' | 'createdAt' | 'updatedAt' | 'done' | 'doneDates' | 'skipDates' | 'endDate'
> &
  Partial<Pick<Item, 'done' | 'doneDates' | 'skipDates' | 'endDate'>>

/** 되돌리기용으로 기억해 두는 "방금 한 일" */
type LastAction =
  | { kind: 'delete'; item: Item; index: number }
  | { kind: 'skip'; prev: Item; day: string }

/** 반복 항목을 지우려 할 때 "이 날만 / 전체" 를 고르는 중인 항목 */
export interface PendingDelete {
  item: Item
  day: string
}

interface ItemsApi {
  items: Item[]
  addItem: (data: NewItem) => Item
  updateItem: (id: string, patch: Partial<Item>) => void
  /** 바로 지우기 (반복 항목도 전체 삭제) */
  removeItem: (id: string) => void
  /** 지우기 요청: 반복 항목이면 "이 날만 / 반복 전체" 선택 창을 띄우고, 아니면 바로 지워요 */
  requestDelete: (item: Item, day: string) => void
  pendingDelete: PendingDelete | null
  resolvePendingDelete: (choice: 'one' | 'all' | 'cancel') => void
  toggleDone: (id: string, day: string) => void
  toggleStar: (id: string) => void
  /** 되돌리기 안내에 보여줄 글 (없으면 null) */
  undoInfo: { title: string; text: string } | null
  undoDelete: () => void
  dismissUndo: () => void
  /** 백업 불러오기: 지금 데이터와 합쳐요 (같은 항목은 더 최근 것을 남기고, 지운 뒤의 예전 내용은 다시 넣지 않아요) */
  mergeItems: (incoming: Item[]) => { added: number; updated: number; skippedDeleted: number }
  saveFailed: boolean
}

const ItemsContext = createContext<ItemsApi | null>(null)

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(loadItems)
  const [deletedLog, setDeletedLog] = useState<DeletedLog>(loadDeleted)
  const [last, setLast] = useState<LastAction | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const [saveFailed, setSaveFailed] = useState(false)
  const first = useRef(true)
  const firstLog = useRef(true)

  // 항목이 바뀔 때마다 자동 저장
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaveFailed(!saveItems(items))
  }, [items])

  // 지운 기록도 저장
  useEffect(() => {
    if (firstLog.current) {
      firstLog.current = false
      return
    }
    saveDeleted(deletedLog)
  }, [deletedLog])

  const addItem = useCallback((data: NewItem) => {
    const now = Date.now()
    const item: Item = {
      done: false,
      doneDates: [],
      skipDates: [],
      endDate: null,
      ...data,
      id: newId(),
      createdAt: now,
      updatedAt: now,
    }
    setItems((prev) => [...prev, item])
    return item
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<Item>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch, id, updatedAt: Date.now() } : it)),
    )
  }, [])

  const removeItem = useCallback(
    (id: string) => {
      const index = items.findIndex((it) => it.id === id)
      if (index < 0) return
      setLast({ kind: 'delete', item: items[index], index })
      setItems((prev) => prev.filter((it) => it.id !== id))
      setDeletedLog((log) => ({ ...log, [id]: Date.now() })) // 언제 지웠는지 기록
    },
    [items],
  )

  /** 반복 항목에서 그 날만 건너뛰기 */
  const skipOccurrence = useCallback(
    (id: string, day: string) => {
      const prev = items.find((it) => it.id === id)
      if (!prev) return
      setLast({ kind: 'skip', prev, day })
      setItems((list) =>
        list.map((it) =>
          it.id === id
            ? { ...it, skipDates: [...new Set([...it.skipDates, day])], updatedAt: Date.now() }
            : it,
        ),
      )
    },
    [items],
  )

  const requestDelete = useCallback(
    (item: Item, day: string) => {
      if (item.repeat !== 'none') setPendingDelete({ item, day })
      else removeItem(item.id)
    },
    [removeItem],
  )

  const resolvePendingDelete = useCallback(
    (choice: 'one' | 'all' | 'cancel') => {
      const p = pendingDelete
      setPendingDelete(null)
      if (!p || choice === 'cancel') return
      if (choice === 'one') skipOccurrence(p.item.id, p.day)
      else removeItem(p.item.id)
    },
    [pendingDelete, skipOccurrence, removeItem],
  )

  const toggleDone = useCallback((id: string, day: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        if (it.repeat === 'none') return { ...it, done: !it.done, updatedAt: Date.now() }
        const has = it.doneDates.includes(day)
        return {
          ...it,
          doneDates: has ? it.doneDates.filter((d) => d !== day) : [...it.doneDates, day],
          updatedAt: Date.now(),
        }
      }),
    )
  }, [])

  const toggleStar = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, starred: !it.starred, updatedAt: Date.now() } : it)),
    )
  }, [])

  const undoDelete = useCallback(() => {
    if (!last) return
    const a = last
    if (a.kind === 'delete') {
      setItems((prev) => {
        if (prev.some((it) => it.id === a.item.id)) return prev
        const next = [...prev]
        next.splice(Math.min(a.index, next.length), 0, a.item)
        return next
      })
      // 되살렸으니 지운 기록에서도 빼요
      setDeletedLog((log) => {
        const next = { ...log }
        delete next[a.item.id]
        return next
      })
    } else {
      setItems((prev) => prev.map((it) => (it.id === a.prev.id ? a.prev : it)))
    }
    setLast(null)
  }, [last])

  const dismissUndo = useCallback(() => setLast(null), [])

  const mergeItems = useCallback(
    (incoming: Item[]) => {
      const byId = new Map(items.map((it) => [it.id, it]))
      const log = { ...deletedLog }
      let added = 0
      let updated = 0
      let skippedDeleted = 0
      for (const it of incoming) {
        const cur = byId.get(it.id)
        if (!cur) {
          const deletedAt = log[it.id]
          // 지운 시각보다 예전 내용이면 다시 넣지 않아요
          if (deletedAt !== undefined && it.updatedAt <= deletedAt) {
            skippedDeleted++
            continue
          }
          if (deletedAt !== undefined) delete log[it.id] // 지운 뒤에 고친 더 새 내용이면 넣어요
          byId.set(it.id, it)
          added++
        } else if (it.updatedAt > cur.updatedAt) {
          byId.set(it.id, it)
          updated++
        }
      }
      if (added || updated) setItems([...byId.values()])
      setDeletedLog(log)
      setLast(null)
      return { added, updated, skippedDeleted }
    },
    [items, deletedLog],
  )

  // 새로 지울 때마다 새 안내(3초 다시 시작)가 되도록, "방금 한 일"이 바뀔 때만 새로 만들어요
  const undoInfo = useMemo(
    () =>
      !last
        ? null
        : last.kind === 'delete'
          ? { title: last.item.title, text: '삭제됨' }
          : { title: last.prev.title, text: '이 날만 삭제됨' },
    [last],
  )

  return (
    <ItemsContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        removeItem,
        requestDelete,
        pendingDelete,
        resolvePendingDelete,
        toggleDone,
        toggleStar,
        undoInfo,
        undoDelete,
        dismissUndo,
        mergeItems,
        saveFailed,
      }}
    >
      {children}
    </ItemsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useItems(): ItemsApi {
  const ctx = useContext(ItemsContext)
  if (!ctx) throw new Error('ItemsProvider 안에서만 쓸 수 있어요')
  return ctx
}
