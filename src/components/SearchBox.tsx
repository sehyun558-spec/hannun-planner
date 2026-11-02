// 검색 입력창 (돋보기 + 글자 지우기 버튼)
import { SearchIcon, CloseIcon } from './Icons'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoFocus?: boolean
}

export function SearchBox({ value, onChange, placeholder, autoFocus }: Props) {
  return (
    <div className="relative flex-1">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="h-12 w-full rounded-xl border border-line bg-card pr-12 pl-11 text-base outline-none transition-colors duration-200 focus:border-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="검색어 지우기"
          className="absolute top-1/2 right-0.5 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
