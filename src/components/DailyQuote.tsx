// 오늘의 한 줄: 날짜·진행 표시 바로 아래, 아이콘·테두리 없이 글자만 (길면 두 줄까지)
import type { Quote } from '../data/quotes'

export function DailyQuote({ quote }: { quote: Quote }) {
  return (
    <p
      className="font-quote line-clamp-2 text-[15px] leading-[1.6] break-keep text-muted"
      aria-label={`오늘의 한 줄: ${quote.text}${quote.author ? `, ${quote.author}` : ''}`}
    >
      {quote.text}
      {quote.author && <span className="text-[12px]"> — {quote.author}</span>}
    </p>
  )
}
