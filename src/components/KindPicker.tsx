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
    <div className="flex gap-1 rounded-2xl bg-gray-100 p-1 dark:bg-gray-800" role="radiogroup" aria-label="종류">
      {KINDS.map((k) => {
        const active = value === k
        return (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(k)}
            className={`h-11 flex-1 rounded-xl text-base font-semibold transition-colors ${
              active
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-950 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {KIND_LABEL[k]}
          </button>
        )
      })}
    </div>
  )
}
