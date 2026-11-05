// 휴대폰 "뒤로가기"(안드로이드 버튼·옆에서 밀기)를 누르면 앱이 꺼지지 않고, 열려 있는 창만 닫히게 해요.
// - 창이 열릴 때 브라우저 기록에 "창 열림" 한 칸을 쌓아요.
// - 뒤로가기를 누르면 그 칸이 빠지면서 맨 위 창의 닫기(close)를 불러요.
// - 버튼으로 닫았으면 쌓아 둔 칸을 조용히 치워요 (안 그러면 뒤로가기를 한 번 더 눌러야 해서 어색해요).
// 창이 겹쳐 있으면(검색 → 수정 창) 맨 위 창부터 하나씩 닫혀요.
import { useEffect, useRef } from 'react'

interface Layer {
  close: () => void
  /** 버튼으로 닫혀서 기록 칸을 치우려고 기다리는 중 */
  removing: number
}

const stack: Layer[] = []
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
  const layerRef = useRef<Layer | null>(null)
  useEffect(() => {
    closeRef.current = close
  })

  useEffect(() => {
    if (!enabled) return
    let layer = layerRef.current
    if (layer && layer.removing) {
      // 개발 모드에서 화면을 두 번 그려 볼 때: 치우려던 칸을 그대로 다시 써요
      clearTimeout(layer.removing)
      layer.removing = 0
      stack.push(layer)
    } else {
      layer = { close: () => closeRef.current(), removing: 0 }
      layerRef.current = layer
      stack.push(layer)
      history.pushState({ hannunLayer: true }, '')
    }
    const me = layer
    return () => {
      const i = stack.indexOf(me)
      if (i < 0) {
        // 뒤로가기로 닫혔어요 (기록 칸은 이미 빠졌음)
        layerRef.current = null
        return
      }
      stack.splice(i, 1)
      me.removing = window.setTimeout(() => {
        layerRef.current = null
        ignorePops++
        history.back()
      }, 0)
    }
  }, [enabled])
}
