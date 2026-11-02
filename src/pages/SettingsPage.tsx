// 설정 화면: 알림, 백업, 안내 (오늘 화면 오른쪽 위 ⚙️)
// 화면 모드(다크 모드)는 새 디자인에서 잠시 숨겨 두었어요. 어두운 색상표를 만들면 다시 보여줄 수 있어요.
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Settings } from '../store/settings'
import { useItems } from '../store/ItemsContext'
import { exportBackup, readBackup } from '../store/backup'
import { formatShortDate, todayStr } from '../utils/date'
import { BackIcon } from '../components/Icons'

interface Props {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onClose: () => void
}

type Notice = { kind: 'ok' | 'warn'; text: string } | null

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="px-1 text-[13px] text-muted">{title}</h2>
      {children}
    </section>
  )
}

function NoticeBox({ notice }: { notice: Notice }) {
  if (!notice) return null
  return (
    <p
      role="status"
      className="fadein flex gap-2.5 rounded-2xl border border-line bg-card p-4 text-[15px] leading-relaxed"
    >
      <span
        className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${notice.kind === 'ok' ? 'bg-sage' : 'bg-ink'}`}
        aria-hidden
      />
      <span>{notice.text}</span>
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
      const { added, updated, skippedDeleted } = mergeItems(incoming)
      const skippedText = skippedDeleted ? ` 백업 뒤에 지운 항목 ${skippedDeleted}개는 다시 넣지 않았어요.` : ''
      setBackupNotice({
        kind: 'ok',
        text:
          added + updated === 0
            ? `이미 모두 들어 있는 내용이라 바뀐 게 없어요.${skippedText}`
            : `불러오기 완료! 새 항목 ${added}개${updated ? `, 더 최근 내용으로 바뀐 항목 ${updated}개` : ''}.${skippedText}`,
      })
    } catch (e) {
      setBackupNotice({ kind: 'warn', text: e instanceof Error ? e.message : '불러오지 못했어요.' })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const bigBtn = 'h-12 w-full rounded-xl text-base transition-opacity duration-200 active:opacity-80'

  return (
    <div className="fadein fixed inset-0 z-30 overflow-y-auto bg-paper" role="dialog" aria-modal="true" aria-label="설정">
      <div
        className="mx-auto max-w-md space-y-10 px-5"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)',
        }}
      >
        <header className="flex items-center gap-1 pt-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="설정 닫기"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-xl text-ink active:bg-line"
          >
            <BackIcon className="h-6 w-6" />
          </button>
          <h1 className="text-[28px] font-light tracking-tight">설정</h1>
        </header>

        <Section title="오늘 화면">
          <button
            type="button"
            role="switch"
            aria-checked={settings.showQuote}
            onClick={() => onChange({ showQuote: !settings.showQuote })}
            className="flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border border-line bg-card px-5 py-4 text-left"
          >
            <span>
              <span className="block text-base font-semibold">오늘의 한 줄 보기</span>
              <span className="mt-0.5 block text-[13px] text-muted">날짜 아래에 하루 한 줄, 짧은 명언을 보여줘요</span>
            </span>
            <span
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                settings.showQuote ? 'bg-sage' : 'bg-line'
              }`}
              aria-hidden
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-card transition-all duration-200 ${
                  settings.showQuote ? 'left-6' : 'left-1'
                }`}
              />
            </span>
          </button>
        </Section>

        <Section title="알림">
          <button
            type="button"
            role="switch"
            aria-checked={settings.notify}
            onClick={toggleNotify}
            className="flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border border-line bg-card px-5 py-4 text-left"
          >
            <span>
              <span className="block text-base font-semibold">일정 시간 알림</span>
              <span className="mt-0.5 block text-[13px] text-muted">
                시간을 정한 항목을 그 시간에 알려줘요 (앱이 열려 있을 때)
              </span>
              <span className="mt-1 block text-[13px] text-ink/80">
                앱을 닫아도 알림을 받으려면 일정을 휴대폰 캘린더에 추가하세요 (일정 수정 창에서)
              </span>
            </span>
            <span
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                settings.notify ? 'bg-sage' : 'bg-line'
              }`}
              aria-hidden
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-card transition-all duration-200 ${
                  settings.notify ? 'left-6' : 'left-1'
                }`}
              />
            </span>
          </button>
          <NoticeBox notice={notifyNotice} />
        </Section>

        <Section title="백업">
          <p className="px-1 text-[15px] leading-relaxed text-ink/80">
            폰을 바꾸거나 브라우저 기록을 지우면 데이터가 사라질 수 있어요. 가끔 백업 파일을 저장해 두세요.
          </p>
          <div className="space-y-2">
            <button type="button" onClick={doExport} className={`${bigBtn} bg-sage font-semibold text-card`}>
              백업 파일 저장하기
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`${bigBtn} border border-line bg-card text-ink`}
            >
              백업 파일 불러오기
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="백업 파일 선택"
            onChange={(e) => doImport(e.target.files?.[0])}
          />
          <p className="px-1 text-[13px] leading-relaxed text-muted">
            마지막 백업: {settings.lastBackup ? formatShortDate(settings.lastBackup) : '아직 없음'} · 불러오기는
            지금 내용을 지우지 않고 합쳐요.
          </p>
          <NoticeBox notice={backupNotice} />
        </Section>

        <Section title="안내">
          <div className="space-y-1.5 rounded-2xl border border-line bg-card p-5 text-[15px] leading-relaxed">
            <p className="font-semibold">광고 없고, 데이터는 이 기기에만 저장됩니다.</p>
            <p className="text-ink/80">가입·로그인이 없고, 입력한 내용은 어떤 서버로도 보내지지 않아요.</p>
            <p className="pt-1 text-[13px] text-muted">
              저장된 항목: 할 일 {count('todo')} · 일정 {count('event')} · 메모 {count('memo')}
            </p>
          </div>
          <p className="pt-2 text-center text-xs text-muted">한눈 플래너 v1.3.1</p>
        </Section>
      </div>
    </div>
  )
}
