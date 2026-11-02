// 앱 전체가 함께 쓰는 "항목 보관함"이에요.
// 어느 화면에서 추가·수정·삭제해도 모든 화면에 바로 반영되고, 자동으로 저장돼요.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Item } from '../types'
import { loadItems, saveItems } from './storage'
import { newId } from '../utils/items'

export type NewItem = Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'done' | 'doneDates'> &
  Partial<Pick<Item, 'done' | 'doneDates'>>

interface Deleted {
  item: Item
  index: number
}

interface ItemsApi {
  items: Item[]
  addItem: (data: NewItem) => Item
  updateItem: (id: string, patch: Partial<Item>) => void
  removeItem: (id: string) => void
  toggleDone: (id: string, day: string) => void
  toggleStar: (id: string) => void
  /** 방금 지운 항목 (3초 되돌리기용) */
  lastDeleted: Item | null
  undoDelete: () => void
  dismissUndo: () => void
  /** 백업 불러오기: 지금 데이터와 합쳐요 (같은 항목은 더 최근 것을 남김) */
  mergeItems: (incoming: Item[]) => { added: number; updated: number }
  saveFailed: boolean
}

const ItemsContext = createContext<ItemsApi | null>(null)

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(loadItems)
  const [deleted, setDeleted] = useState<Deleted | null>(null)
  const [saveFailed, setSaveFailed] = useState(false)
  const first = useRef(true)

  // 항목이 바뀔 때마다 자동 저장
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaveFailed(!saveItems(items))
  }, [items])

  const addItem = useCallback((data: NewItem) => {
    const now = Date.now()
    const item: Item = { done: false, doneDates: [], ...data, id: newId(), createdAt: now, updatedAt: now }
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
      setDeleted({ item: items[index], index })
      setItems((prev) => prev.filter((it) => it.id !== id))
    },
    [items],
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
    if (!deleted) return
    const d = deleted
    setItems((prev) => {
      if (prev.some((it) => it.id === d.item.id)) return prev
      const next = [...prev]
      next.splice(Math.min(d.index, next.length), 0, d.item)
      return next
    })
    setDeleted(null)
  }, [deleted])

  const dismissUndo = useCallback(() => setDeleted(null), [])

  const mergeItems = useCallback(
    (incoming: Item[]) => {
      const byId = new Map(items.map((it) => [it.id, it]))
      let added = 0
      let updated = 0
      for (const it of incoming) {
        const cur = byId.get(it.id)
        if (!cur) {
          byId.set(it.id, it)
          added++
        } else if (it.updatedAt > cur.updatedAt) {
          byId.set(it.id, it)
          updated++
        }
      }
      if (added || updated) setItems([...byId.values()])
      setDeleted(null)
      return { added, updated }
    },
    [items],
  )

  return (
    <ItemsContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        removeItem,
        toggleDone,
        toggleStar,
        lastDeleted: deleted?.item ?? null,
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
