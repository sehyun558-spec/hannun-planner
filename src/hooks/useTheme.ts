// 다크모드: 지금은 폰의 시스템 설정을 따라가요. (4단계에서 수동 전환을 추가해요)
import { useEffect } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'

export function useTheme(mode: ThemeMode = 'system') {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? '#030712' : '#ffffff')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [mode])
}
