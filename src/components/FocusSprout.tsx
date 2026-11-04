// "오늘 꼭 할 한 가지" 칸 오른쪽의 작은 하루싹 (48px)
// - 할 일이 올라오면 아래에서 쏙 올라와요 (할 일이 바뀌면 다시 쏙)
// - 그 할 일을 완료하면 꽃(4)으로 바뀌며 통 튀어요, 완료를 취소하면 다시 새싹(1)
import { useEffect, useRef, useState } from 'react'
import { harussakImg } from '../utils/harussak'

export function FocusSprout({ done }: { done: boolean }) {
  const [bounce, setBounce] = useState(0)
  const prev = useRef(done)
  useEffect(() => {
    if (prev.current !== done) setBounce((b) => b + 1)
    prev.current = done
  }, [done])

  return (
    // 칸 안에서만 보이게 잘라서, 아래에서 쏙 올라오는 것처럼
    <span className="relative block h-12 w-12 shrink-0 overflow-hidden" aria-hidden>
      <span className="harussak-pop absolute inset-0 block">
        <span key={bounce} className={`block h-full w-full ${bounce ? 'harussak-bounce' : ''}`} style={{ transformOrigin: '50% 85%' }}>
          <img
            src={harussakImg(done ? '4' : '1')}
            alt=""
            width={48}
            height={48}
            draggable={false}
            className="pointer-events-none h-full w-full scale-[1.35] select-none"
            style={{ transformOrigin: '50% 75%' }}
          />
        </span>
      </span>
    </span>
  )
}
