import { useState, useEffect, useRef } from 'react'
import './ContentTabs.css'

interface Tab {
  id: string
  label: string
  sectionId: string
}

const tabs: Tab[] = [
  { id: 'promocoes', label: 'Promoções', sectionId: 'section-promocoes' },
  { id: 'ofertas', label: 'Ofertas Imperdíveis', sectionId: 'section-ofertas' },
  { id: 'aovivo', label: 'Ao Vivo', sectionId: 'section-aovivo' },
  { id: 'escadinha', label: 'Escadinha', sectionId: 'section-escadinha' },
  { id: 'breve', label: 'Começa em Breve', sectionId: 'section-breve' },
  { id: 'tesouro', label: 'Tesouro do Pitaco', sectionId: 'section-tesouro' },
  { id: 'ganhando', label: 'Ganhando Agora', sectionId: 'section-ganhando' },
]

export function ContentTabs() {
  const [activeTab, setActiveTab] = useState('promocoes')
  const [isScrollLocked, setIsScrollLocked] = useState(false)
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const isClickScrolling = useRef(false)

  // Scroll spy - detecta qual seção está visível
  useEffect(() => {
    const headerOffset = 120 // Header (80px) + Tabs (40px)

    const handleScroll = () => {
      // Ignora scroll spy durante scroll programático (clique na tab)
      if (isClickScrolling.current) return

      let currentSection = 'promocoes'

      tabs.forEach((tab) => {
        const section = document.getElementById(tab.sectionId)
        if (section) {
          const rect = section.getBoundingClientRect()
          // Se o topo da seção está em ou acima da linha do offset
          if (rect.top <= headerOffset + 10) {
            currentSection = tab.id
          }
        }
      })

      setActiveTab(currentSection)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Chama uma vez no início

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll a tab ativa para ficar visível (apenas quando não é clique)
  useEffect(() => {
    if (isClickScrolling.current) return
    
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [activeTab])

  const handleTabClick = (tab: Tab) => {
    // Ignora clique se já está scrollando
    if (isScrollLocked) return
    
    // Marca que está scrollando por clique
    isClickScrolling.current = true
    setIsScrollLocked(true)
    setActiveTab(tab.id)

    // Scrolla a tab clicada para o centro imediatamente
    const tabElement = tabRefs.current[tab.id]
    if (tabElement) {
      tabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
    
    const section = document.getElementById(tab.sectionId)
    if (section) {
      const headerHeight = 80 // Header fixo
      const tabsHeight = 40 // ContentTabs sticky
      const offset = headerHeight + tabsHeight
      
      const elementPosition = section.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      // Reativa o scroll spy e desbloqueia cliques após o scroll terminar
      setTimeout(() => {
        isClickScrolling.current = false
        setIsScrollLocked(false)
      }, 800) // Tempo suficiente para o scroll smooth terminar
    } else {
      isClickScrolling.current = false
      setIsScrollLocked(false)
    }
  }

  return (
    <div className="content-tabs">
      <div className="content-tabs__list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[tab.id] = el }}
            className={`content-tabs__item ${activeTab === tab.id ? 'content-tabs__item--active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            <span className="content-tabs__label">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
