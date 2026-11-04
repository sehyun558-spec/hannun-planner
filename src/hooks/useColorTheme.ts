// 색 테마 적용: <html data-theme="…"> 를 바꾸면 index.css 와 자동으로 만들어진 테마 CSS 가 색을 바꿔요.
// - 처음 열 때는 index.html 첫 화면 스크립트가 이미 붙여 둬서 깜빡이지 않아요.
// - 설정에서 바꿀 때는 0.3초 동안 부드럽게 바뀌고, 폰 맨 위 상태 표시줄 색도 같이 바뀌어요.
import { useEffect, useRef } from 'react'
import { findTheme } from '../data/themes'

const SWITCH_MS = 300

export function useColorTheme(id: string) {
  const first = useRef(true)
  useEffect(() => {
    const root = document.documentElement
    const theme = findTheme(id).id
    const animate = !first.current && root.dataset.theme !== theme
    first.current = false
    if (animate) root.classList.add('theme-switching')
    root.dataset.theme = theme
    // 상태 표시줄 색 = 지금 테마의 지금 시간대 배경
    const paper = getComputedStyle(root).getPropertyValue('--paper').trim()
    if (paper) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', paper)
    if (!animate) return
    const t = setTimeout(() => root.classList.remove('theme-switching'), SWITCH_MS + 50)
    return () => {
      clearTimeout(t)
      root.classList.remove('theme-switching')
    }
  }, [id])
}
