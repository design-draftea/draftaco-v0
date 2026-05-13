import { useState, useEffect, useRef } from 'react'
import { CaretRightIcon } from '@phosphor-icons/react'
import './TreasureSection.css'

// Format number to Brazilian currency format (without R$)
const formatNumber = (num: number): string => {
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Animated digit component with rolling effect
function AnimatedDigit({ digit }: { digit: string }) {
  const isNumber = /\d/.test(digit)
  
  if (!isNumber) {
    return <span className="treasure-digit treasure-digit--static">{digit}</span>
  }
  
  return (
    <span className="treasure-digit">
      <span 
        className="treasure-digit__inner"
        key={digit} // Only re-render and animate when digit changes
      >
        {digit}
      </span>
    </span>
  )
}

export function TreasureSection() {
  const [displayValue, setDisplayValue] = useState('50.459,23')
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const valueRef = useRef(50459.23)

  // Animate number change with smooth counting
  const animateToValue = (targetValue: number) => {
    const startValue = valueRef.current
    const difference = targetValue - startValue
    const duration = 1000 // 1 second animation
    const steps = 20 // 20 steps = 50ms per step
    const stepDuration = duration / steps
    let currentStep = 0

    const animate = () => {
      currentStep++
      const progress = currentStep / steps
      // Linear for consistent speed during the roll
      const currentValue = startValue + (difference * progress)
      
      setDisplayValue(formatNumber(currentValue))

      if (currentStep < steps) {
        animationRef.current = setTimeout(animate, stepDuration)
      } else {
        const finalValue = formatNumber(targetValue)
        setDisplayValue(finalValue)
        valueRef.current = targetValue
      }
    }

    animate()
  }

  // Increment value every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 451) + 50 // Random between 50 and 500
      const newValue = valueRef.current + increment
      animateToValue(newValue)
    }, 5000)

    return () => {
      clearInterval(interval)
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [])

  return (
    <section id="section-tesouro" className="treasure-section">
      {/* Header */}
      <div className="treasure-section__header">
        <div className="treasure-section__title">
          <span>Tesouro do Pitaco</span>
          <CaretRightIcon aria-hidden="true" className="treasure-section__arrow" weight="bold" />
        </div>
      </div>

      {/* Treasure Box */}
      <div className="treasure-section__box-wrapper">
        <div className="treasure-section__box">
          <div className="treasure-section__content">
            <div className="treasure-section__text">
              <span className="treasure-section__label">Tesouro Acumulado</span>
              <span className="treasure-section__value">
                <span className="treasure-value__prefix">R$ </span>
                <span className="treasure-value__number">
                  {displayValue.split('').map((char, index) => (
                    <AnimatedDigit 
                      key={`${index}-${char}`} // Key includes index to prevent re-using nodes across positions
                      digit={char} 
                    />
                  ))}
                </span>
              </span>
            </div>
            <button className="treasure-section__btn">
              Abra o baú grátis
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
