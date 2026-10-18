import { RrCaretDown } from 'icons/rr/fi-rr-caret-down'
import { useEffect, useRef, useState } from 'react'
import { getFormContext, useController } from 'ui/form'
import { InputError } from 'ui/inputs/error'
import { Popover, PopoverContent, PopoverTrigger } from 'ui/interactive/popover'
import { PopoverContext } from 'ui/interactive/popover-context'
import { clsx, getContext } from 'ui/utils'

function PopoverOptionItem({ option, isSelected, onSelect }) {
  const { setOpen } = getContext(PopoverContext)

  return (
    <div
      onClick={() => {
        onSelect(option)
        setOpen(false)
      }}
      className={clsx(
        'flex cursor-pointer flex-col rounded p-2 text-sm transition-colors',
        isSelected ? 'bg-primary-50 text-primary-900 font-semibold' : 'text-gray-950 hover:bg-gray-100'
      )}>
      <span>{option.label}</span>
      {option.sublabel && <span className="text-xs text-gray-500">{option.sublabel}</span>}
    </div>
  )
}

/**
 * Reusable asynchronous select component with live debounce search,
 * loading spinner, empty state, and automatic label resolution.
 */
export function AsyncSelect({
  name,
  label,
  placeholder = 'Search...',
  disabled = false,
  className,
  rules,
  deps = [],
  fetchOptions,
  getInitialLabel
}) {
  const ctx = getFormContext()
  const {
    field: { onChange, value, ref }
  } = useController({
    name,
    control: ctx.hooks.control,
    rules: ctx.schema?.shape?.[name] ?? rules,
    disabled
  })

  const [query, setQuery] = useState('')
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const fetchOptionsRef = useRef(fetchOptions)
  fetchOptionsRef.current = fetchOptions

  const getInitialLabelRef = useRef(getInitialLabel)
  getInitialLabelRef.current = getInitialLabel

  // Resolve label on value change
  useEffect(() => {
    let active = true
    if (value) {
      if (getInitialLabelRef.current) {
        Promise.resolve(getInitialLabelRef.current(String(value))).then((lbl) => {
          if (active && lbl) setSelectedLabel(lbl)
        })
      } else {
        const found = options.find((o) => o.value === String(value))
        if (found) setSelectedLabel(found.label)
      }
    } else {
      setSelectedLabel('')
    }
    return () => {
      active = false
    }
  }, [value, ...deps])

  // Fetch options asynchronously when popover opens or query changes
  useEffect(() => {
    if (!isOpen && !query) return

    let active = true
    setLoading(true)
    const timer = setTimeout(() => {
      if (!fetchOptionsRef.current) {
        setLoading(false)
        return
      }
      Promise.resolve(fetchOptionsRef.current(query))
        .then((results) => {
          if (active) {
            setOptions(results || [])
            setLoading(false)
          }
        })
        .catch(() => {
          if (active) {
            setOptions([])
            setLoading(false)
          }
        })
    }, 150)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, isOpen, ...deps])

  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-gray-900">{label}</label>}
      <input type="hidden" name={name} value={value ?? ''} ref={ref} disabled={disabled} />
      <Popover
        placement="bottom-start"
        fallbackPlacements={['top-start']}
        onOpenCallback={(open) => setIsOpen(open)}>
        <PopoverTrigger
          className={clsx(
            'outline-focus-select group flex w-full cursor-pointer items-center justify-between rounded border border-gray-200 pr-2 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50',
            className || 'bg-white',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          disabled={disabled}>
          <div className="flex items-center p-2 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
            <span className={selectedLabel ? 'font-medium text-gray-900' : 'text-gray-400'}>
              {selectedLabel || placeholder}
            </span>
          </div>
          <RrCaretDown className="size-4 shrink-0 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
        </PopoverTrigger>
        <InputError name={name} />
        <PopoverContent className="z-50 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter..."
              className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {loading ? (
              <div className="p-3 text-center text-xs text-gray-500">Searching options...</div>
            ) : options.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">No matching options found</div>
            ) : (
              options.map((opt) => (
                <PopoverOptionItem
                  key={opt.value}
                  option={opt}
                  isSelected={String(value) === String(opt.value)}
                  onSelect={(selected) => {
                    onChange(selected.value)
                    ctx.hooks.setValue(name, selected.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    })
                    setSelectedLabel(selected.label)
                    setQuery('')
                  }}
                />
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
