// 휴대폰 "뒤로가기"(안드로이드 버튼·옆에서 밀기)를 누르면 앱이 꺼지지 않고, 열려 있는 창만 닫히게 해요.
// - 창이 열릴 때 브라우저 기록에 "창 열림" 한 칸을 쌓아요.
// - 뒤로가기를 누르면 그 칸이 빠지면서 맨 위 창의 닫기(close)를 불러요.
// - 버튼으로 닫았으면 쌓아 둔 칸을 조용히 치워요 (안 그러면 뒤로가기를 한 번 더 눌러야 해서 어색해요).
// - 창이 닫히자마자 다른 창이 열리면(작은 창 → 수정 창) 치우려던 칸을 새 창이 그대로 물려받아요.
//   (치우기와 새로 쌓기가 엇갈려 기록이 꼬이지 않게. 개발 모드에서 화면을 두 번 그려 볼 때도 같은 방법)
// 창이 겹쳐 있으면(검색 → 수정 창) 맨 위 창부터 하나씩 닫혀요.
import { useEffect, useRef } from 'react'

interface Layer {
  close: () => void
}

const stack: Layer[] = []
/** 치우기로 예약된 기록 칸들 (아직 history.back 하기 전) */
const pendingBacks: number[] = []
let ignorePops = 0

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (ignorePops > 0) {
      ignorePops--
      return
    }
    stack.pop()?.close()
  })
}

export function useBackClose(close: () => void, enabled = true) {
  const closeRef = useRef(close)
  useEffect(() => {
    closeRef.current = close
  })

  useEffect(() => {
    if (!enabled) return
    const layer: Layer = { close: () => closeRef.current() }
    stack.push(layer)
    const reuse = pendingBacks.shift()
    if (reuse !== undefined) clearTimeout(reuse) // 방금 닫힌 창의 기록 칸을 물려받아요
    else history.pushState({ plannerLayer: true }, '')
    return () => {
      const i = stack.indexOf(layer)
      if (i < 0) return // 뒤로가기로 닫혔어요 (기록 칸은 이미 빠졌음)
      stack.splice(i, 1)
      const id = window.setTimeout(() => {
        const k = pendingBacks.indexOf(id)
        if (k >= 0) pendingBacks.splice(k, 1)
        ignorePops++
        history.back()
      }, 0)
      pendingBacks.push(id)
    }
  }, [enabled])
}
