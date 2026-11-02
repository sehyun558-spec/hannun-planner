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
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoFocus={autoFocus}
        enterKeyHint="search"
        className="h-14 w-full rounded-2xl bg-gray-100 pr-12 pl-11 text-lg outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="검색어 지우기"
          className="absolute top-1/2 right-1 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-gray-400"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
