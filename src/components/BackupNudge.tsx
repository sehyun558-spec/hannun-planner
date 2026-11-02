// 백업 안내: 오래 백업하지 않았으면 오늘 화면 맨 아래에 조용히 한 줄로 알려줘요.
// - 마지막 백업 뒤 14일이 지났거나, 한 번도 안 했는데 항목이 10개 이상이면 보여요.
// - [지금 백업] → 바로 백업 파일 저장. [✕] → 7일 동안 안 보여요.
import { useState } from 'react'
import { useItems } from '../store/ItemsContext'
import { exportBackup } from '../store/backup'
import { fromDateStr, toDateStr } from '../utils/date'
import { CloseIcon } from './Icons'

const HIDE_KEY = 'hannun-planner:backup-nudge-until'
const STALE_DAYS = 14
const NEVER_MIN_ITEMS = 10
const HIDE_DAYS = 7

const daysBetween = (a: string, b: string) =>
  Math.round((fromDateStr(b).getTime() - fromDateStr(a).getTime()) / 86_400_000)

function loadHiddenUntil(): string | null {
  try {
    return localStorage.getItem(HIDE_KEY)
  } catch {
    return null
  }
}

interface Props {
  today: string
  lastBackup: string | null
  onBackedUp: () => void
}

export function BackupNudge({ today, lastBackup, onBackedUp }: Props) {
  const { items } = useItems()
  const [hiddenUntil, setHiddenUntil] = useState(loadHiddenUntil)

  const stale = lastBackup
    ? daysBetween(lastBackup, today) >= STALE_DAYS
    : items.length >= NEVER_MIN_ITEMS
  if (!stale || (hiddenUntil && today < hiddenUntil)) return null

  const hide = () => {
    const d = fromDateStr(today)
    d.setDate(d.getDate() + HIDE_DAYS)
    const until = toDateStr(d)
    setHiddenUntil(until)
    try {
      localStorage.setItem(HIDE_KEY, until)
    } catch {
      /* 저장이 안 되면 이번에 켜 둔 동안만 숨겨요 */
    }
  }

  return (
    <section
      aria-label="백업 안내"
      className="fadein flex items-center gap-2 rounded-2xl border border-line bg-card py-1.5 pr-1 pl-4"
    >
      <p className="min-w-0 flex-1 text-[15px] leading-snug break-keep">
        백업한 지 오래됐어요
        <span className="block text-[13px] text-muted">
          {lastBackup ? `마지막 백업 ${daysBetween(lastBackup, today)}일 전` : `아직 한 번도 안 했어요 · 항목 ${items.length}개`}
        </span>
      </p>
      <button
        type="button"
        onClick={() => {
          exportBackup(items)
          onBackedUp()
        }}
        className="h-11 shrink-0 rounded-xl border border-line px-3.5 text-[15px] font-semibold text-ink transition-colors duration-200 active:bg-line"
      >
        지금 백업
      </button>
      <button
        type="button"
        onClick={hide}
        aria-label="7일 동안 안 보기"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted transition-colors duration-200 active:bg-line"
      >
        <CloseIcon className="h-5 w-5" />
      </button>
    </section>
  )
}
