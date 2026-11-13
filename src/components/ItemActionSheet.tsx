// 시간표 블록(또는 "시간 없음" 줄)을 누르면 올라오는 작은 창: [완료] [☆ 중요] [수정] [삭제]
// 완료·☆는 할 일 목록과 똑같은 기능이라 서로 연동돼요. 수정은 원래 수정 창, 삭제는 원래 삭제(반복이면 이 날만/전체 묻기 + 되돌리기)
import { useRef } from 'react'
import type { ReactNode } from 'react'
import type { Item } from '../types'
import { useItems } from '../store/ItemsContext'
import { isDoneOn } from '../utils/items'
import { itemTimeText } from '../utils/time'
import { haptic } from '../utils/haptic'
import { MiniSheet } from './MiniSheet'
import { CheckIcon, CloseIcon, MemoIcon, StarIcon } from './Icons'

interface Props {
  item: Item
  day: string
  onEdit: (item: Item) => void
  onClose: () => void
}

export function ItemActionSheet({ item, day, onEdit, onClose }: Props) {
  const { items, toggleDone, toggleStar, requestDelete } = useItems()
  // 창이 열려 있는 동안 바뀐 내용(완료·별)도 바로 보이게 최신 항목으로
  const cur = items.find((it) => it.id === item.id) ?? item
  const done = isDoneOn(cur, day)
  // 수정·삭제는 이 창이 다 내려간 뒤에 (창이 두 개 겹치지 않게)
  const after = useRef<'edit' | 'delete' | null>(null)

  const row = (icon: ReactNode, text: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center gap-3 rounded-xl px-2 text-left text-[15px] text-ink transition-colors duration-200 active:bg-line"
    >
      <span className="flex h-5 w-5 items-center justify-center text-muted">{icon}</span>
      {text}
    </button>
  )

  return (
    <MiniSheet
      label={`${cur.title} 고르기`}
      onClose={() => {
        if (after.current === 'edit') onEdit(cur)
        if (after.current === 'delete') requestDelete(cur, day)
        onClose()
      }}
    >
      {(close) => (
        <div>
          <div className="px-2 pb-2">
            <p className={`truncate text-[15px] ${done ? 'text-muted line-through' : 'text-ink'}`}>{cur.title}</p>
            {cur.time && <p className="text-[12px] text-muted">{itemTimeText(cur)}</p>}
          </div>
          {row(<CheckIcon className="h-5 w-5" />, done ? '완료 취소' : '완료하기', () => {
            if (!done) haptic()
            toggleDone(cur.id, day)
            close()
          })}
          {row(<StarIcon className="h-5 w-5" filled={cur.starred} />, cur.starred ? '중요 해제' : '중요 표시', () => {
            toggleStar(cur.id)
            close()
          })}
          {row(<MemoIcon className="h-5 w-5" />, '수정', () => {
            after.current = 'edit'
            close()
          })}
          {row(<CloseIcon className="h-5 w-5" />, '삭제', () => {
            after.current = 'delete'
            close()
          })}
        </div>
      )}
    </MiniSheet>
  )
}
