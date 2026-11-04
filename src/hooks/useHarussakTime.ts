// 하루싹이 시간에 맞춰 반응하게 도와주는 것들
// - useNight: 밤 11시~새벽 5시인지 (졸린 하루싹)
// - useWelcomeBack: 마지막으로 앱을 연 뒤 3일 이상 지나 다시 왔는지 ("왔다!" 한 번)
import { useCallback, useEffect, useState } from 'react'
import { fromDateStr, todayStr } from '../utils/date'

/** 밤 11시 ~ 새벽 5시 */
export function isNight(hour: number): boolean {
  return hour >= 23 || hour < 5
}

export function useNight(): boolean {
  const [night, setNight] = useState(() => isNight(new Date().getHours()))
  useEffect(() => {
    const check = () => setNight(isNight(new Date().getHours()))
    const timer = setInterval(check, 60_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
  return night
}

const VISIT_KEY = 'hannun-planner:last-visit'
const AWAY_DAYS = 3

/**
 * 앱을 열 때마다 "마지막으로 연 날"을 적어 두고,
 * 3일 이상 지나 다시 열었으면 true 를 돌려줘요. (처음 쓰는 사람은 false)
 */
function checkVisit(): boolean {
  const today = todayStr()
  let back = false
  try {
    const last = localStorage.getItem(VISIT_KEY)
    if (last) {
      const days = Math.round((fromDateStr(today).getTime() - fromDateStr(last).getTime()) / 86_400_000)
      back = days >= AWAY_DAYS
    }
    localStorage.setItem(VISIT_KEY, today)
  } catch {
    /* 저장을 못 하면 반기는 인사는 건너뛰어요 */
  }
  return back
}

/** 오랜만에 왔으면 welcome=true. 하루싹이 인사를 마치면 done() 을 불러서 한 번만 보여요 */
export function useWelcomeBack() {
  const [welcome, setWelcome] = useState(checkVisit)
  useEffect(() => {
    // 앱을 끄지 않고 며칠 뒤 다시 열어도(폰 홈 화면 앱) 인사할 수 있게
    const onShow = () => {
      if (document.visibilityState === 'visible' && checkVisit()) setWelcome(true)
    }
    document.addEventListener('visibilitychange', onShow)
    return () => document.removeEventListener('visibilitychange', onShow)
  }, [])
  const done = useCallback(() => setWelcome(false), [])
  return { welcome, done }
}
