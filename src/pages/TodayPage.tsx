// 오늘 화면: 켜자마자 입력창 + 오늘 목록
import { useMemo } from 'react'
import { useItems } from '../store/ItemsContext'
import { formatKoreanDate } from '../utils/date'
import { isDoneOn, occursOn } from '../utils/items'
import { QuickInput } from '../components/QuickInput'
import { DayList } from '../components/DayList'
import { SearchIcon } from '../components/Icons'

export function TodayPage({ today, onSearch }: { today: string; onSearch: () => void }) {
  const { items } = useItems()

  const left = useMemo(
    () => items.filter((it) => it.kind === 'todo' && occursOn(it, today) && !isDoneOn(it, today)).length,
    [items, today],
  )

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">오늘</h1>
          <button
            type="button"
            onClick={onSearch}
            aria-label="통합 검색"
            className="-mr-2 flex h-12 w-12 items-center justify-center rounded-2xl text-gray-600 active:bg-gray-100 dark:text-gray-300 dark:active:bg-gray-800"
          >
            <SearchIcon className="h-7 w-7" />
          </button>
        </div>
        <p className="mt-1 text-lg text-gray-500 dark:text-gray-400">
          {formatKoreanDate(today)}
          {left > 0 && <span className="text-blue-600 dark:text-blue-400"> · 할 일 {left}개 남음</span>}
        </p>
      </header>

      <QuickInput date={today} autoFocus />

      <DayList day={today} emptyText="아직 아무것도 없어요. 위에 입력해 보세요 ✍️" />

      <p className="pt-6 text-center text-sm text-gray-400 dark:text-gray-500">
        광고 없고, 데이터는 이 기기에만 저장됩니다
      </p>
    </div>
  )
}
