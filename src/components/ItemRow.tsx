// 목록의 한 줄: ○ 눌러 완료, ☆ 눌러 중요, 옆으로 밀어서 삭제, 눌러서 수정
import type { Item } from '../types'
import { isDoneOn } from '../utils/items'
import { formatKoreanTime, formatShortDate } from '../utils/date'
import { MemoIcon, StarIcon } from './Icons'
import { SwipeRow } from './SwipeRow'
import { CheckCircle } from './CheckCircle'

interface Props {
  item: Item
  /** 어느 날짜 목록에 보이는지 (반복 항목의 완료 판단용) */
  day: string
  /** 검색 결과처럼 여러 날짜가 섞일 때 날짜도 보여주기 */
  showDate?: boolean
  onToggle: () => void
  onStar: () => void
  onEdit: () => void
  onDelete: () => void
}

const REPEAT_LABEL = { none: '', daily: '매일', weekly: '매주', monthly: '매월' }

export function ItemRow({ item, day, showDate, onToggle, onStar, onEdit, onDelete }: Props) {
  const done = item.kind !== 'memo' && isDoneOn(item, day)
  const hasSub =
    showDate || item.time || item.kind !== 'todo' || item.repeat !== 'none' || item.content

  return (
    <SwipeRow
      label={`${item.title} 수정하기`}
      onTap={onEdit}
      onDelete={onDelete}
      collapse={item.repeat === 'none'}
      className="flex min-h-14 items-center gap-1 bg-paper py-1.5"
    >
      {(guard) => (
        <>
          {/* 완료 동그라미 (메모는 메모 표시) */}
          {item.kind === 'memo' ? (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center text-muted">
              <MemoIcon className="h-5 w-5" />
            </span>
          ) : (
            <CheckCircle done={done} onClick={guard(onToggle)} />
          )}

          <div className="min-w-0 flex-1 py-1">
            <p className="text-base leading-snug break-words">
              <span className={`strike ${done ? 'is-done' : ''}`}>{item.title}</span>
            </p>
            {hasSub && (
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
                {showDate && <span>{formatShortDate(item.date)}</span>}
                {item.time && <span className="font-semibold text-ink/70">{formatKoreanTime(item.time)}</span>}
                {item.kind === 'event' && !item.time && <span>하루 종일</span>}
                {item.kind === 'event' && <span>일정</span>}
                {item.kind === 'memo' && <span>메모</span>}
                {item.repeat !== 'none' && <span>{REPEAT_LABEL[item.repeat]} 반복</span>}
                {item.content && <span className="truncate">{item.content.split('\n')[0]}</span>}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={guard(onStar)}
            aria-label={item.starred ? '중요 표시 해제' : '중요 표시'}
            aria-pressed={item.starred}
            className={`flex h-12 w-12 shrink-0 items-center justify-center transition-colors duration-200 ${
              item.starred ? 'text-ink' : 'text-line'
            }`}
          >
            <StarIcon className="h-5 w-5" filled={item.starred} />
          </button>
        </>
      )}
    </SwipeRow>
  )
}
