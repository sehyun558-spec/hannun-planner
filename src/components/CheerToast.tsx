// 오늘 할 일을 모두 끝내면 잠깐 떴다 사라지는 따뜻한 문구 (+ 짧은 명언 하나)
import type { Quote } from '../data/quotes'

export function CheerToast({ quote, onDone }: { quote?: Quote; onDone: () => void }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4"
      style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
      role="status"
    >
      <div
        className="softpop max-w-[22rem] rounded-2xl border border-line bg-card px-5 py-3"
        onAnimationEnd={onDone}
      >
        <p className="flex items-center gap-2 text-[15px]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-sage" aria-hidden />
          오늘도 잘 해냈어요
        </p>
        {quote && (
          <p className="font-quote mt-1.5 line-clamp-2 pl-4 text-[15px] leading-[1.6] break-keep text-muted">
            {quote.text}
            {quote.author && <span className="text-[12px]"> — {quote.author}</span>}
          </p>
        )}
      </div>
    </div>
  )
}
