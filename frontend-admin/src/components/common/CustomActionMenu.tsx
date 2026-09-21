'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'

export type ActionItemVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'indigo'
  | 'purple'

export interface CustomActionMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  href?: string
  target?: string
  variant?: ActionItemVariant
  hidden?: boolean
  dividerAbove?: boolean
}

export interface CustomActionMenuProps {
  items: CustomActionMenuItem[]
  triggerIcon?: React.ReactNode
  triggerTitle?: string
  className?: string
  menuWidthClass?: string
}

export default function CustomActionMenu({
  items,
  triggerIcon,
  triggerTitle = 'Thao tác',
  className = '',
  menuWidthClass = 'min-w-[195px]'
}: CustomActionMenuProps) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close menu on window scroll or resize
  useEffect(() => {
    if (!isOpen) return
    const handleClose = () => setIsOpen(false)
    window.addEventListener('scroll', handleClose, true)
    window.addEventListener('resize', handleClose)
    return () => {
      window.removeEventListener('scroll', handleClose, true)
      window.removeEventListener('resize', handleClose)
    }
  }, [isOpen])

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (isOpen) {
      setIsOpen(false)
    } else {
      const buttonRect = e.currentTarget.getBoundingClientRect()
      setRect(buttonRect)
      setIsOpen(true)
    }
  }

  const getItemVariantClasses = (variant?: ActionItemVariant) => {
    switch (variant) {
      case 'primary':
        return 'text-[#3B82F6] hover:bg-blue-50'
      case 'success':
        return 'text-emerald-700 hover:bg-emerald-50'
      case 'warning':
        return 'text-amber-700 hover:bg-amber-50'
      case 'danger':
        return 'text-rose-600 hover:bg-rose-50'
      case 'indigo':
        return 'text-indigo-700 hover:bg-indigo-50'
      case 'purple':
        return 'text-purple-700 hover:bg-purple-50'
      case 'default':
      default:
        return 'text-slate-700 hover:bg-slate-100/80'
    }
  }

  const getItemIconClasses = (variant?: ActionItemVariant) => {
    switch (variant) {
      case 'primary':
        return 'text-[#3B82F6]'
      case 'success':
        return 'text-emerald-600'
      case 'warning':
        return 'text-amber-500'
      case 'danger':
        return 'text-rose-500'
      case 'indigo':
        return 'text-indigo-600'
      case 'purple':
        return 'text-purple-600'
      case 'default':
      default:
        return 'text-slate-500'
    }
  }

  const visibleItems = items.filter((item) => !item.hidden)

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#3B82F6] text-white shadow-xs border border-[#3B82F6]'
            : 'text-slate-400 hover:text-[#3B82F6] hover:bg-white/80 hover:border hover:border-white shadow-2xs'
        }`}
        title={triggerTitle}
      >
        {triggerIcon || <MoreVertical size={16} />}
      </button>

      {/* Floating Action Menu Portal (Rendered at document.body level - Bypasses table overflow & clipping) */}
      {mounted &&
        isOpen &&
        rect &&
        visibleItems.length > 0 &&
        createPortal(
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            />

            {/* Floating Popover Card */}
            <div
              style={{
                position: 'fixed',
                zIndex: 9999,
                right: `${Math.max(12, window.innerWidth - rect.right)}px`,
                ...(window.innerHeight - rect.bottom < 230
                  ? { bottom: `${window.innerHeight - rect.top + 6}px` }
                  : { top: `${rect.bottom + 6}px` })
              }}
              className={`${menuWidthClass} bg-white/95 backdrop-blur-md border border-white/80 rounded-2xl shadow-xl shadow-blue-500/10 p-1.5 text-left animate-in fade-in zoom-in-95 duration-150`}
            >
              {visibleItems.map((item) => {
                const variantClass = getItemVariantClasses(item.variant)
                const iconClass = getItemIconClasses(item.variant)

                return (
                  <React.Fragment key={item.id}>
                    {item.dividerAbove && <div className="my-1 border-t border-slate-100" />}

                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.target}
                        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsOpen(false)
                          if (item.onClick) item.onClick()
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${variantClass}`}
                      >
                        {item.icon && <span className={`${iconClass} shrink-0`}>{item.icon}</span>}
                        <span className="flex-1 truncate">{item.label}</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsOpen(false)
                          if (item.onClick) item.onClick()
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${variantClass}`}
                      >
                        {item.icon && <span className={`${iconClass} shrink-0`}>{item.icon}</span>}
                        <span className=" truncate">{item.label}</span>
                      </button>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </>,
          document.body
        )}
    </div>
  )
}
