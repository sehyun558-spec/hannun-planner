// 하루싹 계산: 오늘 완료 비율 → 성장 단계와 한마디

/** 완료 비율 → 성장 단계 (0~3) */
export function harussakStage(done: number, total: number): number {
  if (total === 0 || done === 0) return 0
  if (done >= total) return 3
  return done / total < 0.5 ? 1 : 2
}

/** 날짜 아래 하루싹 한마디 */
export function harussakLine(done: number, total: number): string {
  if (total > 0 && done >= total) return '꽃 피었다!'
  if (done > 0) return '잘 하고 있어'
  return '오늘 하나만 같이 해볼까?'
}
