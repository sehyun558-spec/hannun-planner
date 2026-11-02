// 할 일을 끝냈을 때 폰이 아주 짧게 "톡" 진동해요. (지원하지 않는 폰에서는 조용히 넘어가요)
export function haptic() {
  try {
    navigator.vibrate?.(12)
  } catch {
    /* 무시 */
  }
}
