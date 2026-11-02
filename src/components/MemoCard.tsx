// 메모 화면의 카드 한 장: 제목 + 내용 미리보기. 눌러서 열기, 밀어서 삭제.
import type { Item } from '../types'
import { formatShortDate } from '../utils/date'
import { StarIcon } from './Icons'
import { SwipeRow } from './SwipeRow'

interface Props {
  item: Item
  onOpen: () => void
  onStar: () => void
  onDelete: () => void
}

export function MemoCard({ item, onOpen, onStar, onDelete }: Props) {
  // 제목이 내용 첫 줄과 같으면(제목 없이 쓴 메모) 미리보기에서는 첫 줄을 빼요
  const lines = item.content.trim().split('\n')
  const preview = lines[0].trim() === item.title ? lines.slice(1).join('\n').trim() : item.content.trim()

  return (
    <SwipeRow
      label={`${item.title} 메모 열기`}
      onTap={onOpen}
      onDelete={onDelete}
      className="flex gap-2 rounded-2xl border border-gray-200 py-3 pr-1 pl-4 dark:border-gray-800"
    >
      {(guard) => (
        <>
          <div className="min-w-0 flex-1 py-1">
            <p className="truncate text-lg font-bold">{item.title}</p>
            {preview && (
              <p className="mt-1 line-clamp-2 text-base whitespace-pre-line text-gray-600 dark:text-gray-300">
                {preview}
              </p>
            )}
            <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500">{formatShortDate(item.date)}</p>
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
