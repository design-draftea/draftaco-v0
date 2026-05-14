import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

interface UseSlidingActiveIndicatorOptions {
  activeKey: string | null | undefined
  containerRef: RefObject<HTMLElement | null>
  getActiveElement: () => HTMLElement | null | undefined
  readyClassName?: string
  switchingClassName?: string | null
  switchingDurationMs?: number
  clippedClassName?: string | null
  variablePrefix?: string
}

export function setSlidingActiveIndicator(
  containerEl: HTMLElement | null,
  activeEl: HTMLElement | null | undefined,
  readyClassName = 'sliding-chip-group--indicator-ready',
  variablePrefix = 'sliding-chip'
) {
  if (!containerEl || !activeEl) {
    containerEl?.style.setProperty(`--${variablePrefix}-indicator-opacity`, '0')
    containerEl?.style.setProperty(`--${variablePrefix}-indicator-scale`, '0.98')
    containerEl?.classList.remove(readyClassName)
    return
  }

  const containerRect = containerEl.getBoundingClientRect()
  const activeRect = activeEl.getBoundingClientRect()
  const activeX = activeRect.left - containerRect.left + containerEl.scrollLeft
  const activeY = activeRect.top - containerRect.top + containerEl.scrollTop

  containerEl.style.setProperty(`--${variablePrefix}-active-x`, `${activeX}px`)
  containerEl.style.setProperty(`--${variablePrefix}-active-y`, `${activeY}px`)
  containerEl.style.setProperty(`--${variablePrefix}-active-width`, `${activeRect.width}px`)
  containerEl.style.setProperty(`--${variablePrefix}-active-height`, `${activeRect.height}px`)
  containerEl.style.setProperty(`--${variablePrefix}-indicator-opacity`, '1')
  containerEl.style.setProperty(`--${variablePrefix}-indicator-scale`, '1')
  containerEl.classList.add(readyClassName)
}

export function useSlidingActiveIndicator({
  activeKey,
  containerRef,
  getActiveElement,
  readyClassName = 'sliding-chip-group--indicator-ready',
  switchingClassName,
  switchingDurationMs = 520,
  clippedClassName,
  variablePrefix = 'sliding-chip',
}: UseSlidingActiveIndicatorOptions) {
  const getActiveElementRef = useRef(getActiveElement)
  const previousActiveKeyRef = useRef(activeKey)
  const switchingFrameRef = useRef<number | null>(null)
  const switchingResetTimerRef = useRef<number | null>(null)
  const switchingTargetRef = useRef<{ element: HTMLElement; className: string } | null>(null)
  const resolvedSwitchingClassName = switchingClassName === undefined && variablePrefix === 'sliding-chip'
    ? 'sliding-chip-group--indicator-switching'
    : switchingClassName
  const resolvedClippedClassName = clippedClassName === undefined && variablePrefix === 'sliding-chip'
    ? 'sliding-chip-group--indicator-clipped'
    : clippedClassName

  const clearSwitchingMotion = useCallback(() => {
    if (switchingFrameRef.current !== null) {
      window.cancelAnimationFrame(switchingFrameRef.current)
      switchingFrameRef.current = null
    }

    if (switchingResetTimerRef.current !== null) {
      window.clearTimeout(switchingResetTimerRef.current)
      switchingResetTimerRef.current = null
    }

    const target = switchingTargetRef.current
    if (target) {
      target.element.classList.remove(target.className)
      switchingTargetRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    getActiveElementRef.current = getActiveElement
  }, [getActiveElement])

  useLayoutEffect(() => {
    const containerEl = containerRef.current
    const activeEl = getActiveElementRef.current()

    if (resolvedClippedClassName) {
      containerEl?.classList.remove(resolvedClippedClassName)
    }

    setSlidingActiveIndicator(
      containerEl,
      activeEl,
      readyClassName,
      variablePrefix
    )

    const previousActiveKey = previousActiveKeyRef.current
    previousActiveKeyRef.current = activeKey

    if (
      !resolvedSwitchingClassName ||
      !containerEl ||
      !activeEl ||
      previousActiveKey === activeKey ||
      previousActiveKey == null ||
      activeKey == null
    ) {
      if (resolvedClippedClassName && containerEl && activeEl) {
        containerEl.classList.add(resolvedClippedClassName)
      }
      return
    }

    clearSwitchingMotion()
    containerEl.classList.remove(resolvedSwitchingClassName)
    switchingTargetRef.current = {
      element: containerEl,
      className: resolvedSwitchingClassName,
    }

    switchingFrameRef.current = window.requestAnimationFrame(() => {
      switchingFrameRef.current = window.requestAnimationFrame(() => {
        switchingFrameRef.current = null
        containerEl.classList.add(resolvedSwitchingClassName)

        switchingResetTimerRef.current = window.setTimeout(() => {
          containerEl.classList.remove(resolvedSwitchingClassName)
          if (resolvedClippedClassName) {
            containerEl.classList.add(resolvedClippedClassName)
          }
          switchingResetTimerRef.current = null
          switchingTargetRef.current = null
        }, switchingDurationMs)
      })
    })
  }, [
    activeKey,
    clearSwitchingMotion,
    containerRef,
    readyClassName,
    resolvedClippedClassName,
    resolvedSwitchingClassName,
    switchingDurationMs,
    variablePrefix,
  ])

  useEffect(() => () => {
    clearSwitchingMotion()
  }, [clearSwitchingMotion])

  useEffect(() => {
    const containerEl = containerRef.current
    if (!containerEl) return

    const updateIndicator = () => {
      setSlidingActiveIndicator(
        containerEl,
        getActiveElementRef.current(),
        readyClassName,
        variablePrefix
      )
    }
    const activeEl = getActiveElementRef.current()
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateIndicator)
      : null

    resizeObserver?.observe(containerEl)
    if (activeEl) resizeObserver?.observe(activeEl)
    window.addEventListener('resize', updateIndicator)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateIndicator)
    }
  }, [activeKey, containerRef, readyClassName, variablePrefix])
}
