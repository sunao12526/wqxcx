import type { CreateOrderPayload, OrderDetail, OrderSummary, PageList } from './types/app'
import { http } from '@/http/http'

export interface OrderQuery {
  _start?: number
  _end?: number
  _sort?: string
  _order?: 'ASC' | 'DESC'
}

export function createOrder(data: CreateOrderPayload) {
  return http.post<{ data: OrderDetail }>('/orders', data).then(res => res.data)
}

export function getMyOrders(query: OrderQuery = {}) {
  return http.get<PageList<OrderSummary>>('/orders/my', {
    _start: query._start ?? 0,
    _end: query._end ?? 20,
    _sort: query._sort ?? 'createdAt',
    _order: query._order ?? 'DESC',
  })
}

export function getMyOrderDetail(id: string) {
  return http.get<{ data: OrderDetail }>(`/orders/my/${id}`).then(res => res.data)
}
