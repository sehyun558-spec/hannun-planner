// 오늘 할 일을 모두 끝내면 잠깐 떴다 사라지는 따뜻한 문구
export function CheerToast({ onDone }: { onDone: () => void }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4"
      style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
      role="status"
    >
      <p
        className="softpop flex items-center gap-2 rounded-2xl border border-line bg-card px-5 py-3 text-[15px]"
        onAnimationEnd={onDone}
      >
        <span className="h-2 w-2 rounded-full bg-sage" aria-hidden />
        오늘도 잘 해냈어요
      </p>
    </div>
  )
}
