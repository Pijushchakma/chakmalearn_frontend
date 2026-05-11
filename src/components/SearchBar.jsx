import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search by romanization…' }) {
  return (
    <div className="relative group">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-10 py-2.5
          rounded-xl
          border border-gray-200 dark:border-slate-600
          bg-white dark:bg-slate-800/60
          text-gray-800 dark:text-gray-200
          placeholder-gray-300 dark:placeholder-gray-600
          text-sm
          shadow-sm
          outline-none
          ring-0
          transition-all duration-200
          focus:border-indigo-400 dark:focus:border-indigo-500
          focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900
          focus:shadow-md
        "
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            p-0.5 rounded-full
            text-gray-300 hover:text-gray-500
            dark:text-gray-600 dark:hover:text-gray-300
            hover:bg-gray-100 dark:hover:bg-slate-700
            transition-colors
          "
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
