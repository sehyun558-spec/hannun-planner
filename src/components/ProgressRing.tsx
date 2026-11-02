// 날짜 옆의 얇은 원형 진행 표시 (끝낸 만큼 세이지 그린 선이 차올라요)
const R = 10
const C = 2 * Math.PI * R

export function ProgressRing({ done, total }: { done: number; total: number }) {
  const ratio = total === 0 ? 0 : done / total
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 -rotate-90" aria-hidden>
      <circle cx="12" cy="12" r={R} fill="none" stroke="var(--line)" strokeWidth={2} />
      <circle
        cx="12"
        cy="12"
        r={R}
        fill="none"
        stroke="var(--sage)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - ratio)}
        style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}
      />
    </svg>
  )
}
