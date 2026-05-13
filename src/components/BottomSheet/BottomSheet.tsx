import { useCallback, useEffect, useState, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CaretUpIcon, XIcon } from '@phosphor-icons/react'
import './BottomSheet.css'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  titleIcon?: string
  children: ReactNode
  footerContent?: ReactNode
  blurBackdrop?: boolean
  sheetClassName?: string
  bodyClassName?: string
  hideScrollIndicator?: boolean
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  titleIcon,
  children,
  footerContent,
  blurBackdrop = false,
  sheetClassName = '',
  bodyClassName = '',
  hideScrollIndicator = false,
}: BottomSheetProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<number | null>(null)

  // Check scroll position
  const handleScroll = () => {
    if (!bodyRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
    setShowScrollIndicator(!isAtBottom)
  }

  // Check if content is scrollable on mount/update
  useEffect(() => {
    if (shouldRender && bodyRef.current) {
      const { scrollHeight, clientHeight } = bodyRef.current
      const hasScroll = scrollHeight > clientHeight
      setShowScrollIndicator(hasScroll)
    }
  }, [shouldRender, children])

  // Handle open/close with animation
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isOpen && !isClosing) {
        if (closeTimerRef.current !== null) {
          window.clearTimeout(closeTimerRef.current)
          closeTimerRef.current = null
        }
        setShouldRender(true)
        setIsClosing(false)
      } else if (shouldRender && !isClosing) {
        setIsClosing(true)
        closeTimerRef.current = window.setTimeout(() => {
          setShouldRender(false)
          setIsClosing(false)
          closeTimerRef.current = null
        }, 300)
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isOpen, shouldRender, isClosing])

  const handleClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
    }
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      setShouldRender(false)
      setIsClosing(false)
      closeTimerRef.current = null
      onClose()
    }, 300) // Match animation duration
  }, [onClose])

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [shouldRender, handleClose])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    if (shouldRender) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [shouldRender, handleClose])

  if (!shouldRender) return null

  return createPortal(
    <div className="bottom-sheet__container">
      {/* Overlay - separate from bottom sheet for independent animation */}
      <div
        className={`bottom-sheet__overlay ${blurBackdrop ? 'bottom-sheet__overlay--blur' : ''} ${isClosing ? 'bottom-sheet__overlay--closing' : ''}`}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`bottom-sheet ${sheetClassName} ${isClosing ? 'bottom-sheet--closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className={`bottom-sheet__header ${!title ? 'bottom-sheet__header--no-title' : ''}`}>
          {title ? (
            <div className="bottom-sheet__title">
              {titleIcon && (
                <img src={titleIcon} alt="" className="bottom-sheet__title-icon" />
              )}
              <span>{title}</span>
            </div>
          ) : (
            <span className="bottom-sheet__title-spacer" />
          )}
          <button type="button" className="bottom-sheet__close" onClick={handleClose} aria-label="Fechar">
            <XIcon aria-hidden="true" className="bottom-sheet__close-icon" weight="bold" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="bottom-sheet__body-wrapper">
          <div
            className={`bottom-sheet__body ${bodyClassName}`}
            ref={bodyRef}
            onScroll={handleScroll}
          >
            {children}
          </div>
          {!hideScrollIndicator && (
            <div
              className={`bottom-sheet__scroll-indicator ${showScrollIndicator ? '' : 'bottom-sheet__scroll-indicator--hidden'}`}
            />
          )}
        </div>

        {/* Footer - Fixed */}
        {footerContent && (
          <div className="bottom-sheet__footer">
            {footerContent}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

// Reusable sub-components for mission content
interface MissionObjectiveProps {
  text: string
  completed?: boolean
}

export function MissionObjective({ text, completed = false }: MissionObjectiveProps) {
  return (
    <div className="mission-objective">
      <div className={`mission-objective__radio ${completed ? 'mission-objective__radio--completed' : ''}`}>
        {completed && <span className="mission-objective__check">✓</span>}
      </div>
      <span className="mission-objective__text">{text}</span>
    </div>
  )
}

interface MissionInfoRowProps {
  label: string
  value: string
}

export function MissionInfoRow({ label, value }: MissionInfoRowProps) {
  return (
    <div className="mission-info-row">
      <span className="mission-info-row__label">{label}</span>
      <span className="mission-info-row__value">{value}</span>
    </div>
  )
}

interface MissionFaqItemProps {
  question: string
  answer?: string
  defaultOpen?: boolean
}

export function MissionFaqItem({ question, answer, defaultOpen = false }: MissionFaqItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultOpen)
  
  return (
    <div className={`mission-faq-item ${isExpanded ? 'mission-faq-item--expanded' : ''}`}>
      <button 
        className="mission-faq-item__header" 
        onClick={() => answer && setIsExpanded(!isExpanded)}
      >
        <span className="mission-faq-item__question">{question}</span>
        <CaretUpIcon
          aria-hidden="true"
          className={`mission-faq-item__icon ${isExpanded ? 'mission-faq-item__icon--rotated' : ''}`}
          weight="bold"
        />
      </button>
      {answer && (
        <div className="mission-faq-item__answer-wrapper">
          <p className="mission-faq-item__answer">{answer}</p>
        </div>
      )}
    </div>
  )
}

interface MissionTimerProps {
  text: string
}

export function MissionTimer({ text }: MissionTimerProps) {
  return (
    <div className="mission-timer">
      <div className="mission-timer__dot" />
      <span className="mission-timer__text">{text}</span>
    </div>
  )
}
