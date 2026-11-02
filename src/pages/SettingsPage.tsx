// 설정 화면: 화면 모드, 알림, 백업, 안내 (오늘 화면 오른쪽 위 ⚙️)
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Settings } from '../store/settings'
import type { ThemeMode } from '../hooks/useTheme'
import { useItems } from '../store/ItemsContext'
import { exportBackup, readBackup } from '../store/backup'
import { formatShortDate, todayStr } from '../utils/date'
import { BackIcon } from '../components/Icons'

interface Props {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onClose: () => void
}

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: '시스템' },
  { value: 'light', label: '밝게' },
  { value: 'dark', label: '어둡게' },
]

type Notice = { kind: 'ok' | 'warn'; text: string } | null

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="px-1 text-base font-semibold text-gray-500 dark:text-gray-400">{title}</h2>
      {children}
    </section>
  )
}

function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null
  return (
    <p
      role="status"
      className={`rounded-2xl p-3 text-base ${
        notice.kind === 'ok'
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
          : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
      }`}
    >
      {notice.text}
    </p>
  )
}

export function SettingsPage({ settings, onChange, onClose }: Props) {
  const { items, mergeItems } = useItems()
  const fileRef = useRef<HTMLInputElement>(null)
  const [notifyNotice, setNotifyNotice] = useState<Notice>(null)
  const [backupNotice, setBackupNotice] = useState<Notice>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const count = (k: string) => items.filter((it) => it.kind === k).length

  // 알림 켜기/끄기: 켤 때만 알림 권한을 물어봐요
  const toggleNotify = async () => {
    if (settings.notify) {
      onChange({ notify: false })
      setNotifyNotice(null)
      return
    }
    onChange({ notify: true })
    if (!('Notification' in window)) {
      setNotifyNotice({
        kind: 'warn',
        text: '이 브라우저는 폰 알림을 지원하지 않아서, 앱 화면 안에서만 알려드려요. 아이폰은 홈 화면에 설치한 뒤에 폰 알림을 받을 수 있어요.',
      })
      return
    }
    let permission = Notification.permission
    if (permission === 'default') {
      try {
        permission = await Notification.requestPermission()
      } catch {
        permission = 'denied'
      }
    }
    setNotifyNotice(
      permission === 'granted'
        ? { kind: 'ok', text: '알림이 켜졌어요. 앱이 열려 있을 때 일정 시간에 알려드려요.' }
        : {
            kind: 'warn',
            text: '폰 알림이 차단되어 있어요. 브라우저(또는 폰) 설정에서 이 사이트의 알림을 허용해 주세요. 그전까지는 앱 화면 안에서만 알려드려요.',
          },
    )
  }

  const doExport = () => {
    exportBackup(items)
    onChange({ lastBackup: todayStr() })
    setBackupNotice({ kind: 'ok', text: `항목 ${items.length}개를 백업 파일로 저장했어요.` })
  }

  const doImport = async (file: File | undefined) => {
    if (!file) return
    try {
      const incoming = await readBackup(file)
      const { added, updated } = mergeItems(incoming)
      setBackupNotice({
        kind: 'ok',
        text:
          added + updated === 0
            ? '이미 모두 들어 있는 내용이라 바뀐 게 없어요.'
            : `불러오기 완료! 새 항목 ${added}개${updated ? `, 더 최근 내용으로 바뀐 항목 ${updated}개` : ''}.`,
      })
    } catch (e) {
      setBackupNotice({ kind: 'warn', text: e instanceof Error ? e.message : '불러오지 못했어요.' })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const bigBtn =
    'h-14 w-full rounded-2xl text-lg font-bold active:opacity-80 disabled:opacity-40'

  return (
    <div
      className="fixed inset-0 z-30 overflow-y-auto bg-white dark:bg-gray-950"
      role="dialog"
      aria-modal="true"
      aria-label="설정"
    >
      <div
        className="mx-auto max-w-md space-y-8 px-4"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)',
        }}
      >
        <header className="flex items-center gap-1 pt-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="설정 닫기"
            className="-ml-2 flex h-12 w-12 items-center justify-center rounded-2xl active:bg-gray-100 dark:active:bg-gray-800"
          >
            <BackIcon className="h-7 w-7" />
          </button>
          <h1 className="text-3xl font-bold">설정</h1>
        </header>

        <Section title="화면 모드">
          <div className="flex gap-1 rounded-2xl bg-gray-100 p-1 dark:bg-gray-800" role="radiogroup" aria-label="화면 모드">
            {THEMES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={settings.theme === value}
                onClick={() => onChange({ theme: value })}
                className={`h-12 flex-1 rounded-xl text-lg font-semibold ${
                  settings.theme === value
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-950 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="px-1 text-sm text-gray-500 dark:text-gray-400">
            ‘시스템’은 폰 설정(다크모드)을 그대로 따라가요.
          </p>
        </Section>

        <Section title="알림">
          <button
            type="button"
            role="switch"
            aria-checked={settings.notify}
            onClick={toggleNotify}
            className="flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-left dark:bg-gray-900"
          >
            <span>
              <span className="block text-lg font-semibold">일정 시간 알림</span>
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                시간을 정한 항목을 그 시간에 알려줘요 (앱이 열려 있을 때)
              </span>
            </span>
            <span
              className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
                settings.notify ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-hidden
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                  settings.notify ? 'left-7' : 'left-1'
                }`}
              />
            </span>
          </button>
          <NoticeBox notice={notifyNotice} />
        </Section>

        <Section title="백업">
          <p className="px-1 text-base text-gray-600 dark:text-gray-300">
            폰을 바꾸거나 브라우저 기록을 지우면 데이터가 사라질 수 있어요. 가끔 백업 파일을 저장해 두세요.
          </p>
          <button type="button" onClick={doExport} className={`${bigBtn} bg-blue-600 text-white`}>
            백업 파일 저장하기
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`${bigBtn} bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100`}
          >
            백업 파일 불러오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="백업 파일 선택"
            onChange={(e) => doImport(e.target.files?.[0])}
          />
          <p className="px-1 text-sm text-gray-500 dark:text-gray-400">
            마지막 백업: {settings.lastBackup ? formatShortDate(settings.lastBackup) : '아직 없음'} · 불러오기는
            지금 내용을 지우지 않고 합쳐요.
          </p>
          <NoticeBox notice={backupNotice} />
        </Section>

        <Section title="안내">
          <div className="space-y-2 rounded-2xl bg-gray-50 p-4 text-base dark:bg-gray-900">
            <p className="font-semibold">🔒 광고 없고, 데이터는 이 기기에만 저장됩니다.</p>
            <p className="text-gray-600 dark:text-gray-300">
              가입·로그인이 없고, 입력한 내용은 어떤 서버로도 보내지지 않아요.
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              저장된 항목: 할 일 {count('todo')} · 일정 {count('event')} · 메모 {count('memo')}
            </p>
          </div>
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">한눈 플래너 v1.0</p>
        </Section>
      </div>
    </div>
  )
}
