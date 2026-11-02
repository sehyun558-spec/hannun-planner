// 시간 따라 바뀌는 배경: 아침(6~11시) / 낮 / 저녁(18시 이후)
// <html data-daypart="..."> 를 바꾸면 index.css 가 배경색을 아주 살짝 바꿔요.
import { useEffect } from 'react'

export type DayPart = 'morning' | 'day' | 'evening'

export function dayPartOf(hour: number): DayPart {
  if (hour >= 6 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 18) return 'day'
  return 'evening' // 18시 이후 ~ 새벽
}

export function useDayPart() {
  useEffect(() => {
    const apply = () => {
      const root = document.documentElement
      const part = dayPartOf(new Date().getHours())
      if (root.dataset.daypart !== part) root.dataset.daypart = part
      // 폰 맨 위 상태 표시줄 색도 배경과 맞춰요
      const paper = getComputedStyle(root).getPropertyValue('--paper').trim()
      if (paper) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', paper)
    }
    apply()
    const timer = setInterval(apply, 60_000)
    document.addEventListener('visibilitychange', apply)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', apply)
    }
  }, [])
}
