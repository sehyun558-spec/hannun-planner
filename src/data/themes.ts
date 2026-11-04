// 테마 목록 — 테마는 여기 한 곳에서만 관리해요.
// ─────────────────────────────────────────────
// 이 목록 하나로 아래 세 가지가 자동으로 만들어져요 (vite.config.ts 의 hannunThemes 참고)
//   1) 테마별 색 덮어쓰기 CSS:  html[data-theme='아이디'] { --paper-morning … --sage }
//   2) index.html 첫 화면 스크립트의 색 표 (앱을 열 때 깜빡임 없이 바로 그 색)
//   3) 설정 화면의 테마 고르기 견본
//
// 테마 추가하는 법: 아래 목록에 한 줄을 더 쓰면 끝이에요.
//   id      영어 소문자 (저장할 때 쓰는 이름, 한 번 정하면 바꾸지 마세요)
//   name    설정에 보이는 이름
//   morning/day/evening  아침(6~11시)/낮(11~18시)/저녁(18시~새벽) 배경색
//   accent  포인트색 (체크 표시, 주요 버튼)
//   locked  true 로 하면 설정에서 🔒 표시가 붙고 고를 수 없어요 (나중에 유료·보상 테마용). 지금은 모두 열려 있어요.
//
// 바뀌지 않는 것: 카드(흰색), 글자색, 보조 글자색, 구분선, 하루싹 그림·물방울·손글씨체
// ─────────────────────────────────────────────

export interface ColorTheme {
  id: string
  name: string
  morning: string
  day: string
  evening: string
  accent: string
  locked?: boolean
}

export const DEFAULT_THEME_ID = 'sage'

export const THEMES: ColorTheme[] = [
  { id: 'sage', name: '세이지', morning: '#fbf3e6', day: '#faf8f5', evening: '#eff1f3', accent: '#4a7c6f' },
  { id: 'ssuk', name: '쑥', morning: '#f8f4e6', day: '#f7f6ef', evening: '#efeee6', accent: '#5a7d55' },
  { id: 'cherry', name: '벚꽃', morning: '#fcf1ee', day: '#fbf5f4', evening: '#f3eded', accent: '#c9788b' },
  { id: 'sky', name: '하늘', morning: '#f4f5ee', day: '#f3f6f8', evening: '#eceff4', accent: '#5b8bb3' },
  { id: 'milktea', name: '밀크티', morning: '#f9f0e3', day: '#f6f0e8', evening: '#efe9e2', accent: '#9a7552' },
  { id: 'lavender', name: '라벤더', morning: '#f8f2f0', day: '#f6f4f9', evening: '#efedf4', accent: '#8676b3' },
]

/** 아이디로 테마 찾기 (없거나 잠긴 테마면 기본 테마) */
export function findTheme(id: string | null | undefined): ColorTheme {
  const t = THEMES.find((x) => x.id === id && !x.locked)
  return t ?? THEMES.find((x) => x.id === DEFAULT_THEME_ID)!
}

/** 테마별 색 덮어쓰기 CSS (빌드할 때 vite.config.ts 가 이걸로 CSS 를 만들어요) */
export function themesCss(): string {
  return THEMES.map(
    (t) =>
      `html[data-theme='${t.id}'] {\n  --paper-morning: ${t.morning};\n  --paper-day: ${t.day};\n  --paper-evening: ${t.evening};\n  --sage: ${t.accent};\n}`,
  ).join('\n')
}

/** 첫 화면 스크립트용 색 표: { 아이디: [아침, 낮, 저녁] } (잠긴 테마는 빼요) */
export function firstPaintTable(): Record<string, [string, string, string]> {
  return Object.fromEntries(THEMES.filter((t) => !t.locked).map((t) => [t.id, [t.morning, t.day, t.evening]]))
}
