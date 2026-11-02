// 화면 맨 아래 탭 3개: 오늘 / 달력 / 메모 (엄지손가락이 닿기 쉬운 위치)
import { CalendarIcon, MemoIcon, TodayIcon } from './Icons'

export type Tab = 'today' | 'calendar' | 'memo'

const TABS: { id: Tab; label: string; Icon: typeof TodayIcon }[] = [
  { id: 'today', label: '오늘', Icon: TodayIcon },
  { id: 'calendar', label: '달력', Icon: CalendarIcon },
  { id: 'memo', label: '메모', Icon: MemoIcon },
]

export function BottomTabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors duration-200 ${
                active ? 'font-semibold text-ink' : 'text-muted'
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
