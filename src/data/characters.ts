// 캐릭터 목록 — 캐릭터는 여기 한 곳에서만 관리해요. (테마 목록 themes.ts 와 같은 방식)
// ─────────────────────────────────────────────
// 캐릭터 추가하는 법: public/images 에 그림 8장(512×512, 투명 배경, 바닥 위치는 하루싹과 같게)을 넣고
// 아래 목록에 한 덩어리를 더 쓰면 끝이에요. 오늘 화면·꼭 할 한 가지·못 한 일 카드·메모 빈 화면·달력이 모두 따라 바뀌어요.
//   id      영어 소문자 (저장할 때 쓰는 이름, 한 번 정하면 바꾸지 마세요). 그림 파일 이름 앞부분이기도 해요 (예: bomi-1.png)
//   name    설정과 화면에 보이는 이름
//   effect  할 일을 체크할 때 효과: 'drop'(하늘색 물방울) / 'petal'(벚꽃잎 한 장)
//   flower  달력 "이번 달 핀 ○ N송이" 의 ○
//   lines   대사 (손글씨체 Gaegu 로 보여요. 새 글자가 생기면 index.css 의 Gaegu 안내를 꼭 보세요)
//   locked  true 로 하면 설정에서 🔒 표시가 붙고 고를 수 없어요 (나중에 유료·보상 캐릭터용). 지금은 모두 열려 있어요.
// ─────────────────────────────────────────────

/** 캐릭터마다 있는 그림 8장: 성장 1~4단계, 졸림, 간지러워, 연필(빈 메모), 바구니(못 한 일) */
export type CharacterImage = '1' | '2' | '3' | '4' | 'sleepy' | 'tickle' | 'pencil' | 'basket'

const IMAGE_NAMES: CharacterImage[] = ['1', '2', '3', '4', 'sleepy', 'tickle', 'pencil', 'basket']

export interface Character {
  id: string
  name: string
  /** 그림 주소 8장 */
  images: Record<CharacterImage, string>
  /** 체크할 때 효과 */
  effect: 'drop' | 'petal'
  /** 달력 "핀 ○ N송이" */
  flower: string
  lines: {
    /** 날짜 아래 한마디: 하나도 안 끝냄 / 일부 / 전부 */
    none: string
    some: string
    all: string
    /** 밤 11시~새벽 5시, 남은 일이 있을 때 */
    night: string
    /** 눌렀을 때 랜덤 말풍선 (연달아 같은 말은 안 나와요) */
    tickle: string[]
    /** 3일 이상 만에 왔을 때 */
    welcome: string
    /** 못 한 일 카드. when = '어제' 또는 '지난' */
    carry: (when: string) => string
  }
  locked?: boolean
}

/** 그림 주소 8장 만들기. missing 에 적은 그림은 아직 파일이 없어서 다른 그림으로 대신해요 */
function images(id: string, missing: Partial<Record<CharacterImage, CharacterImage>> = {}) {
  const base = import.meta.env.BASE_URL
  return Object.fromEntries(
    IMAGE_NAMES.map((n) => [n, `${base}images/${id}-${missing[n] ?? n}.png`]),
  ) as Record<CharacterImage, string>
}

export const DEFAULT_CHARACTER_ID = 'harussak'

export const CHARACTERS: Character[] = [
  {
    id: 'harussak',
    name: '하루싹',
    images: images('harussak'),
    effect: 'drop',
    flower: '꽃',
    lines: {
      none: '오늘 하나만 같이 해볼까?',
      some: '잘 하고 있어',
      all: '꽃 피었다!',
      night: '이제 자도 돼',
      tickle: ['간지러워!', '오늘 하나만 같이 해볼까?', '천천히 해도 돼', '물 고마워'],
      welcome: '왔다!',
      carry: (when) => `${when} 거 내가 챙겨왔어. 오늘로 가져올까?`,
    },
  },
  {
    id: 'bomi',
    name: '봄이',
    // 간지러워(tickle) 그림은 아직 없어서 활짝 핀 모습(4)으로 대신해요.
    // public/images/bomi-tickle.png 를 넣으면 아래 { tickle: '4' } 만 지우면 돼요.
    images: images('bomi', { tickle: '4' }),
    effect: 'petal',
    flower: '벚꽃',
    lines: {
      none: '오늘 하나씩 피워볼까?',
      some: '조금씩 피고 있어',
      all: '활짝 폈다!',
      night: '이제 꽃잎 접고 자자',
      tickle: ['간지러워!', '꽃잎 떨어진다~', '천천히 피어도 돼', '봄바람 같아'],
      welcome: '왔구나!',
      carry: (when) => `${when} 거 내가 담아왔어. 오늘로 가져올까?`,
    },
  },
]

/** 아이디로 캐릭터 찾기 (없거나 잠긴 캐릭터면 하루싹) */
export function findCharacter(id: string | null | undefined): Character {
  const c = CHARACTERS.find((x) => x.id === id && !x.locked)
  return c ?? CHARACTERS.find((x) => x.id === DEFAULT_CHARACTER_ID)!
}

/** 날짜 아래 한마디 (완료 수에 따라) */
export function characterLine(c: Character, done: number, total: number): string {
  if (total > 0 && done >= total) return c.lines.all
  if (done > 0) return c.lines.some
  return c.lines.none
}

// 캐릭터를 바꿀 때 그림이 깜빡이지 않게, 앱이 켜질 때 모든 캐릭터 그림을 미리 불러와 둬요
if (typeof window !== 'undefined') {
  const seen = new Set<string>()
  for (const c of CHARACTERS) {
    for (const src of Object.values(c.images)) {
      if (seen.has(src)) continue
      seen.add(src)
      const i = new Image()
      i.decoding = 'async'
      i.src = src
    }
  }
}
