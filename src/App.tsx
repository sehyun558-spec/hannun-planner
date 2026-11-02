// 앱 전체 틀: 위에는 화면, 아래에는 탭 3개
import { useState } from 'react'
import { ItemsProvider, useItems } from './store/ItemsContext'
import { BottomTabs } from './components/BottomTabs'
import type { Tab } from './components/BottomTabs'
import { UndoToast } from './components/UndoToast'
import { TodayPage } from './pages/TodayPage'
import { CalendarPage } from './pages/CalendarPage'
import { MemoPage } from './pages/MemoPage'
import { useTheme } from './hooks/useTheme'
import { useToday } from './hooks/useToday'

function Shell() {
  const [tab, setTab] = useState<Tab>('today')
  const today = useToday()
  const { saveFailed } = useItems()
  useTheme('system')

  return (
    <div className="min-h-dvh bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <main
        className="mx-auto max-w-md px-4"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)',
        }}
      >
        {saveFailed && (
          <p className="mb-3 rounded-2xl bg-red-50 p-3 text-base text-red-600 dark:bg-red-950 dark:text-red-300">
            저장 공간이 부족해서 저장하지 못했어요. 설정에서 백업을 받아 두세요.
          </p>
        )}
        {tab === 'today' && <TodayPage today={today} />}
        {tab === 'calendar' && <CalendarPage />}
        {tab === 'memo' && <MemoPage />}
      </main>
      <UndoToast />
      <BottomTabs tab={tab} onChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <ItemsProvider>
      <Shell />
    </ItemsProvider>
  )
}
