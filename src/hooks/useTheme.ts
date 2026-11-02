// 다크모드 스위치 (지금은 밝은 화면만 써요. 나중에 index.css 에 어두운 색상표를 추가하면 다시 켤 수 있어요)
import { useEffect } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'

export function useTheme(mode: ThemeMode = 'light') {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [mode])
}
