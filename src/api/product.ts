import type { PageList, ProductAttribute, ProductCategory, ProductFavoriteStatus, ProductItem } from './types/app'
import { http } from '@/http/http'

export interface ProductQuery {
  _start?: number
  _end?: number
  _sort?: string
  _order?: 'ASC' | 'DESC'
  categoryId?: string
}

export function getProductCategories() {
  return http.get<PageList<ProductCategory>>('/products/categories')
}

export function getProducts(query: ProductQuery = {}) {
  const { categoryId, ...rest } = query
  const filters = categoryId ? { categoryId } : undefined

  return http.get<PageList<ProductItem>>('/products', {
    _start: rest._start ?? 0,
    _end: rest._end ?? 20,
    _sort: rest._sort ?? 'createdAt',
    _order: rest._order ?? 'DESC',
    ...(filters ? { filters } : {}),
  })
}

export function getProductDetail(id: string) {
  return http.get<{ data: ProductItem }>(`/products/${id}`).then(res => res.data)
}

export function getProductAttributes(type: ProductAttribute['type']) {
  return http.get<PageList<ProductAttribute>>('/product-attributes', { type })
}

export function getFavoriteProducts(query: Omit<ProductQuery, 'categoryId'> = {}) {
  return http.get<PageList<ProductItem>>('/product-favorites/my', {
    _start: query._start ?? 0,
    _end: query._end ?? 20,
    _sort: query._sort ?? 'createdAt',
    _order: query._order ?? 'DESC',
  })
}

export function favoriteProduct(productId: string) {
  return http.post<{ data: ProductFavoriteStatus }>(`/product-favorites/${productId}`).then(res => res.data)
}

export function unfavoriteProduct(productId: string) {
  return http.delete<{ data: ProductFavoriteStatus }>(`/product-favorites/${productId}`).then(res => res.data)
}

export async function getProductFavoriteStatus(productId: string) {
  const response = await getFavoriteProducts({ _start: 0, _end: 100 })
  return response.data.some(item => item.id === productId)
}
