// 못 한 일 넘기기: 오늘 이전에 끝내지 못한 할 일이 있으면, 바구니 든 하루싹이 조용히 물어봐요.
// [가져오기] → 한 번에 오늘로 옮겨요. [✕] → 그날은 다시 안 보여요 (다음 날 또 남아 있으면 다시 물어봐요).
import { useMemo, useState } from 'react'
import { useItems } from '../store/ItemsContext'
import { CloseIcon } from './Icons'
import { harussakImg } from '../utils/harussak'

const DISMISS_KEY = 'hannun-planner:carry-dismissed'

function loadDismissed(): string | null {
  try {
    return localStorage.getItem(DISMISS_KEY)
  } catch {
    return null
  }
}

export function CarryOverBar({ today }: { today: string }) {
  const { items, updateItem } = useItems()
  const [dismissedDay, setDismissedDay] = useState(loadDismissed)

  // 오늘보다 이전 날짜 + 끝내지 않은 할 일 (반복 할 일은 매일 다시 나오니까 빼요)
  const overdue = useMemo(
    () => items.filter((it) => it.kind === 'todo' && it.repeat === 'none' && !it.done && it.date < today),
    [items, today],
  )

  if (overdue.length === 0 || dismissedDay === today) return null

  const yesterday = (() => {
    const [y, m, d] = today.split('-').map(Number)
    const t = new Date(y, m - 1, d - 1)
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  })()
  const when = overdue.every((it) => it.date === yesterday) ? '어제' : '지난'

  const bringAll = () => overdue.forEach((it) => updateItem(it.id, { date: today }))

  const dismiss = () => {
    setDismissedDay(today)
    try {
      localStorage.setItem(DISMISS_KEY, today)
    } catch {
      /* 저장이 안 되면 이번에 켜 둔 동안만 숨겨요 */
    }
  }

  return (
    <section
      aria-label="못 한 일 넘기기"
      className="fadein flex items-start gap-2 rounded-2xl border border-line bg-card py-2 pr-1 pl-2"
    >
      {/* 바구니 든 하루싹 */}
      <img
        src={harussakImg('basket')}
        alt=""
        width={48}
        height={48}
        draggable={false}
        className="pointer-events-none mt-1 h-12 w-12 shrink-0 scale-[1.35] select-none"
        style={{ transformOrigin: '50% 75%' }}
      />
      {/* 글은 넓게, 버튼은 그 아래 줄에 (작은 폰에서도 글이 너무 접히지 않게) */}
      <div className="min-w-0 flex-1 pt-1.5">
        <p className="font-hand text-[17px] leading-snug break-keep">{when} 거 내가 챙겨왔어. 오늘로 가져올까?</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-[13px] text-muted">할 일 {overdue.length}개</span>
          <button
            type="button"
            onClick={bringAll}
            className="h-11 shrink-0 rounded-xl border border-line px-3.5 text-[15px] font-semibold text-ink transition-colors duration-200 active:bg-line"
          >
            가져오기
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="오늘은 그만 보기"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors duration-200 active:bg-line"
      >
        <CloseIcon className="h-5 w-5" />
      </button>
    </section>
  )
}
