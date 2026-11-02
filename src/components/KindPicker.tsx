// 종류 고르기: [할 일] [일정] [메모]
import type { ItemKind } from '../types'
import { KIND_LABEL } from '../types'

const KINDS: ItemKind[] = ['todo', 'event', 'memo']

export function KindPicker({
  value,
  onChange,
}: {
  value: ItemKind
  onChange: (k: ItemKind) => void
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="종류">
      {KINDS.map((k) => {
        const active = value === k
        return (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(k)}
            className={`h-11 min-w-16 rounded-xl px-4 text-[15px] transition-colors duration-200 ${
              active ? 'border border-line bg-card font-semibold text-ink' : 'border border-transparent text-muted'
            }`}
          >
            {KIND_LABEL[k]}
          </button>
        )
      })}
    </div>
  )
}
