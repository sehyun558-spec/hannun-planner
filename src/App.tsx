// 앱 전체 틀: 위에는 화면, 아래에는 탭 3개
import { useCallback, useState } from 'react'
import type { Item } from './types'
import { ItemsProvider, useItems } from './store/ItemsContext'
import { useSettings } from './store/settings'
import { BottomTabs } from './components/BottomTabs'
import type { Tab } from './components/BottomTabs'
import { UndoToast } from './components/UndoToast'
import { ReminderBanner } from './components/ReminderBanner'
import { TodayPage } from './pages/TodayPage'
import { CalendarPage } from './pages/CalendarPage'
import { MemoPage } from './pages/MemoPage'
import { SearchPage } from './pages/SearchPage'
import { SettingsPage } from './pages/SettingsPage'
import { useTheme } from './hooks/useTheme'
import { useToday } from './hooks/useToday'
import { useReminders } from './hooks/useReminders'

type Overlay = 'search' | 'settings' | null

function Shell() {
  const [tab, setTab] = useState<Tab>('today')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [settings, updateSettings] = useSettings()
  const [reminders, setReminders] = useState<Item[]>([])
  const today = useToday()
  const { items, saveFailed } = useItems()

  useTheme(settings.theme)
  useReminders(items, settings.notify, (it) => setReminders((prev) => [...prev, it]))
  const closeReminders = useCallback(() => setReminders([]), [])
  const closeOverlay = useCallback(() => setOverlay(null), [])

  return (
    <div className="min-h-dvh bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* 검색·설정 화면이 열려 있으면 뒤 화면은 눌리지 않게 */}
      <div inert={overlay !== null}>
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
          {tab === 'today' && (
            <TodayPage
              today={today}
              onSearch={() => setOverlay('search')}
              onSettings={() => setOverlay('settings')}
            />
          )}
          {tab === 'calendar' && <CalendarPage today={today} />}
          {tab === 'memo' && <MemoPage today={today} />}
        </main>
        <BottomTabs tab={tab} onChange={setTab} />
      </div>

      {overlay === 'search' && <SearchPage onClose={closeOverlay} />}
      {overlay === 'settings' && (
        <SettingsPage settings={settings} onChange={updateSettings} onClose={closeOverlay} />
      )}
      <UndoToast />
      <ReminderBanner items={reminders} onClose={closeReminders} />
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
