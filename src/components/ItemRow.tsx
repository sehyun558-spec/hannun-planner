// 목록의 한 줄: ○ 눌러 완료, ☆ 눌러 중요, 옆으로 밀어서 삭제, 눌러서 수정
import type { Item } from '../types'
import { isDoneOn } from '../utils/items'
import { formatKoreanTime, formatShortDate } from '../utils/date'
import { CheckIcon, MemoIcon, StarIcon } from './Icons'
import { SwipeRow } from './SwipeRow'

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
      className="flex min-h-16 items-center gap-1 px-1 py-2"
    >
      {(guard) => (
        <>
          {/* 완료 동그라미 (메모는 메모 표시) */}
          {item.kind === 'memo' ? (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center text-gray-400 dark:text-gray-500">
              <MemoIcon className="h-6 w-6" />
            </span>
          ) : (
            <button
              type="button"
              onClick={guard(onToggle)}
              aria-label={done ? '완료 취소' : '완료하기'}
              aria-pressed={done}
              className="flex h-12 w-12 shrink-0 items-center justify-center"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                  done
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {done && <CheckIcon className="h-4 w-4" />}
              </span>
            </button>
          )}

          <div className="min-w-0 flex-1 py-1">
            <p
              className={`break-words text-lg leading-snug ${
                done ? 'text-gray-400 line-through dark:text-gray-500' : ''
              }`}
            >
              {item.title}
            </p>
            {hasSub && (
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400">
                {showDate && <span>{formatShortDate(item.date)}</span>}
                {item.time && (
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {formatKoreanTime(item.time)}
                  </span>
                )}
                {item.kind === 'event' && !item.time && <span>하루 종일</span>}
                {item.kind === 'event' && <span>일정</span>}
                {item.kind === 'memo' && <span>메모</span>}
                {item.repeat !== 'none' && <span>🔁 {REPEAT_LABEL[item.repeat]}</span>}
                {item.content && <span className="truncate">{item.content.split('\n')[0]}</span>}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={guard(onStar)}
            aria-label={item.starred ? '중요 표시 해제' : '중요 표시'}
            aria-pressed={item.starred}
            className={`flex h-12 w-12 shrink-0 items-center justify-center ${
              item.starred ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          >
            <StarIcon className="h-6 w-6" filled={item.starred} />
          </button>
        </>
      )}
    </SwipeRow>
  )
}
