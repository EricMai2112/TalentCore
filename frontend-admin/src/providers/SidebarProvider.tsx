'use client'

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void
  collapse: () => void
  expand: () => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  collapse: () => {},
  expand: () => {},
  toggle: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const collapse = useCallback(() => setIsCollapsed(true), [])
  const expand = useCallback(() => setIsCollapsed(false), [])
  const toggle = useCallback(() => setIsCollapsed((prev) => !prev), [])

  const value = useMemo(
    () => ({ isCollapsed, setIsCollapsed, collapse, expand, toggle }),
    [isCollapsed, collapse, expand, toggle]
  )

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
