// "오늘 날짜"를 알려줘요. 앱을 켜둔 채 자정이 지나도 자동으로 다음 날로 바뀌어요.
import { useEffect, useState } from 'react'
import { todayStr } from '../utils/date'

export function useToday(): string {
  const [today, setToday] = useState(todayStr)
  useEffect(() => {
    const check = () => setToday(todayStr())
    const timer = setInterval(check, 30_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
  return today
}
