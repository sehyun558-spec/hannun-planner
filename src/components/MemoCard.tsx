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
      className="flex gap-2 rounded-2xl border border-line bg-card py-4 pr-1 pl-5"
    >
      {(guard) => (
        <>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">{item.title}</p>
            {preview && (
              <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed whitespace-pre-line text-muted">
                {preview}
              </p>
            )}
            <p className="mt-2 text-xs text-muted">{formatShortDate(item.date)}</p>
          </div>
          <button
            type="button"
            onClick={guard(onStar)}
            aria-label={item.starred ? '중요 표시 해제' : '중요 표시'}
            aria-pressed={item.starred}
            className={`-mt-2 flex h-12 w-12 shrink-0 items-center justify-center transition-colors duration-200 ${
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
