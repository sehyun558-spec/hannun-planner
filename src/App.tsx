// 앱 전체 틀: 위에는 화면, 아래에는 탭 3개
import { useCallback, useState } from 'react'
import type { Item } from './types'
import { ItemsProvider, useItems } from './store/ItemsContext'
import { useSettings } from './store/settings'
import { BottomTabs } from './components/BottomTabs'
import type { Tab } from './components/BottomTabs'
import { UndoToast } from './components/UndoToast'
import { ReminderBanner } from './components/ReminderBanner'
import { RepeatDeleteSheet } from './components/RepeatDeleteSheet'
import { TodayPage } from './pages/TodayPage'
import { CalendarPage } from './pages/CalendarPage'
import { MemoPage } from './pages/MemoPage'
import { SearchPage } from './pages/SearchPage'
import { SettingsPage } from './pages/SettingsPage'
import { useTheme } from './hooks/useTheme'
import { useToday } from './hooks/useToday'
import { useReminders } from './hooks/useReminders'
import { useDayPart } from './hooks/useDayPart'
import { useColorTheme } from './hooks/useColorTheme'
import { useWelcomeBack } from './hooks/useHarussakTime'
import { todayStr } from './utils/date'

type Overlay = 'search' | 'settings' | null

function Shell() {
  const [tab, setTab] = useState<Tab>('today')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [settings, updateSettings] = useSettings()
  const [reminders, setReminders] = useState<Item[]>([])
  const today = useToday()
  const { items, saveFailed } = useItems()

  // 새 디자인은 밝은 화면만 써요 (다크 모드는 색상표를 만든 뒤 settings.theme 로 다시 켤 수 있어요)
  useTheme('light')
  useColorTheme(settings.colorTheme) // 설정에서 고른 색 테마
  useDayPart()
  const { welcome, done: welcomed } = useWelcomeBack() // 3일 이상 만에 오면 하루싹이 반겨요
  useReminders(items, settings.notify, (it) => setReminders((prev) => [...prev, it]))
  const closeReminders = useCallback(() => setReminders([]), [])
  const closeOverlay = useCallback(() => setOverlay(null), [])

  return (
    <div className="min-h-dvh bg-paper text-ink">
      {/* 검색·설정 화면이 열려 있으면 뒤 화면은 눌리지 않게 */}
      <div inert={overlay !== null}>
        <main
          className="mx-auto max-w-md px-5"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)',
          }}
        >
          {saveFailed && (
            <p className="mt-3 rounded-2xl border border-ink bg-card p-4 text-[15px] text-ink">
              저장 공간이 부족해서 저장하지 못했어요. 설정에서 백업을 받아 두세요.
            </p>
          )}
          {tab === 'today' && (
            <TodayPage
              today={today}
              onSearch={() => setOverlay('search')}
              onSettings={() => setOverlay('settings')}
              lastBackup={settings.lastBackup}
              showQuote={settings.showQuote}
              welcome={welcome}
              onWelcomed={welcomed}
              onBackedUp={() => updateSettings({ lastBackup: todayStr() })}
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
      <RepeatDeleteSheet />
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
