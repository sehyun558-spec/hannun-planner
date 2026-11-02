// 백업: 모든 항목을 파일 하나(.json)로 저장하고, 그 파일로 다시 불러와요.
// 파일은 내 폰의 "다운로드" 폴더 등에 저장되고, 인터넷으로 보내지지 않아요.
import type { Item } from '../types'
import { normalizeItem } from './storage'
import { todayStr } from '../utils/date'

interface BackupFile {
  app: 'hannun-planner'
  version: 1
  exportedAt: string
  items: Item[]
}

/** 백업 파일을 만들어서 내려받게 해요. */
export function exportBackup(items: Item[]): void {
  const data: BackupFile = {
    app: 'hannun-planner',
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hannun-planner-backup-${todayStr()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** 백업 파일을 읽어서 항목 목록으로 바꿔요. 잘못된 파일이면 오류 메시지를 던져요. */
export async function readBackup(file: File): Promise<Item[]> {
  if (file.size > 20 * 1024 * 1024) throw new Error('파일이 너무 커요 (20MB 초과)')
  let data: unknown
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error('백업 파일을 읽을 수 없어요. 한눈 플래너에서 저장한 .json 파일인지 확인해 주세요.')
  }
  const list = (data as Partial<BackupFile>)?.items
  if ((data as Partial<BackupFile>)?.app !== 'hannun-planner' || !Array.isArray(list)) {
    throw new Error('한눈 플래너 백업 파일이 아니에요.')
  }
  return list.map((raw) => normalizeItem(raw as Partial<Item>)).filter((i): i is Item => i !== null)
}
