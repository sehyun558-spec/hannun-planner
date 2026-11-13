// 아래에서 올라오는 작은 창 (시간 고르기, 일정 블록의 완료·☆·수정·삭제 고르기)
// 수정 창(EditSheet)과 똑같이: 아래로 끌어내리거나 뒤 배경·휴대폰 뒤로가기·ESC로 닫혀요.
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useDragToClose } from '../hooks/useDragToClose'
import { useBackClose } from '../hooks/useBackClose'
import { useScrollLock } from '../hooks/useScrollLock'

interface Props {
  /** 화면 읽기 프로그램용 이름 */
  label: string
  /** 닫히는 움직임이 끝난 뒤 불려요 */
  onClose: () => void
  /** close() 를 부르면 부드럽게 내려가며 닫혀요 */
  children: (close: () => void) => ReactNode
}

export function MiniSheet({ label, onClose, children }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLButtonElement>(null)
  const { close } = useDragToClose(sheetRef, backdropRef, onClose)
  useBackClose(close)
  useScrollLock()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label}>
      <button
        ref={backdropRef}
        type="button"
        aria-label="닫기"
        onClick={close}
        className="fadein absolute inset-0 touch-none bg-ink/25"
      />
      <div
        ref={sheetRef}
        className="sheetup relative w-full max-w-md rounded-t-2xl bg-paper px-5 will-change-transform"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        {/* 손잡이 */}
        <div className="-mx-5 flex h-7 cursor-grab touch-none items-center justify-center" aria-hidden>
          <div className="h-1 w-9 rounded-full bg-muted/40" />
        </div>
        {children(close)}
      </div>
    </div>,
    document.body,
  )
}
