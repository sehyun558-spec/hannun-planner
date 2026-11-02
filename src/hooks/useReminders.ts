// 일정 시간 알림: 앱이 열려 있는 동안 시간이 된 항목을 알려줘요.
// (서버가 없어서 앱을 완전히 닫으면 알림이 오지 않아요)
import { useEffect, useRef } from 'react'
import type { Item } from '../types'
import { formatKoreanTime, todayStr } from '../utils/date'
import { isDoneOn, occursOn } from '../utils/items'

const FIRED_KEY = 'hannun-planner:notified'
const LATE_LIMIT_MIN = 5 // 시간이 지나고 5분 안에 앱을 열어도 알려줘요
const CHECK_MS = 15_000

/** 이미 알린 항목 기록 (같은 알림을 두 번 보내지 않게, 오늘 것만 보관) */
function loadFired(day: string): Set<string> {
  try {
    const list = JSON.parse(localStorage.getItem(FIRED_KEY) ?? '[]') as string[]
    return new Set(list.filter((k) => k.includes(`|${day}|`)))
  } catch {
    return new Set()
  }
}

function saveFired(fired: Set<string>) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify([...fired]))
  } catch {
    /* 무시 */
  }
}

/** 폰(브라우저) 알림 보내기. 권한이 없거나 지원하지 않으면 조용히 넘어가요. */
export async function showSystemNotification(title: string, body: string, tag: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const options: NotificationOptions = { body, tag, icon: `${import.meta.env.BASE_URL}icons/icon-192.png` }
  try {
    // 안드로이드 크롬은 서비스 워커를 통해서만 알림을 보낼 수 있어요 (5단계에서 추가)
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) {
      await reg.showNotification(title, options)
      return
    }
  } catch {
    /* 아래 방법으로 다시 시도 */
  }
  try {
    new Notification(title, options)
  } catch {
    /* 이 브라우저는 앱 안 안내로만 알려줘요 */
  }
}

export function useReminders(items: Item[], enabled: boolean, onFire: (item: Item) => void) {
  const itemsRef = useRef(items)
  const onFireRef = useRef(onFire)
  useEffect(() => {
    itemsRef.current = items
    onFireRef.current = onFire
  })

  useEffect(() => {
    if (!enabled) return
    const check = () => {
      const now = new Date()
      const day = todayStr()
      const nowMin = now.getHours() * 60 + now.getMinutes()
      const fired = loadFired(day)
      let changed = false
      for (const it of itemsRef.current) {
        if (it.kind === 'memo' || !it.time) continue
        if (!occursOn(it, day) || isDoneOn(it, day)) continue
        const [h, m] = it.time.split(':').map(Number)
        const diff = nowMin - (h * 60 + m)
        if (diff < 0 || diff > LATE_LIMIT_MIN) continue
        const key = `${it.id}|${day}|${it.time}`
        if (fired.has(key)) continue
        fired.add(key)
        changed = true
        onFireRef.current(it)
        void showSystemNotification(it.title, `${formatKoreanTime(it.time)} · 한눈 플래너`, key)
      }
      if (changed) saveFired(fired)
    }
    check()
    const timer = setInterval(check, CHECK_MS)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [enabled])
}
