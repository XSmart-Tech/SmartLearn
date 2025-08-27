import React from 'react'

/**
 * Optimized Button component with memo
 */
export const MemoButton = React.memo(React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>((props, ref) => <button ref={ref} {...props} />))

/**
 * Optimized Input component with memo
 */
export const MemoInput = React.memo(React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>((props, ref) => <input ref={ref} {...props} />))

/**
 * Optimized Card component with memo
 */
export const MemoCard = React.memo(React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
)))
