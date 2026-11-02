// 아래에서 올라온 창을 손가락으로 아래로 끌어내리면 닫히게 해요.
// - 창 안 내용이 맨 위에 있을 때만 끌려 내려가요 (내용을 스크롤 중이면 스크롤이 먼저)
// - 충분히(120px) 내리거나, 손을 뗄 때 빠르게 내리고 있으면 닫혀요. 조금만 내렸다 놓으면 제자리로.
// - 부드럽게 보이도록, 끄는 동안에는 화면을 새로 그리지 않고 창의 위치만 바로 옮겨요.
import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'

const START_SLOP = 6 // 이만큼 움직여야 "끌기"로 판단
const CLOSE_DISTANCE = 120
const CLOSE_SPEED = 0.5 // px/ms
export const SHEET_ANIM_MS = 300
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)' // 아이폰 기본 창과 비슷한 부드러운 속도 곡선

export function useDragToClose(
  sheetRef: RefObject<HTMLElement | null>,
  backdropRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose)
  const closingRef = useRef(false)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  /** 창 위치와 뒤 배경 진하기를 바로 바꿔요 (animate: 부드럽게 움직일지) */
  const place = useCallback(
    (y: string, dim: number, animate: boolean) => {
      const sheet = sheetRef.current
      const back = backdropRef.current
      if (sheet) {
        sheet.style.transition = animate ? `transform ${SHEET_ANIM_MS}ms ${EASE}` : 'none'
        sheet.style.transform = `translate3d(0, ${y}, 0)`
      }
      if (back) {
        back.style.transition = animate ? `opacity ${SHEET_ANIM_MS}ms ${EASE}` : 'none'
        back.style.opacity = String(dim)
      }
    },
    [sheetRef, backdropRef],
  )

  /** 부드럽게 내려가면서 닫기 */
  const close = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    place('100%', 0, true)
    setTimeout(() => onCloseRef.current(), SHEET_ANIM_MS)
  }, [place])

  useEffect(() => {
    const el = sheetRef.current
    if (!el) return
    let active = false
    let decided = false
    let dragging = false
    let startX = 0
    let startY = 0
    let cur = 0
    let frame = 0
    let samples: { y: number; t: number }[] = []

    const canStart = (target: EventTarget | null) => {
      if (closingRef.current || el.scrollTop > 0) return false
      const ta = target instanceof Element ? target.closest('textarea') : null
      if (ta && ta.scrollTop > 0) return false
      return true
    }
    const begin = (x: number, y: number, target: EventTarget | null) => {
      active = canStart(target)
      decided = false
      dragging = false
      startX = x
      startY = y
      cur = 0
      samples = []
    }
    const move = (x: number, y: number, e: Event) => {
      if (!active) return
      const ddy = y - startY
      const ddx = x - startX
      // 맨 위에서 아래로 당기기 시작하면, 아이폰이 화면을 먼저 출렁이지 못하게 바로 막아요
      if (ddy > 0 && el.scrollTop <= 0 && e.cancelable) e.preventDefault()
      if (!decided) {
        if (Math.abs(ddy) < START_SLOP && Math.abs(ddx) < START_SLOP) return
        decided = true
        // 위로 올리거나 옆으로 움직이면 끌기가 아니에요 (스크롤·글자 선택 등)
        if (ddy <= 0 || Math.abs(ddx) > Math.abs(ddy)) {
          active = false
          return
        }
        dragging = true
        ;(document.activeElement as HTMLElement | null)?.blur?.() // 키보드가 떠 있으면 내려요
        startY = y // 판단에 쓴 거리만큼 툭 튀지 않게, 여기서부터 따라가요
      }
      cur = Math.max(0, y - startY)
      const now = performance.now()
      samples.push({ y: cur, t: now })
      samples = samples.filter((p) => now - p.t <= 100) // 최근 0.1초만
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => place(`${cur}px`, Math.max(0, 1 - cur / 500), false))
    }
    const end = () => {
      cancelAnimationFrame(frame)
      if (!active || !dragging) {
        active = false
        return
      }
      active = false
      dragging = false
      const first = samples[0]
      const last = samples[samples.length - 1]
      const speed = first && last && last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0
      if (cur > CLOSE_DISTANCE || (cur > 30 && speed > CLOSE_SPEED)) close()
      else place('0px', 1, true)
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
      cancelAnimationFrame(frame)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', end)
      el.removeEventListener('pointerdown', onMouseDown)
      window.removeEventListener('pointermove', onMouseMove)
      window.removeEventListener('pointerup', onMouseUp)
    }
  }, [sheetRef, place, close])

  return { close }
}
