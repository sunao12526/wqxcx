import type { PageList, ProductAttribute, ProductCategory, ProductItem } from './types/app'
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
