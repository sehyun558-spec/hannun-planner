// 설정(다크모드, 알림, 마지막 백업 날짜)을 이 기기에 저장해요.
import { useCallback, useState } from 'react'
import type { ThemeMode } from '../hooks/useTheme'

const KEY = 'hannun-planner:settings'

export interface Settings {
  theme: ThemeMode
  /** 일정 시간 알림 켜기 (사용자가 설정에서 켰을 때만) */
  notify: boolean
  /** 마지막으로 백업 파일을 저장한 날짜 'YYYY-MM-DD' */
  lastBackup: string | null
  /** 오늘의 한 줄(명언) 보기 — 기본 켜짐 */
  showQuote: boolean
}

const DEFAULTS: Settings = { theme: 'system', notify: false, lastBackup: null, showQuote: true }

function load(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Settings>
    return {
      theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'system',
      notify: raw.notify === true,
      lastBackup: typeof raw.lastBackup === 'string' ? raw.lastBackup : null,
      showQuote: raw.showQuote !== false,
    }
  } catch {
    return DEFAULTS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load)
  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        /* 저장 공간이 없으면 이번 실행 동안만 유지 */
      }
      return next
    })
  }, [])
  return [settings, update] as const
}
