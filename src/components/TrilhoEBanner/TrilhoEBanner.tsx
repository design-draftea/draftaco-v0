import { BannerCarousel } from '../BannerCarousel'
import './TrilhoEBanner.css'
import type { Banner } from '../../types/home'

interface TrilhoEBannerProps {
  hideBanner?: boolean
  banners?: Banner[]
}

export function TrilhoEBanner({ hideBanner, banners }: TrilhoEBannerProps = {}) {
  if (hideBanner) return null
  return (
    <section className="trilho-e-banner">
      <BannerCarousel banners={banners} />
    </section>
  )
}
