import type { HomeBanner, PageList, ProductCategory } from './types/app'
import { http } from '@/http/http'

export function getActiveHomeBanners() {
  return http.get<PageList<HomeBanner>>('/home-banners/active', undefined, undefined, { hideErrorToast: true })
}

export function getHomeCategoriesWithProducts() {
  return http.get<PageList<ProductCategory>>('/products/categories/with-products', undefined, undefined, { hideErrorToast: true })
}
