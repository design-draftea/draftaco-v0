import { BannerCarousel } from '../BannerCarousel'
import './TrilhoEBanner.css'
import type { Banner } from '../../types/home'

interface TrilhoEBannerProps {
  hideBanner?: boolean
  banners?: Banner[]
  onBannerClick?: (banner: Banner) => void
}

export function TrilhoEBanner({ hideBanner, banners, onBannerClick }: TrilhoEBannerProps = {}) {
  if (hideBanner) return null
  return (
    <section className="trilho-e-banner">
      <BannerCarousel banners={banners} onBannerClick={onBannerClick} />
    </section>
  )
}
