import './Navbar.css'

import { productNavbarConfigs } from '../../data/homeProducts'
import type { ProductMode } from '../../types/home'

interface NavbarProps {
  activeProduct?: ProductMode
}

export function Navbar({ activeProduct = 'apostas' }: NavbarProps = {}) {
  const navbarConfig = productNavbarConfigs[activeProduct]

  return (
    <nav className="navbar">
      <div className="navbar__shell">
        <div className="navbar__panel navbar__panel--main">
          <div className="navbar__items">
            {navbarConfig.mainItems.map((item) => {
              const isActive = navbarConfig.activeItemId === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`navbar__item${isActive ? ' navbar__item--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                >
                  <span className="navbar__icon-slot">
                    <img
                      src={item.icon}
                      alt=""
                      className="navbar__icon"
                    />
                  </span>
                  <span className="navbar__label">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="navbar__panel navbar__panel--search">
          <button type="button" className="navbar__item navbar__item--search" aria-label="Buscar">
            <span className="navbar__icon-slot">
              <img src={navbarConfig.searchItem.icon} alt="" className="navbar__icon" />
            </span>
            <span className="navbar__label">{navbarConfig.searchItem.label}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
