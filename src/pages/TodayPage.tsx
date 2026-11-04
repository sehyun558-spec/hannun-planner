// 오늘 화면: 오늘의 한 가지 + 진행 표시 + 빠른 입력 + 오늘 목록
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Item } from '../types'
import { useItems } from '../store/ItemsContext'
import { formatKoreanDate, formatKoreanTime } from '../utils/date'
import { isDoneOn, occursOn, sortItems } from '../utils/items'
import { QuickInput } from '../components/QuickInput'
import { DayList } from '../components/DayList'
import { EditSheet } from '../components/EditSheet'
import { CheckCircle } from '../components/CheckCircle'
import { Harussak } from '../components/Harussak'
import { FocusSprout } from '../components/FocusSprout'
import { useNight } from '../hooks/useHarussakTime'
import { harussakLine } from '../utils/harussak'
import { CheerToast } from '../components/CheerToast'
import { CarryOverBar } from '../components/CarryOverBar'
import { BackupNudge } from '../components/BackupNudge'
import { SearchIcon, SettingsIcon, StarIcon } from '../components/Icons'

interface Props {
  today: string
  onSearch: () => void
  onSettings: () => void
  /** 마지막으로 백업한 날 (백업 안내용) */
  lastBackup: string | null
  onBackedUp: () => void
  /** 설정의 "오늘의 한 줄 보기" */
  showQuote: boolean
  /** 오랜만에 왔으면 하루싹이 "왔다!" 한 번 */
  welcome: boolean
  onWelcomed: () => void
}

export function TodayPage({ today, onSearch, onSettings, lastBackup, onBackedUp, showQuote, welcome, onWelcomed }: Props) {
  const night = useNight() // 밤 11시~새벽 5시
  const { items, toggleDone, toggleStar, updateItem, requestDelete } = useItems()
  const [editing, setEditing] = useState<Item | null>(null)
  const [cheer, setCheer] = useState(false)

  // 오늘 체크할 수 있는 항목(할 일·일정)
  const checkable = useMemo(
    () => items.filter((it) => it.kind !== 'memo' && occursOn(it, today)),
    [items, today],
  )
  const total = checkable.length
  const done = checkable.filter((it) => isDoneOn(it, today)).length
  // 밤(11시~5시)에는 졸린 하루싹. 단, 오늘 할 일을 다 끝냈으면 밤에도 꽃이 피어 있어요
  const sleepy = night && !(total > 0 && done >= total)

  // 오늘의 한 가지: 별(☆)을 붙인 오늘 할 일 중 첫 번째 (아직 안 끝난 것을 먼저)
  const focus = useMemo(() => {
    const starred = sortItems(checkable.filter((it) => it.starred))
    return starred.find((it) => !isDoneOn(it, today)) ?? starred[0] ?? null
  }, [checkable, today])
  const focusDone = focus ? isDoneOn(focus, today) : false

  // 방금 모두 끝냈을 때만 칭찬 문구 (처음 열었을 때는 안 띄워요)
  const prev = useRef<{ done: number; total: number } | null>(null)
  useEffect(() => {
    const p = prev.current
    prev.current = { done, total }
    if (p && total > 0 && done === total && p.done < p.total) setCheer(true)
  }, [done, total])

  const hasAnything = items.some((it) => occursOn(it, today))

  const iconBtn =
    'flex h-11 w-11 items-center justify-center rounded-xl text-muted transition-colors duration-200 active:bg-line'

  return (
    <div className="space-y-8">
      <header className="space-y-2 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-light tracking-tight">오늘</h1>
          <div className="-mr-2 flex">
            <button type="button" onClick={onSearch} aria-label="통합 검색" className={iconBtn}>
              <SearchIcon className="h-6 w-6" />
            </button>
            <button type="button" onClick={onSettings} aria-label="설정" className={iconBtn}>
              <SettingsIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-[15px] text-muted">
          {/* 하루싹: 진행 표시 대신, 오늘 끝낸 만큼 자라요 */}
          <Harussak done={done} total={total} night={sleepy} welcome={welcome} onWelcomed={onWelcomed} />
          <span>{formatKoreanDate(today)}</span>
          {total > 0 && (
            <span className="text-ink" aria-label={`할 일 ${total}개 중 ${done}개 완료`}>
              {total}개 중 {done}개
            </span>
          )}
        </div>
        {/* 하루싹 한마디 (설정에서 끌 수 있어요) */}
        {showQuote && (
          <p className="font-hand text-[18px] leading-[1.6] text-muted" aria-label={`하루싹 한마디: ${sleepy ? '이제 자도 돼' : harussakLine(done, total)}`}>
            {sleepy ? '이제 자도 돼' : harussakLine(done, total)}
          </p>
        )}
      </header>

      {/* 어제(지난 날) 못 한 일 넘기기 */}
      <CarryOverBar today={today} />

      {/* 오늘 꼭 할 한 가지 */}
      {total > 0 && (
        <section aria-label="오늘 꼭 할 한 가지">
          <p className="mb-2 text-[13px] text-muted">오늘 꼭 할 한 가지</p>
          {focus ? (
            <div className="flex items-center gap-1 rounded-2xl border border-line bg-card py-3 pr-1 pl-2">
              <CheckCircle size="lg" done={focusDone} onClick={() => toggleDone(focus.id, today)} />
              <button
                type="button"
                onClick={() => setEditing(focus)}
                aria-label={`${focus.title} 수정하기`}
                className="min-w-0 flex-1 py-1 text-left"
              >
                <span className="block text-[22px] leading-snug font-light break-words">
                  <span className={`strike ${focusDone ? 'is-done' : ''}`}>{focus.title}</span>
                </span>
                {focus.time && (
                  <span className="mt-1 block text-[13px] text-muted">{formatKoreanTime(focus.time)}</span>
                )}
              </button>
              {/* 작은 하루싹: 할 일이 올라오면 쏙, 완료하면 꽃 */}
              <FocusSprout key={focus.id} done={focusDone} />
              <button
                type="button"
                onClick={() => toggleStar(focus.id)}
                aria-label="오늘의 한 가지에서 내리기"
                className="flex h-12 w-12 shrink-0 items-center justify-center text-ink"
              >
                <StarIcon className="h-5 w-5" filled />
              </button>
            </div>
          ) : (
            <p className="rounded-2xl border border-line px-5 py-5 text-[15px] text-muted">
              아래 할 일의 <span className="text-ink">☆</span>를 누르면 여기에 크게 올라와요
            </p>
          )}
        </section>
      )}

      <QuickInput date={today} />

      <DayList
        day={today}
        excludeId={focus?.id}
        emptyText={hasAnything ? '' : '오늘은 여유로운 날이에요'}
        emptySub={hasAnything ? undefined : '떠오르는 일이 있으면 위에 적어 보세요'}
      />

      {/* 오래 백업하지 않았으면 맨 아래에 조용히 한 줄 */}
      <BackupNudge today={today} lastBackup={lastBackup} onBackedUp={onBackedUp} />

      <p className="pt-4 text-center text-xs text-muted">광고 없고, 데이터는 이 기기에만 저장됩니다</p>

      {cheer && <CheerToast onDone={() => setCheer(false)} />}

      {editing && (
        <EditSheet
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(next) => {
            updateItem(next.id, next)
            setEditing(null)
          }}
          onDelete={() => {
            requestDelete(editing, today)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
