import * as React from "react"

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  content: React.ReactNode
  disabled?: boolean
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const { children, disabled, content, ...rest } = props

    if (disabled) return <>{children}</>

    return (
      <div
        ref={ref}
        className="group relative inline-flex"
        {...rest}
      >
        {children}
        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs text-gray-100 shadow-md group-hover:block">
          {content}
        </div>
      </div>
    )
  },
)
