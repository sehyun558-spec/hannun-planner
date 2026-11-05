// 아래에서 올라온 창이 열려 있는 동안 뒤 화면이 같이 스크롤되지 않게 막아요.
// 창이 여러 개 겹쳐도 마지막 창이 닫힐 때 풀려요.
import { useEffect } from 'react'

let count = 0

export function useScrollLock() {
  useEffect(() => {
    const root = document.documentElement
    if (count++ === 0) root.style.overflow = 'hidden'
    return () => {
      if (--count === 0) root.style.overflow = ''
    }
  }, [])
}
