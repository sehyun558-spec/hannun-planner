// 하루싹: 오늘 화면 날짜 옆의 크레파스 마스코트
// - 오늘 완료 비율에 따라 자라요: 0% 새싹(1) / 1~49% 잎(2) / 50~99% 꽃봉오리(3) / 100% 꽃(4)
// - 단계가 바뀌면 통 튀어 오르고, 할 일을 체크하면 하늘색 물방울이 톡 떨어져요
// - 누르면 1.5초 동안 간지러워하며 흔들리고, 작은 말풍선으로 한마디 해요
// - 밤 11시~새벽 5시에는 졸린 하루싹(체크하면 2초 깨어나 자란 모습, 다 끝낸 날은 밤에도 꽃)
// - 오랜만에 오면 "왔다!" 하고 한 번 반겨요
import { useEffect, useRef, useState } from 'react'
import { harussakImg as img, harussakStage } from '../utils/harussak'

const STAGES = [img('1'), img('2'), img('3'), img('4')]
const TICKLE = img('tickle')
const TICKLE_MS = 1500
const TICKLE_LINES = ['간지러워!', '오늘 하나만 같이 해볼까?', '천천히 해도 돼', '물 고마워']
const WELCOME_MS = 2500
const AWAKE_MS = 2000 // 밤에 체크하면 잠깐 깨어나 있는 시간

// 그림이 바뀔 때 깜빡이지 않게, 앱이 켜질 때 미리 불러와 둬요
const SLEEPY = img('sleepy')
const ALL = [...STAGES, TICKLE, SLEEPY, img('pencil'), img('basket')]
if (typeof window !== 'undefined') {
  for (const src of ALL) {
    const i = new Image()
    i.decoding = 'async'
    i.src = src
  }
}

interface Props {
  done: number
  total: number
  /** 밤 11시~새벽 5시이고 아직 남은 일이 있을 때: 졸린 하루싹 (체크하면 잠깐 깨어나요) */
  night?: boolean
  /** 오랜만에 왔으면 "왔다!" 한 번 (다 보여주면 onWelcomed 호출) */
  welcome?: boolean
  onWelcomed?: () => void
}

export function Harussak({ done, total, night = false, welcome = false, onWelcomed }: Props) {
  const stage = harussakStage(done, total)
  const [bounce, setBounce] = useState(welcome ? 1 : 0) // 숫자가 바뀔 때마다 튀어 오르기
  const [drop, setDrop] = useState(0) // 숫자가 바뀔 때마다 물방울
  const [awake, setAwake] = useState(0) // 밤에 잠깐 깨어 있는 중 (0이면 아님)
  const [tickle, setTickle] = useState<{ line: string; n: number } | null>(null)
  const prev = useRef<{ stage: number; done: number } | null>(null)
  const lastLine = useRef('')

  // 단계가 바뀌면 튀어 오르기, 완료 수가 늘면 물방울 (처음 열 때는 안 해요)
  useEffect(() => {
    const p = prev.current
    prev.current = { stage, done }
    if (!p) return
    if (stage !== p.stage) setBounce((b) => b + 1)
    if (done > p.done) {
      setDrop((d) => d + 1)
      // 자고 있을 때 체크하면 잠깐 깨어나서 자란 모습을 보여주고 통 튀어요
      if (night) {
        setAwake((a) => a + 1)
        if (stage === p.stage) setBounce((b) => b + 1)
      }
    }
  }, [stage, done, night])

  // 깨어난 하루싹은 2초 뒤에 다시 잠들어요
  useEffect(() => {
    if (!awake) return
    const t = setTimeout(() => setAwake(0), AWAKE_MS)
    return () => clearTimeout(t)
  }, [awake])

  // 오랜만에 왔으면 "왔다!" 말풍선을 2.5초 동안 한 번만
  const [greeting, setGreeting] = useState(welcome)
  useEffect(() => {
    if (!welcome) return
    setGreeting(true)
    setBounce((b) => b + 1)
    const t = setTimeout(() => {
      setGreeting(false)
      onWelcomed?.()
    }, WELCOME_MS)
    return () => clearTimeout(t)
  }, [welcome, onWelcomed])

  // 간지럼은 1.5초 뒤에 끝나요
  useEffect(() => {
    if (!tickle) return
    const t = setTimeout(() => setTickle(null), TICKLE_MS)
    return () => clearTimeout(t)
  }, [tickle])

  const onTap = () => {
    // 같은 말이 연달아 나오지 않게
    const choices = TICKLE_LINES.filter((l) => l !== lastLine.current)
    const line = choices[Math.floor(Math.random() * choices.length)]
    lastLine.current = line
    setTickle((t) => ({ line, n: (t?.n ?? 0) + 1 }))
  }

  return (
    <div className="relative h-14 w-14 shrink-0">
      <button
        type="button"
        onClick={onTap}
        aria-label={`하루싹${night ? ' (졸려요)' : ''} (오늘 ${total}개 중 ${done}개 완료) 눌러서 간지럽히기`}
        className="relative block h-14 w-14 rounded-xl"
      >
        {/* 튀기·흔들기는 key 가 바뀔 때마다 처음부터 다시 */}
        <span
          key={tickle ? `t${tickle.n}` : `b${bounce}`}
          className={`absolute inset-0 block ${tickle ? 'harussak-wiggle' : bounce ? 'harussak-bounce' : ''}`}
          style={{ transformOrigin: '50% 85%' }}
        >
          <img
            src={tickle ? TICKLE : night && !awake ? SLEEPY : STAGES[stage]}
            alt=""
            width={56}
            height={56}
            draggable={false}
            className="pointer-events-none h-full w-full scale-[1.35] select-none"
            style={{ transformOrigin: '50% 70%' }}
          />
        </span>
      </button>

      {drop > 0 && <span key={`drop-${drop}`} className="harussak-drop" aria-hidden />}

      {(tickle || greeting) && (
        <span
          key={tickle ? `bubble-${tickle.n}` : 'bubble-welcome'}
          role="status"
          className="fadein font-hand absolute top-0 left-full z-10 ml-1 rounded-xl border border-line bg-card px-2.5 py-0.5 text-[16px] leading-snug whitespace-nowrap text-ink"
        >
          {tickle ? tickle.line : '왔다!'}
        </span>
      )}
    </div>
  )
}
