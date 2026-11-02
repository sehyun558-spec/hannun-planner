// 아래에서 올라온 창을 손가락으로 아래로 끌어내리면 닫히게 해요.
// - 창 안 내용이 맨 위에 있을 때만 끌려 내려가요 (내용을 스크롤 중이면 스크롤이 먼저)
// - 충분히(120px) 내리거나, 빠르게 휙 내리면 닫혀요. 조금만 내렸다 놓으면 제자리로.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

const START_SLOP = 8 // 이만큼 움직여야 "끌기"로 판단
const CLOSE_DISTANCE = 120
const CLOSE_SPEED = 0.6 // px/ms
export const SHEET_ANIM_MS = 250

export function useDragToClose(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const [dy, setDy] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [closing, setClosing] = useState(false)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  /** 부드럽게 내려가면서 닫기 */
  const close = useCallback(() => {
    setClosing(true)
    setTimeout(() => onCloseRef.current(), SHEET_ANIM_MS)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let active = false
    let decided = false
    let startX = 0
    let startY = 0
    let cur = 0
    // 손을 떼는 순간의 속도를 재기 위한 최근 위치 기록
    let samples: { y: number; t: number }[] = []

    const canStart = (target: EventTarget | null) => {
      if (el.scrollTop > 0) return false
      const ta = target instanceof Element ? target.closest('textarea') : null
      if (ta && ta.scrollTop > 0) return false
      return true
    }
    const begin = (x: number, y: number, target: EventTarget | null) => {
      active = canStart(target)
      decided = false
      startX = x
      startY = y
      cur = 0
      samples = []
    }
    const move = (x: number, y: number, e: Event) => {
      if (!active) return
      const ddy = y - startY
      const ddx = x - startX
      if (!decided) {
        if (Math.abs(ddy) < START_SLOP && Math.abs(ddx) < START_SLOP) return
        decided = true
        // 위로 올리거나 옆으로 움직이면 끌기가 아니에요 (스크롤·글자 선택 등)
        if (ddy <= 0 || Math.abs(ddx) > Math.abs(ddy)) {
          active = false
          return
        }
        ;(document.activeElement as HTMLElement | null)?.blur?.() // 키보드가 떠 있으면 내려요
        setDragging(true)
      }
      if (e.cancelable) e.preventDefault() // 화면이 같이 출렁이지 않게
      cur = Math.max(0, ddy)
      const now = performance.now()
      samples.push({ y: cur, t: now })
      samples = samples.filter((p) => now - p.t <= 100) // 최근 0.1초만
      setDy(cur)
    }
    const end = () => {
      if (!active || !decided) {
        active = false
        return
      }
      active = false
      setDragging(false)
      const first = samples[0]
      const last = samples[samples.length - 1]
      const speed = first && last && last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0
      if (cur > CLOSE_DISTANCE || (cur > 40 && speed > CLOSE_SPEED)) close()
      else setDy(0)
    }

    // 손가락(터치)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        active = false
        return
      }
      begin(e.touches[0].clientX, e.touches[0].clientY, e.target)
    }
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY, e)
    // 마우스(컴퓨터): 입력칸 위에서 시작하면 글자 선택이 우선
    const onMouseDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return
      begin(e.clientX, e.clientY, e.target)
    }
    const onMouseMove = (e: PointerEvent) => e.pointerType === 'mouse' && move(e.clientX, e.clientY, e)
    const onMouseUp = (e: PointerEvent) => e.pointerType === 'mouse' && end()

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', end)
    el.addEventListener('touchcancel', end)
    el.addEventListener('pointerdown', onMouseDown)
    window.addEventListener('pointermove', onMouseMove)
    window.addEventListener('pointerup', onMouseUp)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', end)
      el.removeEventListener('pointerdown', onMouseDown)
      window.removeEventListener('pointermove', onMouseMove)
      window.removeEventListener('pointerup', onMouseUp)
    }
  }, [ref, close])

  return { dy, dragging, closing, close }
}
