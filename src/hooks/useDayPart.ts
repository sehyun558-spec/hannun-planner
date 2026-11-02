// 시간 따라 바뀌는 배경: 아침(6~11시) / 낮(11~18시) / 저녁(18시 이후 ~ 새벽)
// <html data-daypart="..."> 를 바꾸면 index.css 가 배경색을 바꿔요 (1초에 걸쳐 천천히).
// 미리 보기: 주소 끝에 ?daypart=morning / day / evening 을 붙이면 그 시간대로 보여요.
//           주소에 붙였을 때만 동작하고, 평소에는 실제 시간을 따라가요.
import { useEffect, useState } from 'react'

export type DayPart = 'morning' | 'day' | 'evening'

export function dayPartOf(hour: number): DayPart {
  if (hour >= 6 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 18) return 'day'
  return 'evening' // 18시 이후 ~ 새벽
}

/** 주소에 ?daypart= 가 붙어 있으면 그 값 (미리 보기용) */
function previewDayPart(): DayPart | null {
  try {
    const v = new URLSearchParams(window.location.search).get('daypart')
    return v === 'morning' || v === 'day' || v === 'evening' ? v : null
  } catch {
    return null
  }
}

/** 지금 시간대 (미리 보기가 있으면 그 값) */
export function currentDayPart(): DayPart {
  return previewDayPart() ?? dayPartOf(new Date().getHours())
}

export function useDayPart(): DayPart {
  const [part, setPart] = useState<DayPart>(currentDayPart)

  useEffect(() => {
    const apply = () => {
      const next = currentDayPart()
      const root = document.documentElement
      if (root.dataset.daypart !== next) root.dataset.daypart = next
      // 폰 맨 위 상태 표시줄 색도 배경과 맞춰요
      const paper = getComputedStyle(root).getPropertyValue('--paper').trim()
      if (paper) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', paper)
      setPart(next)
    }
    apply()
    // 첫 화면이 다 그려진 다음부터 배경이 1초에 걸쳐 바뀌게 (처음 열 때 서서히 나타나지 않게)
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => document.documentElement.classList.add('daypart-ready'))
    })
    const timer = setInterval(apply, 30_000)
    document.addEventListener('visibilitychange', apply)
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      clearInterval(timer)
      document.removeEventListener('visibilitychange', apply)
    }
  }, [])

  return part
}
